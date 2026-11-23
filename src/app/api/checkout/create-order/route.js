import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { APP_CONFIG } from "@/lib/constants";
import { generateOrderNumber } from "@/lib/utils";
import { createRazorpayOrder } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

/**
 * POST /api/checkout/create-order
 * Creates a PENDING order record in MongoDB Atlas for the authenticated customer.
 * Enforces:
 * 1. Customer authentication.
 * 2. Idempotency to prevent duplicate orders from repeated submissions.
 * 3. Server-side authoritative price lookup from live MongoDB Atlas records.
 * 4. Verification of stockCount, inStock availability, and variant options (size/color).
 * 5. Server-side recalculation of Subtotal, Shipping, 12% GST, and Final Total.
 * 6. Order paymentStatus remains PENDING.
 */
export async function POST(request) {
  try {
    // 1. Authenticated customer check
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required to checkout. Please sign in." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      items,
      shippingAddress,
      paymentMethod = "RAZORPAY",
      idempotencyKey,
      notes,
    } = body;

    // 2. Validate Cart Non-Empty
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Your shopping bag is empty." },
        { status: 400 }
      );
    }

    // 3. Validate Delivery Address
    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.postalCode
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "A complete delivery address with recipient name, phone, street, city, state, and PIN code is required.",
        },
        { status: 400 }
      );
    }

    // 4. Idempotency Check: Prevent duplicate order creation
    if (idempotencyKey && typeof idempotencyKey === "string") {
      const existingOrder = await prisma.order.findFirst({
        where: {
          idempotencyKey,
          userId: session.user.id,
        },
      });

      if (existingOrder) {
        let rzpOrderId = existingOrder.razorpayOrderId;
        if (!rzpOrderId) {
          const rzp = await createRazorpayOrder({
            amount: Math.round(existingOrder.totalAmount * 100),
            currency: "INR",
            receipt: existingOrder.orderNumber,
            notes: { orderId: existingOrder.id, userId: session.user.id },
          });
          rzpOrderId = rzp.id;
          await prisma.order.update({
            where: { id: existingOrder.id },
            data: { razorpayOrderId: rzpOrderId },
          });
        }

        return NextResponse.json({
          success: true,
          isExisting: true,
          orderId: existingOrder.id,
          orderNumber: existingOrder.orderNumber,
          razorpayOrderId: rzpOrderId,
          amount: Math.round(existingOrder.totalAmount * 100),
          currency: "INR",
          keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
          totalAmount: existingOrder.totalAmount,
          subtotal: existingOrder.subtotal,
          shippingFee: existingOrder.shippingFee,
          tax: existingOrder.tax,
          paymentStatus: existingOrder.paymentStatus,
          message: "Existing order retrieved for this checkout submission.",
        });
      }
    }

    // 5. Query Live Products from MongoDB Atlas via Prisma
    const idList = items
      .map((i) => i.id)
      .filter((id) => id && typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id));
    const slugList = items
      .map((i) => i.slug)
      .filter((s) => typeof s === "string");

    const liveProducts = await prisma.product.findMany({
      where: {
        OR: [
          ...(idList.length > 0 ? [{ id: { in: idList } }] : []),
          ...(slugList.length > 0 ? [{ slug: { in: slugList } }] : []),
        ],
      },
    });

    const productMap = new Map();
    for (const p of liveProducts) {
      productMap.set(p.id, p);
      productMap.set(p.slug, p);
    }

    // 6. Verify Availability, Stock, Variants, and Authoritative Prices
    const verifiedOrderItems = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      const product =
        (item.id && productMap.get(item.id)) ||
        (item.slug && productMap.get(item.slug));

      // Product Existence
      if (!product) {
        return NextResponse.json(
          {
            success: false,
            error: `Product "${item.name || "Item"}" is no longer available in our collection.`,
          },
          { status: 400 }
        );
      }

      // InStock Verification
      if (!product.inStock || product.stockCount <= 0) {
        return NextResponse.json(
          {
            success: false,
            error: `"${product.name}" is currently out of stock.`,
          },
          { status: 400 }
        );
      }

      // Quantity & StockCount Verification
      const requestedQty = Math.max(1, parseInt(item.quantity, 10) || 1);
      if (requestedQty > product.stockCount) {
        return NextResponse.json(
          {
            success: false,
            error: `Only ${product.stockCount} units of "${product.name}" available in stock (requested ${requestedQty}). Please adjust your bag.`,
          },
          { status: 400 }
        );
      }

      // Size Variant Verification
      const chosenSize = item.selectedSize || item.size || "Standard";
      if (product.sizes && product.sizes.length > 0) {
        const itemSize = item.selectedSize || item.size;
        if (!itemSize || !product.sizes.includes(itemSize)) {
          return NextResponse.json(
            {
              success: false,
              error: `Invalid size: Selected size "${itemSize || "None"}" is not available for "${product.name}".`,
            },
            { status: 400 }
          );
        }
      }

      // Color Variant Verification
      const rawColor = item.selectedColor || item.color;
      const chosenColor = (typeof rawColor === "object" ? rawColor?.name : rawColor) || "Standard";
      if (product.colors && product.colors.length > 0) {
        const hasColor = product.colors.some(
          (c) => c.name.toLowerCase() === chosenColor.toLowerCase()
        );
        if (!hasColor && chosenColor !== "Standard") {
          return NextResponse.json(
            {
              success: false,
              error: `Invalid colour: Selected colour "${chosenColor}" is not available for "${product.name}".`,
            },
            { status: 400 }
          );
        }
      }

      // Authoritative Price from MongoDB Atlas (never trust client)
      const unitPrice = product.price;
      const lineTotal = unitPrice * requestedQty;
      calculatedSubtotal += lineTotal;

      verifiedOrderItems.push({
        productId: product.id,
        name: product.name,
        image: item.image || product.images?.[0] || "",
        size: chosenSize,
        color: chosenColor,
        price: unitPrice,
        quantity: requestedQty,
        total: lineTotal,
      });
    }

    // 7. Calculate Server-Side Subtotal, Shipping, GST, and Total
    const subtotal = calculatedSubtotal;
    const shippingFee =
      subtotal >= APP_CONFIG.freeShippingThreshold ? 0 : APP_CONFIG.defaultShippingFee;
    const tax = Math.round(subtotal * APP_CONFIG.taxRate);
    const totalAmount = subtotal + shippingFee + tax;

    // 8. Generate Guaranteed Unique Order Number (Format: VA-YYYYMMDD-XXXX)
    const now = new Date();
    const datePrefix = `VA-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    let orderNumber = `${datePrefix}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    let existingOrderNum = await prisma.order.findUnique({ where: { orderNumber } });
    while (existingOrderNum) {
      orderNumber = `${datePrefix}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      existingOrderNum = await prisma.order.findUnique({ where: { orderNumber } });
    }

    // 9. Format Shipping Address
    const formattedShippingAddress = {
      fullName: shippingAddress.fullName.trim(),
      phone: shippingAddress.phone.trim(),
      houseNumber: (shippingAddress.houseNumber || "").trim(),
      street: shippingAddress.street.trim(),
      landmark: (shippingAddress.landmark || "").trim() || null,
      city: shippingAddress.city.trim(),
      state: shippingAddress.state.trim(),
      postalCode: shippingAddress.postalCode.trim(),
      country: (shippingAddress.country || "India").trim(),
      isDefault: Boolean(shippingAddress.isDefault),
    };

    // 10. Persist PENDING Order to MongoDB Atlas
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        items: verifiedOrderItems,
        shippingAddress: formattedShippingAddress,
        paymentMethod: paymentMethod || "RAZORPAY",
        paymentStatus: "PENDING", // DO NOT mark as paid at checkout
        orderStatus: "PROCESSING",
        subtotal,
        shippingFee,
        tax,
        discount: 0,
        totalAmount,
        notes: (notes || "").trim() || null,
        idempotencyKey: idempotencyKey || null,
      },
    });

    // 11. Create Razorpay Order securely on server (Never trust client prices)
    const rzpOrder = await createRazorpayOrder({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: order.orderNumber,
      notes: { orderId: order.id, userId: session.user.id },
    });

    // Update order with razorpayOrderId
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: rzpOrder.id },
    });

    return NextResponse.json({
      success: true,
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount, // in paise
      currency: rzpOrder.currency || "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
      totalAmount: updatedOrder.totalAmount,
      subtotal: updatedOrder.subtotal,
      shippingFee: updatedOrder.shippingFee,
      tax: updatedOrder.tax,
      paymentStatus: updatedOrder.paymentStatus,
      items: updatedOrder.items,
      shippingAddress: updatedOrder.shippingAddress,
      message: "Order placed successfully. Razorpay checkout ready.",
    });
  } catch (error) {
    console.error("POST /api/checkout/create-order error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initialize order. Please try again." },
      { status: 500 }
    );
  }
}

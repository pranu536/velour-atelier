import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { APP_CONFIG } from "@/lib/constants";

export const dynamic = "force-dynamic";

/**
 * POST /api/cart/validate
 * Validates stock, availability, variant options, and recalculates authoritative
 * prices and totals directly from MongoDB Atlas.
 * Never trusts prices or quantities submitted by the browser.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "Cart items must be an array." },
        { status: 400 }
      );
    }

    if (items.length === 0) {
      return NextResponse.json({
        success: true,
        valid: true,
        items: [],
        subtotal: 0,
        shippingFee: 0,
        tax: 0,
        total: 0,
        issues: [],
      });
    }

    // Extract product IDs and slugs
    const idList = items
      .map((i) => i.id)
      .filter((id) => id && typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id));
    const slugList = items
      .map((i) => i.slug)
      .filter((s) => s && typeof s === "string");

    // Fetch live products from MongoDB Atlas via Prisma
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

    const verifiedItems = [];
    const issues = [];

    for (const item of items) {
      const product =
        (item.id && productMap.get(item.id)) ||
        (item.slug && productMap.get(item.slug));

      // 1. Check Product Existence
      if (!product) {
        issues.push({
          type: "NOT_FOUND",
          itemId: item.id || item.slug,
          itemName: item.name || "Product",
          message: `"${item.name || "Product"}" is no longer available in our collection.`,
        });
        continue;
      }

      // 2. Check inStock status
      if (!product.inStock || product.stockCount <= 0) {
        issues.push({
          type: "OUT_OF_STOCK",
          itemId: product.id,
          itemName: product.name,
          message: `"${product.name}" is currently sold out.`,
        });
        continue;
      }

      // 3. Check Quantity and Available Stock
      let validQuantity = Math.max(1, parseInt(item.quantity, 10) || 1);
      if (validQuantity > product.stockCount) {
        issues.push({
          type: "INSUFFICIENT_STOCK",
          itemId: product.id,
          itemName: product.name,
          requested: validQuantity,
          available: product.stockCount,
          message: `Only ${product.stockCount} unit(s) of "${product.name}" available. Quantity adjusted.`,
        });
        validQuantity = product.stockCount;
      }

      // 4. Validate Size Selection
      if (product.sizes && product.sizes.length > 0) {
        if (!item.selectedSize || !product.sizes.includes(item.selectedSize)) {
          issues.push({
            type: "INVALID_SIZE",
            itemId: product.id,
            itemName: product.name,
            selectedSize: item.selectedSize,
            availableSizes: product.sizes,
            message: `Selected size "${item.selectedSize || "None"}" is invalid for "${product.name}".`,
          });
        }
      }

      // 5. Validate Color Selection
      if (product.colors && product.colors.length > 0) {
        const hasValidColor = product.colors.some(
          (c) =>
            item.selectedColor?.name &&
            c.name.toLowerCase() === item.selectedColor.name.toLowerCase()
        );
        if (!item.selectedColor || !hasValidColor) {
          issues.push({
            type: "INVALID_COLOR",
            itemId: product.id,
            itemName: product.name,
            selectedColor: item.selectedColor?.name,
            message: `Selected color "${item.selectedColor?.name || "None"}" is invalid for "${product.name}".`,
          });
        }
      }

      // 6. Price verification (Recalculate with live DB price)
      if (item.price && Number(item.price) !== Number(product.price)) {
        issues.push({
          type: "PRICE_ADJUSTED",
          itemId: product.id,
          itemName: product.name,
          oldPrice: item.price,
          newPrice: product.price,
          message: `Price for "${product.name}" updated to ₹${product.price.toLocaleString("en-IN")}.`,
        });
      }

      verifiedItems.push({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price, // Live database price (authoritative)
        compareAtPrice: product.compareAtPrice,
        image: item.image || product.images?.[0] || "",
        selectedSize: item.selectedSize || product.sizes?.[0] || "Standard",
        selectedColor: item.selectedColor || product.colors?.[0] || { name: "Standard" },
        quantity: validQuantity,
        inStock: product.inStock && product.stockCount > 0,
        availableStock: product.stockCount,
        lineSubtotal: product.price * validQuantity,
      });
    }

    // Server-side calculation of subtotals and totals
    const subtotal = verifiedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shippingFee =
      subtotal === 0 || subtotal >= APP_CONFIG.freeShippingThreshold
        ? 0
        : APP_CONFIG.defaultShippingFee;
    const tax = Math.round(subtotal * APP_CONFIG.taxRate);
    const total = subtotal + shippingFee + tax;

    const isValid = issues.filter(
      (i) => i.type === "OUT_OF_STOCK" || i.type === "NOT_FOUND" || i.type === "INVALID_SIZE" || i.type === "INVALID_COLOR"
    ).length === 0;

    return NextResponse.json({
      success: true,
      valid: isValid,
      items: verifiedItems,
      subtotal,
      shippingFee,
      tax,
      total,
      issues,
    });
  } catch (error) {
    console.error("Cart validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate cart with database." },
      { status: 500 }
    );
  }
}


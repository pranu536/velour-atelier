import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { verifyRazorpaySignature } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

/**
 * POST /api/checkout/verify
 * Server-side cryptographic payment verification for Razorpay.
 * Enforces:
 * 1. Customer authentication & order ownership (prevents paying for another user's order).
 * 2. HMAC SHA256 cryptographic signature verification.
 * 3. Idempotency (handles duplicate verification requests safely without multiple writes).
 * 4. Atomic status transition: paymentStatus -> "PAID", orderStatus -> "CONFIRMED".
 * 5. Rejection of unverified or tampered payment attempts.
 */
export async function POST(request) {
  try {
    // 1. Authenticate Customer
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required to verify payment." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderNumber,
      orderId,
      status: paymentAttemptStatus,
      errorMessage,
    } = body;

    // Support recording explicit payment failure / cancellation from checkout
    if (paymentAttemptStatus === "failed" || paymentAttemptStatus === "cancelled") {
      const targetIdentifier = orderId || orderNumber;
      if (targetIdentifier) {
        const existingOrder = await prisma.order.findFirst({
          where: {
            OR: [
              ...(orderId && /^[0-9a-fA-F]{24}$/.test(orderId) ? [{ id: orderId }] : []),
              ...(orderNumber ? [{ orderNumber }] : []),
            ],
            userId: session.user.id,
          },
        });

        if (existingOrder && existingOrder.paymentStatus !== "PAID") {
          await prisma.order.update({
            where: { id: existingOrder.id },
            data: {
              paymentStatus: "FAILED",
              notes: errorMessage ? `Payment attempt failed: ${errorMessage}` : existingOrder.notes,
            },
          });
        }
      }

      return NextResponse.json({
        success: false,
        error: errorMessage || "Payment was not completed. You may retry your payment.",
        paymentStatus: "FAILED",
      });
    }

    // 2. Validate Required Verification Parameters
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required payment verification parameters (order ID, payment ID, or signature).",
        },
        { status: 400 }
      );
    }

    if (!orderNumber && !orderId) {
      return NextResponse.json(
        { success: false, error: "Internal order reference (orderNumber or orderId) is required." },
        { status: 400 }
      );
    }

    // 3. Retrieve Live Database Order with Ownership Guard
    const isObjectId = orderId && typeof orderId === "string" && /^[0-9a-fA-F]{24}$/.test(orderId);
    const orderConditions = [];
    if (isObjectId) orderConditions.push({ id: orderId });
    if (orderNumber) orderConditions.push({ orderNumber });

    const order = await prisma.order.findFirst({
      where: {
        OR: orderConditions,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found in atelier system." },
        { status: 404 }
      );
    }

    // Ownership check: Prevent customer A from verifying / claiming customer B's order
    if (order.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Access denied. You cannot verify or pay for another customer's order." },
        { status: 403 }
      );
    }

    // Association check: Verify razorpayOrderId matches what was recorded on the order
    if (order.razorpayOrderId && order.razorpayOrderId !== razorpayOrderId) {
      return NextResponse.json(
        { success: false, error: "Razorpay order ID mismatch for this order." },
        { status: 400 }
      );
    }

    // 4. Idempotency Check: Already verified & paid
    if (order.paymentStatus === "PAID") {
      return NextResponse.json({
        success: true,
        isAlreadyPaid: true,
        message: "Order has already been confirmed as paid.",
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentId: order.razorpayPaymentId || razorpayPaymentId,
        paymentStatus: "PAID",
        orderStatus: order.orderStatus,
      });
    }

    // 5. Cryptographic Signature Verification using HMAC SHA256
    const isValidSignature = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValidSignature) {
      // Mark as failed in database for audit trail
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "FAILED",
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: "Cryptographic signature verification failed. Payment cannot be verified.",
        },
        { status: 400 }
      );
    }

    // 6. Signature Verified! Update MongoDB Order Status Atomically
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        orderStatus: "CONFIRMED",
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment successfully verified and order confirmed.",
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      paymentId: razorpayPaymentId,
      paymentStatus: "PAID",
      orderStatus: "CONFIRMED",
    });
  } catch (error) {
    console.error("POST /api/checkout/verify error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "An error occurred during payment verification." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/razorpay
 * Secure Razorpay Webhook Handler
 * 
 * Verifies X-Razorpay-Signature with RAZORPAY_WEBHOOK_SECRET.
 * Handles:
 * - order.paid: Marks order as PAID and CONFIRMED.
 * - payment.captured: Confirms payment and updates order.
 * - payment.failed: Marks payment attempt as FAILED.
 * Enforces strict idempotency to handle duplicate webhook deliveries safely.
 */
export async function POST(request) {
  try {
    // 1. Read raw body as text for cryptographic HMAC signature verification
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { success: false, error: "Missing x-razorpay-signature header" },
        { status: 400 }
      );
    }

    // 2. Cryptographic Signature Verification
    const isValidSignature = verifyRazorpayWebhookSignature(rawBody, signature);
    if (!isValidSignature) {
      console.warn("⚠️ Invalid Razorpay webhook signature received.");
      return NextResponse.json(
        { success: false, error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    // 3. Parse Webhook Event JSON
    let event;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, error: "Malformed webhook payload" },
        { status: 400 }
      );
    }

    const { event: eventName, payload } = event;
    console.log(`[Webhook] Processing verified Razorpay event: "${eventName}"`);

    // Extract identifiers across various Razorpay payload shapes
    const rzpOrder = payload?.order?.entity;
    const rzpPayment = payload?.payment?.entity;

    const razorpayOrderId = rzpOrder?.id || rzpPayment?.order_id;
    const razorpayPaymentId = rzpPayment?.id;
    const receipt = rzpOrder?.receipt || rzpPayment?.notes?.receipt;
    const notesOrderId = rzpOrder?.notes?.orderId || rzpPayment?.notes?.orderId;

    // 4. Locate internal order in MongoDB Atlas
    const orderConditions = [];
    if (razorpayOrderId) orderConditions.push({ razorpayOrderId });
    if (receipt) orderConditions.push({ orderNumber: receipt });
    if (notesOrderId && /^[0-9a-fA-F]{24}$/.test(notesOrderId)) {
      orderConditions.push({ id: notesOrderId });
    }

    if (orderConditions.length === 0) {
      // Nothing to match, acknowledge safely
      return NextResponse.json({ received: true, notice: "No order identifier present in event" });
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: orderConditions,
      },
    });

    if (!order) {
      console.warn(`[Webhook] Order not found for identifiers: ${JSON.stringify(orderConditions)}`);
      // Acknowledge with 200 so Razorpay does not endlessly retry for obsolete/external orders
      return NextResponse.json({ received: true, notice: "Order not found" });
    }

    // 5. Handle Specific Events Idempotently
    switch (eventName) {
      case "order.paid":
      case "payment.captured": {
        // Idempotency: If already marked PAID, safely return without re-writing
        if (order.paymentStatus === "PAID") {
          return NextResponse.json({
            received: true,
            isIdempotent: true,
            message: "Order already confirmed as PAID",
            orderNumber: order.orderNumber,
          });
        }

        // Update Order to PAID and CONFIRMED
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "PAID",
            orderStatus: "CONFIRMED",
            razorpayOrderId: razorpayOrderId || order.razorpayOrderId,
            razorpayPaymentId: razorpayPaymentId || order.razorpayPaymentId,
          },
        });

        console.log(`[Webhook] ✓ Order ${order.orderNumber} successfully marked PAID via "${eventName}"`);
        break;
      }

      case "payment.failed": {
        // Do not overwrite already paid orders
        if (order.paymentStatus === "PAID") {
          return NextResponse.json({
            received: true,
            notice: "Order was already marked PAID; ignoring failed retry event",
          });
        }

        const failureReason =
          rzpPayment?.error_description ||
          rzpPayment?.error_reason ||
          "Payment processing failed at gateway";

        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "FAILED",
            notes: `Gateway failure: ${failureReason}`,
          },
        });

        console.log(`[Webhook] ⚠ Order ${order.orderNumber} updated to FAILED: ${failureReason}`);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event "${eventName}" acknowledged safely.`);
        break;
    }

    return NextResponse.json({ received: true, event: eventName, orderNumber: order.orderNumber });
  } catch (error) {
    console.error("POST /api/webhooks/razorpay error:", error);
    return NextResponse.json(
      { success: false, error: "Internal webhook processing error" },
      { status: 500 }
    );
  }
}


import Razorpay from "razorpay";
import crypto from "crypto";

/**
 * Initialize Razorpay server-side SDK instance
 */
export const razorpayInstance = process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "",
    })
  : null;

/**
 * Verify Razorpay HMAC SHA256 Signature
 * Never expose RAZORPAY_KEY_SECRET to the client
 */
export function verifyRazorpaySignature(orderId, paymentId, signature) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return expectedSignature === signature;
}


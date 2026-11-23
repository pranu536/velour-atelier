import Razorpay from "razorpay";
import crypto from "crypto";

const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || keySecret;

const isMockEnabled =
  process.env.NEXT_PUBLIC_ENABLE_MOCK_PAYMENT === "true" ||
  keyId.includes("placeholder") ||
  keySecret.includes("placeholder") ||
  !keySecret;

/**
 * Initialize official Razorpay server-side SDK instance
 */
export const razorpayInstance =
  keyId && keySecret && !isMockEnabled
    ? new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      })
    : null;

/**
 * Create a Razorpay Order securely on the server
 * @param {Object} params
 * @param {number} params.amount - Amount in paise (e.g., ₹1,000 = 100000 paise)
 * @param {string} params.currency - Currency code (default: "INR")
 * @param {string} params.receipt - Internal order number reference
 * @param {Object} [params.notes] - Key-value metadata
 */
export async function createRazorpayOrder({ amount, currency = "INR", receipt, notes = {} }) {
  if (!amount || amount <= 0) {
    throw new Error("Invalid order amount for Razorpay order creation.");
  }

  // Ensure amount is integer paise
  const amountInPaise = Math.round(amount);

  // If live or registered Razorpay test keys are present
  if (razorpayInstance && !isMockEnabled) {
    try {
      const order = await razorpayInstance.orders.create({
        amount: amountInPaise,
        currency,
        receipt: receipt.slice(0, 40), // Razorpay receipt max 40 chars
        notes,
      });
      return {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
        isMock: false,
      };
    } catch (err) {
      console.error("Razorpay SDK order creation error:", err);
      // If network fails or invalid test key, fail explicitly or fallback if mock enabled
      if (!isMockEnabled) {
        throw new Error(err.description || err.message || "Failed to create Razorpay order");
      }
    }
  }

  // Safe Mock / Local Evaluation Mode
  const mockId = `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  return {
    id: mockId,
    amount: amountInPaise,
    currency,
    receipt,
    status: "created",
    isMock: true,
  };
}

/**
 * Verify Razorpay payment signature using HMAC SHA256 with timing-safe comparison
 * Payload format: `${razorpayOrderId}|${razorpayPaymentId}`
 */
export function verifyRazorpaySignature(orderId, paymentId, signature) {
  if (!orderId || !paymentId || !signature) {
    return false;
  }

  // Compute expected HMAC SHA256 using key secret
  const secret = process.env.RAZORPAY_KEY_SECRET || "placeholder_secret_key";
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  // Accept exact HMAC SHA256 signature
  if (expectedSignature.length === signature.length) {
    try {
      const isMatch = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, "utf8"),
        Buffer.from(signature, "utf8")
      );
      if (isMatch) return true;
    } catch {
      // Length mismatch safety
    }
  }

  // Also accept mock simulation signature if mock mode is active
  if (
    isMockEnabled &&
    (signature === "mock_signature_verified" || signature.startsWith("mock_sig_"))
  ) {
    return true;
  }

  return false;
}

/**
 * Verify Razorpay Webhook signature using HMAC SHA256 with timing-safe comparison
 * @param {string|Buffer} rawBody - Exact raw request payload (not parsed JSON)
 * @param {string} signature - Incoming X-Razorpay-Signature header
 */
export function verifyRazorpayWebhookSignature(rawBody, signature) {
  if (!rawBody || !signature) {
    return false;
  }

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || "velour_test_webhook_secret_2026";
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (expectedSignature.length !== signature.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "utf8"),
      Buffer.from(signature, "utf8")
    );
  } catch {
    return false;
  }
}

/**
 * Helper to generate valid HMAC SHA256 signatures for testing
 */
export function generateTestPaymentSignature(orderId, paymentId, secret = keySecret) {
  return crypto
    .createHmac("sha256", secret || "placeholder_secret_key")
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
}

/**
 * Helper to generate valid Webhook HMAC SHA256 signatures for testing
 */
export function generateTestWebhookSignature(payloadString, secret = webhookSecret) {
  return crypto
    .createHmac("sha256", secret || "velour_test_webhook_secret_2026")
    .update(payloadString)
    .digest("hex");
}

/**
 * Velour Atelier - Razorpay Payment Integration Test Suite
 * Comprehensive automated verification for:
 * 1. Razorpay Order Creation on server from pending DB order (in paise)
 * 2. Razorpay Key Secret protection (never returned to client)
 * 3. Server-side HMAC SHA256 cryptographic signature verification
 * 4. Rejection of tampered / invalid signatures
 * 5. Customer Ownership & Isolation (403 for unauthorized users)
 * 6. Webhook Signature Verification with RAZORPAY_WEBHOOK_SECRET
 * 7. Rejection of unauthenticated or forged webhooks (400)
 * 8. Webhook event handling: order.paid, payment.captured, payment.failed
 * 9. Idempotency across duplicate verification calls and duplicate webhooks
 * 10. Atomic status transition: paymentStatus -> PAID, orderStatus -> CONFIRMED
 * 11. Protection against overwriting PAID status on late failed retry events
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Load .env.local
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  });
}

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const BASE_URL = "http://localhost:3000";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "placeholder_secret_key";
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "velour_test_webhook_secret_2026";

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = "") {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${details ? "- " + details : ""}`);
    failedTests++;
  }
}

/**
 * Generate authentic HMAC SHA256 payment signature
 */
function computePaymentSignature(orderId, paymentId, secret = KEY_SECRET) {
  return crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
}

/**
 * Generate authentic HMAC SHA256 webhook signature
 */
function computeWebhookSignature(rawBody, secret = WEBHOOK_SECRET) {
  return crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
}

/**
 * Helper to authenticate against NextAuth credentials endpoint
 */
async function loginCustomer(email, password) {
  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
  const csrfCookies = csrfRes.headers.getSetCookie
    ? csrfRes.headers.getSetCookie()
    : [csrfRes.headers.get("set-cookie") || ""];
  const { csrfToken } = await csrfRes.json();

  const cookieStr = csrfCookies.map((c) => c.split(";")[0]).join("; ");

  const authRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookieStr,
    },
    body: new URLSearchParams({
      csrfToken,
      email,
      password,
      json: "true",
    }).toString(),
  });

  const authCookies = authRes.headers.getSetCookie
    ? authRes.headers.getSetCookie()
    : [authRes.headers.get("set-cookie") || ""];

  const sessionTokenCookie = authCookies.find((c) =>
    c.includes("next-auth.session-token=")
  );
  if (!sessionTokenCookie) {
    throw new Error(`Failed to obtain session token for ${email}`);
  }

  return sessionTokenCookie.split(";")[0];
}

async function runRazorpayTestSuite() {
  console.log("==================================================================");
  console.log("       VELOUR ATELIER - RAZORPAY PAYMENT INTEGRATION TESTS        ");
  console.log("==================================================================\n");

  const createdOrderIds = [];

  try {
    // -------------------------------------------------------------
    // SECTION 1: Product & Customer Setup
    // -------------------------------------------------------------
    console.log("[SECTION 1: Test Environment & Database Baseline]");
    const products = await prisma.product.findMany({
      where: { inStock: true, stockCount: { gt: 5 } },
      take: 2,
    });
    assert(products.length >= 2, "Found in-stock products in MongoDB Atlas");
    const p1 = products[0];

    const customerCookie = await loginCustomer("demo@velour.com", "User@Velour2026");
    assert(!!customerCookie, "Authenticated primary customer (demo@velour.com)");

    const secondUserCookie = await loginCustomer("secondary.test.user@velour.com", "SecondaryPass@2024");
    assert(!!secondUserCookie, "Authenticated secondary customer for ownership checks");

    const validAddress = {
      fullName: "Aria Thorne",
      phone: "+91 9876543210",
      houseNumber: "Villa 12",
      street: "Palm Avenue, Koramangala",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560034",
      country: "India",
    };
    console.log();

    // -------------------------------------------------------------
    // SECTION 2: Razorpay Order Creation & Secret Protection
    // -------------------------------------------------------------
    console.log("[SECTION 2: Server-Side Razorpay Order Creation & Secret Safety]");

    const createOrderRes = await fetch(`${BASE_URL}/api/checkout/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: customerCookie,
      },
      body: JSON.stringify({
        items: [{ id: p1.id, quantity: 1, size: p1.sizes[0], color: p1.colors[0] }],
        shippingAddress: validAddress,
        idempotencyKey: `idem_rzp_${Date.now()}`,
      }),
    });

    const createOrderData = await createOrderRes.json();
    assert(createOrderRes.status === 200 && createOrderData.success, "Order and Razorpay order created successfully");

    if (createOrderData.orderId) createdOrderIds.push(createOrderData.orderId);

    // Verify Secret is NEVER exposed to client
    assert(
      createOrderData.keySecret === undefined &&
        createOrderData.secret === undefined &&
        !JSON.stringify(createOrderData).includes(KEY_SECRET),
      "Razorpay Key Secret is NEVER exposed in the API response or client payload"
    );

    // Verify Key ID is returned
    assert(
      !!createOrderData.keyId,
      `Razorpay Key ID provided for checkout modal: ${createOrderData.keyId}`
    );

    // Verify Amount in Paise
    const expectedPaise = Math.round(createOrderData.totalAmount * 100);
    assert(
      createOrderData.amount === expectedPaise,
      `Order amount formatted in paise on server: ${createOrderData.amount} paise (₹${createOrderData.totalAmount})`
    );

    // Verify razorpayOrderId is persisted on MongoDB order
    const persistedOrder = await prisma.order.findUnique({
      where: { id: createOrderData.orderId },
    });
    assert(
      persistedOrder.razorpayOrderId === createOrderData.razorpayOrderId,
      `razorpayOrderId persisted to MongoDB Atlas: ${persistedOrder.razorpayOrderId}`
    );
    assert(
      persistedOrder.paymentStatus === "PENDING",
      "Order paymentStatus is initially PENDING before verification"
    );
    console.log();

    // -------------------------------------------------------------
    // SECTION 3: Cryptographic Signature Verification (/api/checkout/verify)
    // -------------------------------------------------------------
    console.log("[SECTION 3: Server-Side HMAC SHA256 Signature Verification]");

    const testPaymentId = `pay_test_${Date.now()}`;
    const validSignature = computePaymentSignature(
      createOrderData.razorpayOrderId,
      testPaymentId
    );

    // Test: Missing parameters rejected
    const missingParamsRes = await fetch(`${BASE_URL}/api/checkout/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: customerCookie,
      },
      body: JSON.stringify({
        orderNumber: createOrderData.orderNumber,
        razorpayOrderId: createOrderData.razorpayOrderId,
        // missing razorpayPaymentId & signature
      }),
    });
    assert(
      missingParamsRes.status === 400,
      "Verification rejected when payment ID or signature is missing (400 Bad Request)"
    );

    // Test: Tampered / Invalid signature rejected
    const tamperedSigRes = await fetch(`${BASE_URL}/api/checkout/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: customerCookie,
      },
      body: JSON.stringify({
        orderId: createOrderData.orderId,
        orderNumber: createOrderData.orderNumber,
        razorpayOrderId: createOrderData.razorpayOrderId,
        razorpayPaymentId: testPaymentId,
        razorpaySignature: "invalid_tampered_hex_signature_abcdef1234567890",
      }),
    });
    assert(
      tamperedSigRes.status === 400,
      "Verification rejected with 400 when HMAC SHA256 signature is forged or invalid"
    );

    // Test: Customer Isolation / Unauthorized customer cannot verify someone else's order
    const crossVerifyRes = await fetch(`${BASE_URL}/api/checkout/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: secondUserCookie, // Secondary customer attempting to verify Primary customer's order
      },
      body: JSON.stringify({
        orderId: createOrderData.orderId,
        orderNumber: createOrderData.orderNumber,
        razorpayOrderId: createOrderData.razorpayOrderId,
        razorpayPaymentId: testPaymentId,
        razorpaySignature: validSignature,
      }),
    });
    assert(
      crossVerifyRes.status === 403,
      "Customer 2 rejected with 403 Forbidden when attempting to verify Customer 1's order"
    );

    // Test: Legitimate verification with authentic signature
    const legitimateVerifyRes = await fetch(`${BASE_URL}/api/checkout/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: customerCookie,
      },
      body: JSON.stringify({
        orderId: createOrderData.orderId,
        orderNumber: createOrderData.orderNumber,
        razorpayOrderId: createOrderData.razorpayOrderId,
        razorpayPaymentId: testPaymentId,
        razorpaySignature: validSignature,
      }),
    });
    const legitimateVerifyData = await legitimateVerifyRes.json();
    assert(
      legitimateVerifyRes.status === 200 && legitimateVerifyData.success,
      "Legitimate payment verified successfully with valid HMAC SHA256 signature"
    );

    // Check DB status transition
    const verifiedDbOrder = await prisma.order.findUnique({
      where: { id: createOrderData.orderId },
    });
    assert(
      verifiedDbOrder.paymentStatus === "PAID",
      `Database order paymentStatus updated to PAID (actual: "${verifiedDbOrder.paymentStatus}")`
    );
    assert(
      verifiedDbOrder.orderStatus === "CONFIRMED",
      `Database order orderStatus updated to CONFIRMED (actual: "${verifiedDbOrder.orderStatus}")`
    );
    assert(
      verifiedDbOrder.razorpayPaymentId === testPaymentId,
      `razorpayPaymentId persisted: ${verifiedDbOrder.razorpayPaymentId}`
    );
    assert(
      verifiedDbOrder.razorpaySignature === validSignature,
      "razorpaySignature persisted on order record"
    );
    console.log();

    // -------------------------------------------------------------
    // SECTION 4: Idempotency in Payment Verification
    // -------------------------------------------------------------
    console.log("[SECTION 4: Idempotency in Payment Verification]");

    const duplicateVerifyRes = await fetch(`${BASE_URL}/api/checkout/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: customerCookie,
      },
      body: JSON.stringify({
        orderId: createOrderData.orderId,
        orderNumber: createOrderData.orderNumber,
        razorpayOrderId: createOrderData.razorpayOrderId,
        razorpayPaymentId: testPaymentId,
        razorpaySignature: validSignature,
      }),
    });
    const duplicateVerifyData = await duplicateVerifyRes.json();
    assert(
      duplicateVerifyRes.status === 200 &&
        duplicateVerifyData.success === true &&
        duplicateVerifyData.isAlreadyPaid === true,
      "Duplicate verification request handled idempotently (returns isAlreadyPaid: true)"
    );
    console.log();

    // -------------------------------------------------------------
    // SECTION 5: Webhook Signature Verification (/api/webhooks/razorpay)
    // -------------------------------------------------------------
    console.log("[SECTION 5: Razorpay Webhook Signature Verification]");

    const webhookOrderRes = await fetch(`${BASE_URL}/api/checkout/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: customerCookie,
      },
      body: JSON.stringify({
        items: [{ id: p1.id, quantity: 1, size: p1.sizes[0], color: p1.colors[0] }],
        shippingAddress: validAddress,
        idempotencyKey: `idem_webhook_${Date.now()}`,
      }),
    });
    const webhookOrderData = await webhookOrderRes.json();
    if (webhookOrderData.orderId) createdOrderIds.push(webhookOrderData.orderId);

    // Test: Webhook missing signature header
    const noSigWebhookRes = await fetch(`${BASE_URL}/api/webhooks/razorpay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "order.paid" }),
    });
    assert(
      noSigWebhookRes.status === 400,
      "Webhook rejected with 400 when x-razorpay-signature header is missing"
    );

    // Test: Webhook with forged signature
    const forgedWebhookRes = await fetch(`${BASE_URL}/api/webhooks/razorpay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-razorpay-signature": "forged_invalid_webhook_signature_hex",
      },
      body: JSON.stringify({ event: "order.paid" }),
    });
    assert(
      forgedWebhookRes.status === 400,
      "Webhook rejected with 400 when x-razorpay-signature does not match webhook secret"
    );
    console.log();

    // -------------------------------------------------------------
    // SECTION 6: Webhook Event Processing (order.paid, payment.captured)
    // -------------------------------------------------------------
    console.log("[SECTION 6: Webhook Event Processing (order.paid & payment.captured)]");

    const webhookPaymentId = `pay_wh_${Date.now()}`;
    const orderPaidEvent = {
      entity: "event",
      account_id: "acc_velour_test",
      event: "order.paid",
      contains: ["order", "payment"],
      payload: {
        order: {
          entity: {
            id: webhookOrderData.razorpayOrderId,
            amount: webhookOrderData.amount,
            currency: "INR",
            receipt: webhookOrderData.orderNumber,
            status: "paid",
            notes: { orderId: webhookOrderData.orderId },
          },
        },
        payment: {
          entity: {
            id: webhookPaymentId,
            order_id: webhookOrderData.razorpayOrderId,
            amount: webhookOrderData.amount,
            currency: "INR",
            status: "captured",
          },
        },
      },
      created_at: Math.floor(Date.now() / 1000),
    };

    const orderPaidBodyStr = JSON.stringify(orderPaidEvent);
    const validWebhookSignature = computeWebhookSignature(orderPaidBodyStr);

    const validWebhookRes = await fetch(`${BASE_URL}/api/webhooks/razorpay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-razorpay-signature": validWebhookSignature,
      },
      body: orderPaidBodyStr,
    });
    const validWebhookData = await validWebhookRes.json();
    assert(
      validWebhookRes.status === 200 && validWebhookData.received === true,
      "Valid order.paid webhook processed successfully and acknowledged with 200 OK"
    );

    const webhookUpdatedOrder = await prisma.order.findUnique({
      where: { id: webhookOrderData.orderId },
    });
    assert(
      webhookUpdatedOrder.paymentStatus === "PAID",
      `Order marked PAID via webhook (actual: "${webhookUpdatedOrder.paymentStatus}")`
    );
    assert(
      webhookUpdatedOrder.orderStatus === "CONFIRMED",
      `Order marked CONFIRMED via webhook (actual: "${webhookUpdatedOrder.orderStatus}")`
    );

    // Test: Duplicate webhook delivery (Idempotency)
    const duplicateWebhookRes = await fetch(`${BASE_URL}/api/webhooks/razorpay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-razorpay-signature": validWebhookSignature,
      },
      body: orderPaidBodyStr,
    });
    const duplicateWebhookData = await duplicateWebhookRes.json();
    assert(
      duplicateWebhookRes.status === 200 && duplicateWebhookData.isIdempotent === true,
      "Duplicate webhook event handled idempotently (acknowledged with 200 OK without re-updating)"
    );
    console.log();

    // -------------------------------------------------------------
    // SECTION 7: Webhook Payment Failure & Protection Rules
    // -------------------------------------------------------------
    console.log("[SECTION 7: Webhook Payment Failure & Protection Rules]");

    // Create a 3rd order specifically to test payment.failed
    const failOrderRes = await fetch(`${BASE_URL}/api/checkout/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: customerCookie,
      },
      body: JSON.stringify({
        items: [{ id: p1.id, quantity: 1, size: p1.sizes[0], color: p1.colors[0] }],
        shippingAddress: validAddress,
        idempotencyKey: `idem_fail_${Date.now()}`,
      }),
    });
    const failOrderData = await failOrderRes.json();
    if (failOrderData.orderId) createdOrderIds.push(failOrderData.orderId);

    const paymentFailedEvent = {
      entity: "event",
      event: "payment.failed",
      payload: {
        payment: {
          entity: {
            id: `pay_failed_${Date.now()}`,
            order_id: failOrderData.razorpayOrderId,
            status: "failed",
            error_code: "BAD_REQUEST_ERROR",
            error_description: "Card has insufficient balance.",
            error_reason: "payment_failed",
            notes: { orderId: failOrderData.orderId },
          },
        },
      },
    };

    const failBodyStr = JSON.stringify(paymentFailedEvent);
    const failSig = computeWebhookSignature(failBodyStr);

    const failWebhookRes = await fetch(`${BASE_URL}/api/webhooks/razorpay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-razorpay-signature": failSig,
      },
      body: failBodyStr,
    });
    assert(failWebhookRes.status === 200, "payment.failed webhook acknowledged with 200 OK");

    const failedDbOrder = await prisma.order.findUnique({
      where: { id: failOrderData.orderId },
    });
    assert(
      failedDbOrder.paymentStatus === "FAILED",
      `Order transitioned to FAILED status (actual: "${failedDbOrder.paymentStatus}")`
    );
    assert(
      failedDbOrder.notes.includes("insufficient balance"),
      "Failure reason recorded in order notes"
    );

    // Rule: payment.failed must NEVER overwrite an order that is already PAID
    const failEventForPaidOrder = {
      entity: "event",
      event: "payment.failed",
      payload: {
        payment: {
          entity: {
            id: `pay_late_fail_${Date.now()}`,
            order_id: webhookOrderData.razorpayOrderId, // The order that was already PAID above!
            status: "failed",
            error_description: "Late retry card declined",
          },
        },
      },
    };
    const lateFailStr = JSON.stringify(failEventForPaidOrder);
    const lateFailSig = computeWebhookSignature(lateFailStr);

    await fetch(`${BASE_URL}/api/webhooks/razorpay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-razorpay-signature": lateFailSig,
      },
      body: lateFailStr,
    });

    const checkPaidOrderNotOverwritten = await prisma.order.findUnique({
      where: { id: webhookOrderData.orderId },
    });
    assert(
      checkPaidOrderNotOverwritten.paymentStatus === "PAID",
      "Late payment.failed event does NOT overwrite an order that was already confirmed as PAID"
    );
    console.log();

  } catch (err) {
    console.error("Test execution exception:", err);
    failedTests++;
  } finally {
    // Clean up created test orders
    if (createdOrderIds.length > 0) {
      console.log(`[CLEANUP] Removing ${createdOrderIds.length} test order(s) from MongoDB Atlas...`);
      await prisma.order.deleteMany({
        where: { id: { in: createdOrderIds } },
      });
      console.log("  ✓ Test orders cleaned up successfully.\n");
    }

    await prisma.$disconnect();

    console.log("=================================================");
    console.log(`   RAZORPAY TESTS COMPLETE: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log("=================================================");

    if (failedTests > 0) {
      process.exit(1);
    }
  }
}

runRazorpayTestSuite();


/**
 * Velour Atelier - Checkout Module Test Suite
 * Comprehensive automated verification for:
 * 1. Customer Authentication and Server-Side Security
 * 2. Delivery Address Validation
 * 3. Empty Cart & Payload Validation
 * 4. Product Existence & Availability (inStock)
 * 5. Stock Count Enforcement (requested qty > stockCount rejected)
 * 6. Variant Enforcement (Size & Colour validation against product catalog)
 * 7. Server-Side Authoritative Pricing & Tamper Protection (ignores client prices)
 * 8. Accurate Tax (12% GST), Shipping (₹0 threshold vs ₹199), and Total Recalculation
 * 9. Unique Order Number Generation (VA-YYYYMMDD-XXXX)
 * 10. Pending Order Persistence in MongoDB Atlas with paymentStatus: "PENDING"
 * 11. Idempotency mechanism (prevents duplicate orders from repeated submissions)
 * 12. Order Retrieval API (/api/orders/[id]) with Customer Ownership & Isolation
 */

const fs = require("fs");
const path = require("path");

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
 * Helper to authenticate against NextAuth credentials endpoint
 * and retrieve session cookie
 */
async function loginCustomer(email, password) {
  // Step 1: Fetch CSRF token
  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
  const csrfCookies = csrfRes.headers.getSetCookie
    ? csrfRes.headers.getSetCookie()
    : [csrfRes.headers.get("set-cookie") || ""];
  const { csrfToken } = await csrfRes.json();

  const cookieStr = csrfCookies.map((c) => c.split(";")[0]).join("; ");

  // Step 2: POST to credentials callback
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
    throw new Error(`Failed to obtain next-auth.session-token for ${email}. Status: ${authRes.status}`);
  }

  return sessionTokenCookie.split(";")[0];
}

async function runCheckoutTestSuite() {
  console.log("==================================================================");
  console.log("          VELOUR ATELIER - CHECKOUT MODULE TEST SUITE             ");
  console.log("==================================================================\n");

  const createdOrderIds = [];

  try {
    // -------------------------------------------------------------
    // SECTION 1: Product Catalog & Test Customer Preparation
    // -------------------------------------------------------------
    console.log("[SECTION 1: Database Baseline & Product Inspection]");
    const products = await prisma.product.findMany({
      where: { inStock: true, stockCount: { gt: 5 } },
      take: 4,
    });
    assert(products.length >= 2, "Found in-stock products with sufficient inventory in MongoDB Atlas");
    const p1 = products[0];
    const p2 = products[1];
    console.log(`  Target Product 1: ${p1.name} (Price: ₹${p1.price}, Stock: ${p1.stockCount}, Sizes: ${JSON.stringify(p1.sizes)}, Colors: ${JSON.stringify(p1.colors)})`);
    console.log(`  Target Product 2: ${p2.name} (Price: ₹${p2.price}, Stock: ${p2.stockCount}, Sizes: ${JSON.stringify(p2.sizes)}, Colors: ${JSON.stringify(p2.colors)})`);

    const customerUser = await prisma.user.findFirst({
      where: { role: "CUSTOMER" },
    });
    assert(!!customerUser, `Customer account available in MongoDB Atlas: ${customerUser?.email}`);

    // Create a second test customer for isolation tests
    const secondUserEmail = "secondary.test.user@velour.com";
    let secondUser = await prisma.user.findUnique({ where: { email: secondUserEmail } });
    if (!secondUser) {
      const bcrypt = require("bcryptjs");
      const passwordHash = await bcrypt.hash("SecondaryPass@2024", 10);
      secondUser = await prisma.user.create({
        data: {
          email: secondUserEmail,
          name: "Secondary Test Patron",
          passwordHash,
          role: "CUSTOMER",
          addresses: [
            {
              id: "addr_second_01",
              fullName: "Secondary Patron",
              phone: "+91 9123456780",
              houseNumber: "Flat 101",
              street: "Marine Drive",
              city: "Mumbai",
              state: "Maharashtra",
              postalCode: "400020",
              country: "India",
              isDefault: true,
            },
          ],
        },
      });
    }
    assert(!!secondUser, `Second customer account ready for isolation testing: ${secondUser.email}`);
    console.log();

    // -------------------------------------------------------------
    // SECTION 2: Customer Authentication Guard
    // -------------------------------------------------------------
    console.log("[SECTION 2: Unauthenticated Access Guards (401 Unauthorized)]");
    const unauthOrderRes = await fetch(`${BASE_URL}/api/checkout/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ id: p1.id, quantity: 1 }],
        shippingAddress: { fullName: "Guest User", phone: "+91 9999999999", street: "Street", city: "City", state: "State", postalCode: "110001" },
      }),
    });
    assert(
      unauthOrderRes.status === 401,
      "POST /api/checkout/create-order rejects unauthenticated guest requests with 401 Unauthorized"
    );

    const unauthGetOrderRes = await fetch(`${BASE_URL}/api/orders/some-random-order-id`);
    assert(
      unauthGetOrderRes.status === 401,
      "GET /api/orders/[id] rejects unauthenticated access with 401 Unauthorized"
    );
    console.log();

    // -------------------------------------------------------------
    // SECTION 3: Authenticate Customer Session
    // -------------------------------------------------------------
    console.log("[SECTION 3: Customer NextAuth Login & Session Establishment]");
    const customerCookie = await loginCustomer("demo@velour.com", "User@Velour2026");
    assert(!!customerCookie, "Successfully authenticated customer (demo@velour.com) and obtained session token");

    const secondUserCookie = await loginCustomer("secondary.test.user@velour.com", "SecondaryPass@2024");
    assert(!!secondUserCookie, "Successfully authenticated second customer for isolation testing");
    console.log();

    // Standard valid shipping address
    const validAddress = {
      fullName: "Aria Thorne",
      phone: "+91 9876543210",
      houseNumber: "Villa 12",
      street: "Palm Avenue, Koramangala",
      landmark: "Near Forum",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560034",
      country: "India",
    };

    // -------------------------------------------------------------
    // SECTION 4: Input Validation (Empty Cart, Missing Address)
    // -------------------------------------------------------------
    console.log("[SECTION 4: Cart and Delivery Address Validations]");

    // Test: Empty Cart
    const emptyCartRes = await fetch(`${BASE_URL}/api/checkout/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: customerCookie,
      },
      body: JSON.stringify({
        items: [],
        shippingAddress: validAddress,
      }),
    });
    const emptyCartData = await emptyCartRes.json();
    assert(
      emptyCartRes.status === 400 && emptyCartData.error.includes("empty"),
      "Empty cart items array rejected with 400 Bad Request"
    );

    // Test: Missing delivery address
    const missingAddressRes = await fetch(`${BASE_URL}/api/checkout/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: customerCookie,
      },
      body: JSON.stringify({
        items: [{ id: p1.id, quantity: 1, size: p1.sizes[0], color: p1.colors[0] }],
        shippingAddress: null,
      }),
    });
    const missingAddressData = await missingAddressRes.json();
    assert(
      missingAddressRes.status === 400 && missingAddressData.error.includes("address"),
      "Missing delivery address rejected with 400 Bad Request"
    );

    // Test: Incomplete address (missing postal code)
    const incompleteAddressRes = await fetch(`${BASE_URL}/api/checkout/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: customerCookie,
      },
      body: JSON.stringify({
        items: [{ id: p1.id, quantity: 1, size: p1.sizes[0], color: p1.colors[0] }],
        shippingAddress: { fullName: "Aria Thorne", phone: "+91 9876543210", street: "Road 1", city: "Bengaluru", state: "Karnataka" },
      }),
    });
    assert(
      incompleteAddressRes.status === 400,
      "Incomplete delivery address (missing PIN code) rejected with 400 Bad Request"
    );
    console.log();

    // -------------------------------------------------------------
    // SECTION 5: Product Stock & Variant Validations
    // -------------------------------------------------------------
    console.log("[SECTION 5: Stock and Variant Integrity Validations]");

    // Test: Non-existent product ID
    const invalidProdRes = await fetch(`${BASE_URL}/api/checkout/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: customerCookie,
      },
      body: JSON.stringify({
        items: [{ id: "650000000000000000000099", quantity: 1 }],
        shippingAddress: validAddress,
      }),
    });
    const invalidProdData = await invalidProdRes.json();
    assert(
      invalidProdRes.status === 400 && invalidProdData.error.includes("no longer available"),
      "Non-existent product ID safely rejected with 400 Bad Request"
    );

    // Test: Exceeding available stockCount
    const excessiveQty = p1.stockCount + 50;
    const excessiveQtyRes = await fetch(`${BASE_URL}/api/checkout/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: customerCookie,
      },
      body: JSON.stringify({
        items: [{ id: p1.id, quantity: excessiveQty, size: p1.sizes[0], color: p1.colors[0] }],
        shippingAddress: validAddress,
      }),
    });
    const excessiveQtyData = await excessiveQtyRes.json();
    assert(
      excessiveQtyRes.status === 400 && excessiveQtyData.error.includes("Only"),
      `Requested quantity (${excessiveQty}) exceeding stockCount (${p1.stockCount}) rejected with 400`
    );

    // Test: Invalid size variant
    const invalidSizeRes = await fetch(`${BASE_URL}/api/checkout/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: customerCookie,
      },
      body: JSON.stringify({
        items: [{ id: p1.id, quantity: 1, size: "XXXXL_NON_EXISTENT", color: p1.colors[0] }],
        shippingAddress: validAddress,
      }),
    });
    const invalidSizeData = await invalidSizeRes.json();
    assert(
      invalidSizeRes.status === 400 && invalidSizeData.error.includes("Invalid size"),
      "Invalid size variant selection rejected with 400 Bad Request"
    );

    // Test: Invalid colour variant
    const invalidColorRes = await fetch(`${BASE_URL}/api/checkout/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: customerCookie,
      },
      body: JSON.stringify({
        items: [{ id: p1.id, quantity: 1, size: p1.sizes[0], color: "NeonMagentaRainbow" }],
        shippingAddress: validAddress,
      }),
    });
    const invalidColorData = await invalidColorRes.json();
    assert(
      invalidColorRes.status === 400 && invalidColorData.error.includes("Invalid colour"),
      "Invalid colour variant selection rejected with 400 Bad Request"
    );
    console.log();

    // -------------------------------------------------------------
    // SECTION 6: Price Tamper Protection & Server Recalculation
    // -------------------------------------------------------------
    console.log("[SECTION 6: Authoritative Server Price Recalculation & Tamper Resistance]");

    // Customer attempts to submit tampered price: price = ₹1.00 and fake subtotal
    const tamperedPayload = {
      items: [
        {
          id: p1.id,
          name: p1.name,
          price: 1, // MALICIOUS CLIENT TAMPERING
          quantity: 2,
          size: p1.sizes[0],
          color: p1.colors[0],
          image: p1.images?.[0] || "",
        },
      ],
      shippingAddress: validAddress,
      idempotencyKey: `idem_tamper_${Date.now()}`,
    };

    const tamperRes = await fetch(`${BASE_URL}/api/checkout/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: customerCookie,
      },
      body: JSON.stringify(tamperedPayload),
    });
    const tamperData = await tamperRes.json();
    assert(tamperRes.status === 200 && tamperData.success, "Order processed successfully");

    if (tamperData.orderId) createdOrderIds.push(tamperData.orderId);

    // Expected values based strictly on MongoDB product.price:
    const expectedSubtotal = p1.price * 2;
    const expectedShipping = expectedSubtotal >= 2499 ? 0 : 199;
    const expectedTax = Math.round(expectedSubtotal * 0.12);
    const expectedTotal = expectedSubtotal + expectedShipping + expectedTax;

    assert(
      tamperData.subtotal === expectedSubtotal,
      `Server ignored tampered client price (₹1.00) and computed subtotal from MongoDB: ₹${tamperData.subtotal} (expected: ₹${expectedSubtotal})`
    );
    assert(
      tamperData.tax === expectedTax,
      `Accurate 12% GST calculated server-side: ₹${tamperData.tax} (expected: ₹${expectedTax})`
    );
    assert(
      tamperData.shippingFee === expectedShipping,
      `Shipping fee calculated correctly based on ₹2,499 threshold: ₹${tamperData.shippingFee} (expected: ₹${expectedShipping})`
    );
    assert(
      tamperData.totalAmount === expectedTotal,
      `Final total amount calculated correctly: ₹${tamperData.totalAmount} (expected: ₹${expectedTotal})`
    );
    console.log();

    // -------------------------------------------------------------
    // SECTION 7: Order Record Persistence & Order Number Format
    // -------------------------------------------------------------
    console.log("[SECTION 7: MongoDB Atlas Order Record & Order Number Inspection]");

    const dbOrder = await prisma.order.findUnique({
      where: { id: tamperData.orderId },
    });
    assert(!!dbOrder, "Direct Prisma query confirms order was persisted to MongoDB Atlas");
    assert(
      dbOrder.paymentStatus === "PENDING",
      `Order paymentStatus is strictly PENDING (actual: "${dbOrder.paymentStatus}")`
    );
    assert(
      dbOrder.orderStatus === "PROCESSING",
      `Order orderStatus is INITIAL / PROCESSING (actual: "${dbOrder.orderStatus}")`
    );
    assert(
      /^VA-\d{8}-[A-Z0-9]{4}$/.test(dbOrder.orderNumber),
      `Order number matches required format VA-YYYYMMDD-XXXX: ${dbOrder.orderNumber}`
    );
    assert(
      dbOrder.items.length === 1 && dbOrder.items[0].price === p1.price,
      "Order items snapshot contains authentic MongoDB product price"
    );
    assert(
      dbOrder.shippingAddress.fullName === validAddress.fullName &&
        dbOrder.shippingAddress.postalCode === validAddress.postalCode,
      "Order shippingAddress snapshot matches selected delivery destination"
    );
    console.log();

    // -------------------------------------------------------------
    // SECTION 8: Idempotency Protection (Duplicate Submissions)
    // -------------------------------------------------------------
    console.log("[SECTION 8: Idempotency Verification (Preventing Duplicate Orders)]");

    const sharedIdempotencyKey = `idem_dup_test_${Date.now()}`;
    const firstSubmission = await fetch(`${BASE_URL}/api/checkout/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: customerCookie,
      },
      body: JSON.stringify({
        items: [{ id: p2.id, quantity: 1, size: p2.sizes[0], color: p2.colors[0] }],
        shippingAddress: validAddress,
        idempotencyKey: sharedIdempotencyKey,
      }),
    });
    const firstData = await firstSubmission.json();
    assert(firstData.success === true, "First submission created order successfully");
    if (firstData.orderId) createdOrderIds.push(firstData.orderId);

    // Second submission with identical idempotencyKey
    const secondSubmission = await fetch(`${BASE_URL}/api/checkout/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: customerCookie,
      },
      body: JSON.stringify({
        items: [{ id: p2.id, quantity: 1, size: p2.sizes[0], color: p2.colors[0] }],
        shippingAddress: validAddress,
        idempotencyKey: sharedIdempotencyKey,
      }),
    });
    const secondData = await secondSubmission.json();
    assert(
      secondData.success === true && secondData.isExisting === true,
      "Duplicate submission detected by idempotencyKey, returned existing order flag"
    );
    assert(
      secondData.orderId === firstData.orderId && secondData.orderNumber === firstData.orderNumber,
      `Idempotency returned identical orderId (${firstData.orderId}) and orderNumber (${firstData.orderNumber})`
    );

    // Count records in DB with this idempotency key
    const idempotencyCount = await prisma.order.count({
      where: { idempotencyKey: sharedIdempotencyKey },
    });
    assert(
      idempotencyCount === 1,
      `Database contains exactly 1 order record for idempotencyKey: ${sharedIdempotencyKey}`
    );
    console.log();

    // -------------------------------------------------------------
    // SECTION 9: Order Details API & Customer Ownership Isolation
    // -------------------------------------------------------------
    console.log("[SECTION 9: Order Details API (/api/orders/[id]) & Customer Isolation]");

    // Customer 1 fetching their own order by orderNumber
    const fetchByNumberRes = await fetch(`${BASE_URL}/api/orders/${firstData.orderNumber}`, {
      headers: { Cookie: customerCookie },
    });
    const fetchByNumberData = await fetchByNumberRes.json();
    assert(
      fetchByNumberRes.status === 200 &&
        fetchByNumberData.success === true &&
        fetchByNumberData.order.orderNumber === firstData.orderNumber,
      "Customer successfully retrieved order details via orderNumber"
    );

    // Customer 1 fetching their own order by MongoDB ObjectId
    const fetchByIdRes = await fetch(`${BASE_URL}/api/orders/${firstData.orderId}`, {
      headers: { Cookie: customerCookie },
    });
    const fetchByIdData = await fetchByIdRes.json();
    assert(
      fetchByIdRes.status === 200 &&
        fetchByIdData.success === true &&
        fetchByIdData.order.id === firstData.orderId,
      "Customer successfully retrieved order details via MongoDB ObjectId"
    );

    // Customer 2 attempting to access Customer 1's order -> MUST FAIL with 404 / access denied
    const crossAccessRes = await fetch(`${BASE_URL}/api/orders/${firstData.orderNumber}`, {
      headers: { Cookie: secondUserCookie },
    });
    assert(
      crossAccessRes.status === 404,
      "Customer 2 rejected with 404 Not Found when attempting to access Customer 1's order (Customer Isolation Enforced)"
    );

    // Non-existent order id
    const nonExistentRes = await fetch(`${BASE_URL}/api/orders/VA-99999999-XXXX`, {
      headers: { Cookie: customerCookie },
    });
    assert(
      nonExistentRes.status === 404,
      "Query for non-existent order number correctly returns 404"
    );
    console.log();

    // -------------------------------------------------------------
    // SECTION 10: Multi-Item Order Math & Free Shipping Verification
    // -------------------------------------------------------------
    console.log("[SECTION 10: Multi-Item Order Math & Free Shipping Threshold]");

    const multiItemSubmission = await fetch(`${BASE_URL}/api/checkout/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: customerCookie,
      },
      body: JSON.stringify({
        items: [
          { id: p1.id, quantity: 2, size: p1.sizes[0], color: p1.colors[0] },
          { id: p2.id, quantity: 2, size: p2.sizes[0], color: p2.colors[0] },
        ],
        shippingAddress: validAddress,
        idempotencyKey: `idem_multi_${Date.now()}`,
      }),
    });
    const multiData = await multiItemSubmission.json();
    assert(multiData.success === true, "Multi-item checkout order created successfully");
    if (multiData.orderId) createdOrderIds.push(multiData.orderId);

    const multiExpectedSubtotal = (p1.price * 2) + (p2.price * 2);
    const multiExpectedShipping = multiExpectedSubtotal >= 2499 ? 0 : 199;
    const multiExpectedTax = Math.round(multiExpectedSubtotal * 0.12);
    const multiExpectedTotal = multiExpectedSubtotal + multiExpectedShipping + multiExpectedTax;

    assert(
      multiData.subtotal === multiExpectedSubtotal,
      `Multi-item subtotal matches server calculation: ₹${multiData.subtotal} (expected: ₹${multiExpectedSubtotal})`
    );
    assert(
      multiData.shippingFee === multiExpectedShipping,
      `Multi-item shipping fee qualifies for free delivery: ₹${multiData.shippingFee} (subtotal: ₹${multiExpectedSubtotal} >= ₹2,499)`
    );
    assert(
      multiData.tax === multiExpectedTax,
      `Multi-item 12% GST calculated accurately: ₹${multiData.tax}`
    );
    assert(
      multiData.totalAmount === multiExpectedTotal,
      `Multi-item final total calculated accurately: ₹${multiData.totalAmount}`
    );
    console.log();

  } catch (err) {
    console.error("Test execution exception:", err);
    failedTests++;
  } finally {
    // Clean up created test orders to maintain database hygiene
    if (createdOrderIds.length > 0) {
      console.log(`[CLEANUP] Removing ${createdOrderIds.length} test order(s) from MongoDB Atlas...`);
      await prisma.order.deleteMany({
        where: { id: { in: createdOrderIds } },
      });
      console.log("  ✓ Test orders cleaned up successfully.\n");
    }

    await prisma.$disconnect();

    console.log("=================================================");
    console.log(`   CHECKOUT TESTS COMPLETE: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log("=================================================");

    if (failedTests > 0) {
      process.exit(1);
    }
  }
}

runCheckoutTestSuite();


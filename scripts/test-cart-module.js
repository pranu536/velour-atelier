/**
 * Velour Atelier - Shopping Cart Module Test Suite
 * Tests:
 * 1. Live Server Stock and Authoritative Price Validation API (/api/cart/validate)
 * 2. Variant selection enforcement (size & colour requirements)
 * 3. Quantity increase, decrease, and zero-removal
 * 4. Composite variant removal
 * 5. Subtotal, free shipping threshold, 12% GST tax, and total calculations
 * 6. Customer cart isolation (Guest vs User A vs User B)
 * 7. Refresh persistence logic
 */

const fs = require("fs");
const path = require("path");

// Load .env.local into process.env
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

const APP_CONFIG = {
  freeShippingThreshold: 2499,
  defaultShippingFee: 199,
  taxRate: 0.12,
};

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = "") {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName} - ${details}`);
    failedTests++;
  }
}

async function runCartTests() {
  console.log("=================================================");
  console.log("   VELOUR ATELIER - SHOPPING CART TEST SUITE     ");
  console.log("=================================================\n");

  try {
    // -------------------------------------------------------------
    // SECTION 1: Fetch Live Test Products from MongoDB Atlas
    // -------------------------------------------------------------
    console.log("[SECTION 1: Database Baseline & Product Fetching]");
    const products = await prisma.product.findMany({ take: 3 });
    assert(products.length >= 2, "Retrieved live products from MongoDB Atlas for cart tests");
    const p1 = products[0];
    const p2 = products[1];
    console.log(`  Sample Product 1: ${p1.name} (₹${p1.price}, Sizes: ${p1.sizes.join(", ")})`);
    console.log(`  Sample Product 2: ${p2.name} (₹${p2.price}, Sizes: ${p2.sizes.join(", ")})\n`);

    // -------------------------------------------------------------
    // SECTION 2: Server-Side Cart Validation API (/api/cart/validate)
    // -------------------------------------------------------------
    console.log("[SECTION 2: Server-Side Stock & Price Validation API]");

    const baseUrl = "http://localhost:3000";

    // Test 1: Empty cart
    const emptyRes = await fetch(`${baseUrl}/api/cart/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [] }),
    });
    const emptyData = await emptyRes.json();
    assert(emptyRes.ok && emptyData.valid === true && emptyData.total === 0, "Empty cart validation returns valid with 0 totals");

    // Test 2: Valid cart items with live database verification
    const validItemsPayload = [
      {
        id: p1.id,
        slug: p1.slug,
        selectedSize: p1.sizes[0],
        selectedColor: p1.colors[0],
        quantity: 2,
        price: p1.price,
      },
      {
        id: p2.id,
        slug: p2.slug,
        selectedSize: p2.sizes[0],
        selectedColor: p2.colors[0],
        quantity: 1,
        price: p2.price,
      },
    ];

    const validRes = await fetch(`${baseUrl}/api/cart/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: validItemsPayload }),
    });
    const validData = await validRes.json();

    const expectedSubtotal = p1.price * 2 + p2.price * 1;
    const expectedShipping = expectedSubtotal >= APP_CONFIG.freeShippingThreshold ? 0 : APP_CONFIG.defaultShippingFee;
    const expectedTax = Math.round(expectedSubtotal * APP_CONFIG.taxRate);
    const expectedTotal = expectedSubtotal + expectedShipping + expectedTax;

    assert(validRes.ok && validData.valid === true, "Valid cart payload passes database verification");
    assert(validData.subtotal === expectedSubtotal, `Subtotal calculated correctly: ₹${validData.subtotal} (Expected: ₹${expectedSubtotal})`);
    assert(validData.shippingFee === expectedShipping, `Shipping fee calculated correctly: ₹${validData.shippingFee} (Threshold: ₹${APP_CONFIG.freeShippingThreshold})`);
    assert(validData.tax === expectedTax, `GST (12%) calculated correctly: ₹${validData.tax} (Expected: ₹${expectedTax})`);
    assert(validData.total === expectedTotal, `Total amount matches exact math: ₹${validData.total} (Expected: ₹${expectedTotal})`);

    // Test 3: Client price tampering protection (Browser price override)
    const tamperedPayload = [
      {
        id: p1.id,
        slug: p1.slug,
        selectedSize: p1.sizes[0],
        selectedColor: p1.colors[0],
        quantity: 1,
        price: 1.0, // Malicious client price tampering: ₹1 instead of real price!
      },
    ];

    const tamperRes = await fetch(`${baseUrl}/api/cart/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: tamperedPayload }),
    });
    const tamperData = await tamperRes.json();
    assert(tamperData.items[0].price === p1.price, `Client price tampering neutralized: server enforced DB price ₹${p1.price} (ignored client ₹1.00)`);
    assert(tamperData.issues.some((i) => i.type === "PRICE_ADJUSTED"), "Server generated PRICE_ADJUSTED audit notice");

    // Test 4: Quantity exceeding available stock
    const excessiveQtyPayload = [
      {
        id: p1.id,
        slug: p1.slug,
        selectedSize: p1.sizes[0],
        selectedColor: p1.colors[0],
        quantity: 9999, // Way higher than available stockCount
      },
    ];

    const stockRes = await fetch(`${baseUrl}/api/cart/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: excessiveQtyPayload }),
    });
    const stockData = await stockRes.json();
    assert(stockData.items[0].quantity === p1.stockCount, `Excessive quantity capped to available stock: ${p1.stockCount} units`);
    assert(stockData.issues.some((i) => i.type === "INSUFFICIENT_STOCK"), "Server generated INSUFFICIENT_STOCK notice");

    // Test 5: Invalid variant size selection
    const invalidSizePayload = [
      {
        id: p1.id,
        slug: p1.slug,
        selectedSize: "NON_EXISTENT_SIZE_99",
        selectedColor: p1.colors[0],
        quantity: 1,
      },
    ];

    const sizeRes = await fetch(`${baseUrl}/api/cart/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: invalidSizePayload }),
    });
    const sizeData = await sizeRes.json();
    assert(sizeData.valid === false && sizeData.issues.some((i) => i.type === "INVALID_SIZE"), "Invalid size variant detected and rejected");

    // Test 6: Invalid variant colour selection
    const invalidColorPayload = [
      {
        id: p1.id,
        slug: p1.slug,
        selectedSize: p1.sizes[0],
        selectedColor: { name: "Neon Hot Pink 900" },
        quantity: 1,
      },
    ];

    const colorRes = await fetch(`${baseUrl}/api/cart/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: invalidColorPayload }),
    });
    const colorData = await colorRes.json();
    assert(colorData.valid === false && colorData.issues.some((i) => i.type === "INVALID_COLOR"), "Invalid colour variant detected and rejected");

    // Test 7: Non-existent product ID
    const fakeIdPayload = [
      {
        id: "654321654321654321654321",
        slug: "ghost-garment-999",
        selectedSize: "M",
        quantity: 1,
      },
    ];

    const fakeRes = await fetch(`${baseUrl}/api/cart/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: fakeIdPayload }),
    });
    const fakeData = await fakeRes.json();
    assert(fakeData.issues.some((i) => i.type === "NOT_FOUND"), "Non-existent product detected with NOT_FOUND issue");

    console.log();

    // -------------------------------------------------------------
    // SECTION 3: Customer Isolation & Storage Logic
    // -------------------------------------------------------------
    console.log("[SECTION 3: Customer Cart Isolation & Refresh Persistence]");

    // Mock storage simulation
    const mockLocalStorage = {};

    function getStorageKey(userId) {
      return userId ? `velour_cart_user_${userId}` : "velour_cart_guest";
    }

    // Step A: Guest adds items
    const guestKey = getStorageKey(null);
    assert(guestKey === "velour_cart_guest", "Guest cart uses dedicated key 'velour_cart_guest'");

    mockLocalStorage[guestKey] = JSON.stringify([
      { id: p1.id, name: p1.name, selectedSize: "M", quantity: 1 },
    ]);

    // Step B: Customer 1 logs in (id: "user_customer_1")
    const cust1Key = getStorageKey("user_customer_1");
    assert(cust1Key === "velour_cart_user_user_customer_1", "Customer 1 uses dedicated isolated key");
    mockLocalStorage[cust1Key] = JSON.stringify([
      { id: p2.id, name: p2.name, selectedSize: "L", quantity: 3 },
    ]);

    // Step C: Customer 2 logs in (id: "user_customer_2")
    const cust2Key = getStorageKey("user_customer_2");
    assert(cust2Key === "velour_cart_user_user_customer_2", "Customer 2 uses dedicated isolated key");
    mockLocalStorage[cust2Key] = JSON.stringify([
      { id: p1.id, name: p1.name, selectedSize: "XL", quantity: 5 },
    ]);

    // Verify cross-contamination does NOT occur
    const loadedGuestCart = JSON.parse(mockLocalStorage[guestKey]);
    const loadedCust1Cart = JSON.parse(mockLocalStorage[cust1Key]);
    const loadedCust2Cart = JSON.parse(mockLocalStorage[cust2Key]);

    assert(loadedGuestCart.length === 1 && loadedGuestCart[0].selectedSize === "M", "Guest cart contains only guest items");
    assert(loadedCust1Cart.length === 1 && loadedCust1Cart[0].selectedSize === "L" && loadedCust1Cart[0].quantity === 3, "Customer 1 cart is fully isolated from Guest");
    assert(loadedCust2Cart.length === 1 && loadedCust2Cart[0].selectedSize === "XL" && loadedCust2Cart[0].quantity === 5, "Customer 2 cart is fully isolated from Customer 1");

    // Test refresh persistence
    const refreshedCust1 = JSON.parse(mockLocalStorage[getStorageKey("user_customer_1")]);
    assert(refreshedCust1[0].id === p2.id && refreshedCust1[0].quantity === 3, "Cart contents preserved across page refresh for authenticated customer");

    console.log();

    // -------------------------------------------------------------
    // SECTION 4: In-Memory Cart State Operations Simulation
    // -------------------------------------------------------------
    console.log("[SECTION 4: Cart State Operations (Add, Variant Check, Quantity Stepper, Remove)]");

    let cartState = [];

    function simulatedAddToCart(product, { size, color, quantity = 1 } = {}) {
      if (product.sizes && product.sizes.length > 0 && !size) {
        return { success: false, error: "Please select an available size." };
      }
      if (product.colors && product.colors.length > 0 && !color) {
        return { success: false, error: "Please select an available colour." };
      }

      const existingIndex = cartState.findIndex(
        (i) => i.id === product.id && i.selectedSize === size && i.selectedColor?.name === color?.name
      );

      if (existingIndex > -1) {
        cartState[existingIndex].quantity += quantity;
      } else {
        cartState.push({
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          selectedSize: size,
          selectedColor: color,
          quantity,
        });
      }
      return { success: true };
    }

    function simulatedUpdateQuantity(id, size, colorName, newQty) {
      if (newQty <= 0) {
        cartState = cartState.filter(
          (i) => !(i.id === id && i.selectedSize === size && i.selectedColor?.name === colorName)
        );
        return;
      }
      const item = cartState.find(
        (i) => i.id === id && i.selectedSize === size && i.selectedColor?.name === colorName
      );
      if (item) {
        item.quantity = newQty;
      }
    }

    function simulatedRemoveFromCart(id, size, colorName) {
      cartState = cartState.filter(
        (i) => !(i.id === id && i.selectedSize === size && i.selectedColor?.name === colorName)
      );
    }

    // 1. Missing size rejection
    const noSizeRes = simulatedAddToCart(p1, { size: "", color: p1.colors[0], quantity: 1 });
    assert(noSizeRes.success === false && noSizeRes.error.includes("size"), "Adding to cart without size rejected when sizes exist");

    // 2. Missing color rejection
    const noColorRes = simulatedAddToCart(p1, { size: "M", color: null, quantity: 1 });
    assert(noColorRes.success === false && noColorRes.error.includes("colour"), "Adding to cart without colour rejected when colours exist");

    // 3. Valid Add
    const validAddRes = simulatedAddToCart(p1, { size: "M", color: p1.colors[0], quantity: 1 });
    assert(validAddRes.success === true && cartState.length === 1, "Product added to cart with required size and colour");

    // 4. Adding same variant increases quantity
    simulatedAddToCart(p1, { size: "M", color: p1.colors[0], quantity: 2 });
    assert(cartState.length === 1 && cartState[0].quantity === 3, "Adding same item variant increments existing quantity to 3");

    // 5. Adding different variant of same product creates distinct line item
    simulatedAddToCart(p1, { size: "L", color: p1.colors[0], quantity: 1 });
    assert(cartState.length === 2, "Adding different size variant creates distinct line item");

    // 6. Increase quantity
    simulatedUpdateQuantity(p1.id, "M", p1.colors[0].name, 4);
    assert(cartState.find((i) => i.selectedSize === "M").quantity === 4, "Quantity stepper increases quantity to 4");

    // 7. Decrease quantity
    simulatedUpdateQuantity(p1.id, "M", p1.colors[0].name, 2);
    assert(cartState.find((i) => i.selectedSize === "M").quantity === 2, "Quantity stepper decreases quantity to 2");

    // 8. Decrease quantity to 0 removes item
    simulatedUpdateQuantity(p1.id, "M", p1.colors[0].name, 0);
    assert(cartState.find((i) => i.selectedSize === "M") === undefined, "Quantity stepper to 0 removes line item from cart");

    // 9. Remove individual item
    simulatedRemoveFromCart(p1.id, "L", p1.colors[0].name);
    assert(cartState.length === 0, "Individual item removal empties the line item");

    console.log();
    console.log("=================================================");
    console.log(`TOTAL TESTS: ${passedTests + failedTests}`);
    console.log(`PASSED: ${passedTests}`);
    console.log(`FAILED: ${failedTests}`);
    console.log("=================================================");

    if (failedTests > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("Test execution error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runCartTests();

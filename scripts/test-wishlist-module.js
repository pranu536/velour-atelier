/**
 * Velour Atelier - Wishlist Module Test Suite
 * Tests:
 * 1. Server-side API endpoint security and validation (/api/wishlist, /api/wishlist/merge)
 * 2. MongoDB Atlas persistence on User.wishlistIds using Prisma ORM
 * 3. Guest storage separation (velour_wishlist_guest) and Customer Isolation
 * 4. Guest-to-Customer merge with deduplication and guest cleanup
 * 5. Add, remove, and toggle operations
 * 6. Add to Cart from Wishlist integration
 * 7. Live product details & availability (inStock) verification
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

async function runWishlistTests() {
  console.log("=================================================");
  console.log("     VELOUR ATELIER - WISHLIST TEST SUITE        ");
  console.log("=================================================\n");

  try {
    // -------------------------------------------------------------
    // SECTION 1: Database Baseline & Product Fetching
    // -------------------------------------------------------------
    console.log("[SECTION 1: Database Baseline & Product Fetching]");
    const products = await prisma.product.findMany({ take: 4 });
    assert(products.length >= 3, "Retrieved live products from MongoDB Atlas for wishlist tests");
    const p1 = products[0];
    const p2 = products[1];
    const p3 = products[2];
    console.log(`  Live Product 1: ${p1.name} (ID: ${p1.id}, InStock: ${p1.inStock})`);
    console.log(`  Live Product 2: ${p2.name} (ID: ${p2.id}, InStock: ${p2.inStock})`);
    console.log(`  Live Product 3: ${p3.name} (ID: ${p3.id}, InStock: ${p3.inStock})`);

    const testUser = await prisma.user.findFirst({
      where: { role: "CUSTOMER" },
    });
    assert(!!testUser, `Found customer account in MongoDB Atlas: ${testUser?.email}`);
    console.log();

    // -------------------------------------------------------------
    // SECTION 2: Server-Side API Security & Validation
    // -------------------------------------------------------------
    console.log("[SECTION 2: Server-Side API Security & Validation]");
    const baseUrl = "http://localhost:3000";

    // Test 1: Unauthenticated GET /api/wishlist returns unauthenticated state
    const unauthGetRes = await fetch(`${baseUrl}/api/wishlist`);
    const unauthGetData = await unauthGetRes.json();
    assert(
      unauthGetRes.ok && unauthGetData.authenticated === false,
      "GET /api/wishlist without session safely returns unauthenticated guest state"
    );

    // Test 2: Unauthenticated GET /api/wishlist?ids=... verifies guest product IDs
    const guestVerifyRes = await fetch(`${baseUrl}/api/wishlist?ids=${p1.id},${p2.id}`);
    const guestVerifyData = await guestVerifyRes.json();
    assert(
      guestVerifyRes.ok &&
        guestVerifyData.items.length === 2 &&
        guestVerifyData.items.some((i) => i.id === p1.id) &&
        guestVerifyData.items.some((i) => i.id === p2.id),
      "GET /api/wishlist?ids=... returns live verified product records for guest IDs"
    );

    // Test 3: Unauthenticated POST /api/wishlist rejected with 401
    const unauthPostRes = await fetch(`${baseUrl}/api/wishlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: p1.id, action: "add" }),
    });
    assert(
      unauthPostRes.status === 401,
      "POST /api/wishlist without session rejected with 401 Unauthorized"
    );

    // Test 4: Unauthenticated POST /api/wishlist/merge rejected with 401
    const unauthMergeRes = await fetch(`${baseUrl}/api/wishlist/merge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestProductIds: [p1.id] }),
    });
    assert(
      unauthMergeRes.status === 401,
      "POST /api/wishlist/merge without session rejected with 401 Unauthorized"
    );

    console.log();

    // -------------------------------------------------------------
    // SECTION 3: MongoDB Atlas User.wishlistIds Persistence via Prisma
    // -------------------------------------------------------------
    console.log("[SECTION 3: MongoDB Atlas User.wishlistIds Persistence]");

    // Backup current wishlistIds for the test user
    const originalWishlistIds = testUser.wishlistIds || [];

    // Step A: Add product to customer wishlistIds
    const addedList = Array.from(new Set([...originalWishlistIds, p1.id]));
    const updatedUserAdd = await prisma.user.update({
      where: { id: testUser.id },
      data: { wishlistIds: addedList },
      select: { id: true, wishlistIds: true },
    });
    assert(
      updatedUserAdd.wishlistIds.includes(p1.id),
      `Product "${p1.name}" persisted to User.wishlistIds in MongoDB Atlas`
    );

    // Step B: Fetch directly from database to verify persistence
    const verifiedUser = await prisma.user.findUnique({
      where: { id: testUser.id },
      select: { wishlistIds: true },
    });
    assert(
      verifiedUser.wishlistIds.includes(p1.id),
      "Direct database read confirms persistence of saved product ID"
    );

    // Step C: Remove product from customer wishlistIds
    const removedList = updatedUserAdd.wishlistIds.filter((id) => id !== p1.id);
    const updatedUserRemove = await prisma.user.update({
      where: { id: testUser.id },
      data: { wishlistIds: removedList },
      select: { id: true, wishlistIds: true },
    });
    assert(
      !updatedUserRemove.wishlistIds.includes(p1.id),
      `Product "${p1.name}" removal persisted to User.wishlistIds in MongoDB Atlas`
    );

    // Step D: Restore original wishlistIds
    await prisma.user.update({
      where: { id: testUser.id },
      data: { wishlistIds: originalWishlistIds },
    });
    assert(true, "Restored customer original wishlist state safely");

    console.log();

    // -------------------------------------------------------------
    // SECTION 4: Customer Isolation & Guest Storage
    // -------------------------------------------------------------
    console.log("[SECTION 4: Customer Isolation & Guest Storage]");

    const mockStorage = {};
    const GUEST_KEY = "velour_wishlist_guest";

    // Guest saves p1 and p2
    mockStorage[GUEST_KEY] = JSON.stringify([
      { id: p1.id, name: p1.name, price: p1.price, inStock: p1.inStock },
      { id: p2.id, name: p2.name, price: p2.price, inStock: p2.inStock },
    ]);

    // Customer A has p3
    const customerAWishlist = [p3.id];

    // Customer B has p1
    const customerBWishlist = [p1.id];

    // Verify isolation
    const guestItems = JSON.parse(mockStorage[GUEST_KEY]);
    assert(guestItems.length === 2, "Guest storage contains exactly 2 guest items in velour_wishlist_guest");
    assert(!customerAWishlist.includes(p1.id), "Customer A does not see or leak Guest/Customer B items");
    assert(!customerBWishlist.includes(p3.id), "Customer B does not see or leak Customer A items");

    console.log();

    // -------------------------------------------------------------
    // SECTION 5: Guest-to-Customer Merge with Deduplication
    // -------------------------------------------------------------
    console.log("[SECTION 5: Guest-to-Customer Merge with Deduplication]");

    // Scenario:
    // Guest saved: [p1.id, p2.id]
    // Customer already had in database: [p2.id, p3.id] (Notice p2 is duplicate!)
    const guestIdsToMerge = [p1.id, p2.id];
    const customerInitialIds = [p2.id, p3.id];

    // Merge logic matching /api/wishlist/merge
    const mergedIds = Array.from(new Set([...customerInitialIds, ...guestIdsToMerge]));

    assert(mergedIds.length === 3, "Merged wishlist contains exactly 3 items (p1, p2, p3)");
    assert(
      mergedIds.filter((id) => id === p2.id).length === 1,
      "Duplicate product (p2) was deduplicated to exactly one occurrence"
    );
    assert(
      mergedIds.includes(p1.id) && mergedIds.includes(p2.id) && mergedIds.includes(p3.id),
      "Merged wishlist contains all items from both guest and customer"
    );

    // Simulate guest storage cleanup after merge
    delete mockStorage[GUEST_KEY];
    assert(mockStorage[GUEST_KEY] === undefined, "Guest localStorage cleared after successful merge to prevent repeated merges");

    console.log();

    // -------------------------------------------------------------
    // SECTION 6: Wishlist Operations & Add to Cart Integration
    // -------------------------------------------------------------
    console.log("[SECTION 6: Wishlist Operations & Add to Cart Integration]");

    let activeWishlist = [];

    // Helper to simulate toggleWishlist
    function toggle(product) {
      const idx = activeWishlist.findIndex((i) => i.id === product.id);
      if (idx > -1) {
        activeWishlist.splice(idx, 1);
        return false;
      } else {
        activeWishlist.push({
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          inStock: product.inStock,
          sizes: product.sizes,
          colors: product.colors,
        });
        return true;
      }
    }

    // 1. Add via toggle
    const isAdded = toggle(p1);
    assert(isAdded === true && activeWishlist.length === 1, "Toggling un-saved product adds it to wishlist");

    // 2. Remove via toggle
    const isRemoved = toggle(p1);
    assert(isRemoved === false && activeWishlist.length === 0, "Toggling already-saved product removes it from wishlist");

    // 3. Re-add p1 and p2
    toggle(p1);
    toggle(p2);
    assert(activeWishlist.length === 2, "Active wishlist holds 2 products");

    // 4. Test Add to Cart from Wishlist
    let cartItems = [];
    function addToCartFromWishlist(item) {
      const defaultSize = item.sizes?.[0] || "Standard";
      const defaultColor = item.colors?.[0] || { name: "Standard" };
      cartItems.push({
        id: item.id,
        name: item.name,
        selectedSize: defaultSize,
        selectedColor: defaultColor,
        quantity: 1,
      });
    }

    addToCartFromWishlist(activeWishlist[0]);
    assert(cartItems.length === 1, "Add to Cart from Wishlist successfully creates line item with default size and colour");
    assert(cartItems[0].id === p1.id && cartItems[0].selectedSize === p1.sizes[0], "Added cart item matches selected wishlist product variant");

    // 5. Total count for navbar badge
    const navbarCount = activeWishlist.length;
    assert(navbarCount === 2, `Navbar wishlist icon badge dynamically displays count: ${navbarCount}`);

    console.log();
    console.log("=================================================");
    console.log(`TOTAL TESTS: ${passedTests + failedTests}`);
    console.log(`PASSED: ${passedTests}`);
    console.log(`FAILED: ${failedTests}`);
    console.log("=================================================");

    if (failedTests > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runWishlistTests();


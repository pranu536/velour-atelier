const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { INITIAL_CATEGORIES, INITIAL_PRODUCTS } = require("../src/lib/seed-data");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting idempotent database seed for Velour Atelier...");

  let categoriesCount = 0;
  let productsCount = 0;
  let usersCount = 0;

  // 1. Seed Categories (Idempotent via unique slug)
  const categoryMap = {};
  for (const cat of INITIAL_CATEGORIES) {
    const upserted = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        image: cat.image,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
      },
    });
    categoryMap[cat.slug] = upserted.id;
    categoriesCount++;
    console.log(`[✓] Category upserted: ${cat.name} (${cat.slug})`);
  }

  // 2. Seed Products (Idempotent via unique slug)
  for (const prod of INITIAL_PRODUCTS) {
    const categoryId = categoryMap[prod.categorySlug];
    if (!categoryId) {
      console.warn(`[!] Skipping ${prod.name}: Category '${prod.categorySlug}' not found.`);
      continue;
    }

    // Strip client-only or non-schema fields (id, category, categorySlug, isTrending, isBestseller)
    const { id, category, categorySlug, isTrending, isBestseller, ...prodData } = prod;

    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        ...prodData,
        categoryId,
      },
      create: {
        ...prodData,
        categoryId,
      },
    });
    productsCount++;
    console.log(`[✓] Product upserted [${prod.gender}]: ${prod.name} (${prod.slug})`);
  }

  // 3. Seed Admin and Demo Customer (Idempotent via unique email)
  const rawAdminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin@Velour2026";
  const rawDemoPassword = process.env.SEED_DEMO_PASSWORD || "User@Velour2026";

  const adminPasswordHash = await bcrypt.hash(rawAdminPassword, 10);
  const demoPasswordHash = await bcrypt.hash(rawDemoPassword, 10);

  // Admin Account
  await prisma.user.upsert({
    where: { email: "admin@velour.com" },
    update: {
      name: "Velour Director",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
    create: {
      name: "Velour Director",
      email: "admin@velour.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });
  usersCount++;
  console.log("[✓] User upserted: admin@velour.com (Role: ADMIN)");

  // Demo Customer Account
  await prisma.user.upsert({
    where: { email: "demo@velour.com" },
    update: {
      name: "Aria Thorne",
      passwordHash: demoPasswordHash,
      role: "CUSTOMER",
    },
    create: {
      name: "Aria Thorne",
      email: "demo@velour.com",
      passwordHash: demoPasswordHash,
      role: "CUSTOMER",
    },
  });
  usersCount++;
  console.log("[✓] User upserted: demo@velour.com (Role: CUSTOMER)");

  console.log("\n=======================================================");
  console.log(`Database Seeding Completed Successfully!`);
  console.log(`• Categories upserted: ${categoriesCount}`);
  console.log(`• Products upserted:   ${productsCount}`);
  console.log(`• Users upserted:      ${usersCount}`);
  console.log("=======================================================\n");
}

main()
  .catch((e) => {
    console.error("Database Seeding Failed:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

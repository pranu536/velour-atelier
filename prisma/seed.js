const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { INITIAL_CATEGORIES, INITIAL_PRODUCTS } = require("../src/lib/seed-data");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed for unisex & all-audience collections...");

  // 1. Seed Categories
  const categoryMap = {};
  for (const cat of INITIAL_CATEGORIES) {
    const upserted = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categoryMap[cat.slug] = upserted.id;
    console.log(`Upserted category: ${cat.name}`);
  }

  // 2. Seed Products
  for (const prod of INITIAL_PRODUCTS) {
    const categoryId = categoryMap[prod.categorySlug];
    const { category, categorySlug, isTrending, ...prodData } = prod;
    
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: { ...prodData, categoryId },
      create: { ...prodData, categoryId },
    });
    console.log(`Upserted [${prod.gender}] ${prod.name}`);
  }

  // 3. Seed Admin and Demo User
  const adminPassword = await bcrypt.hash("Admin@Velour2026", 10);
  const userPassword = await bcrypt.hash("User@Velour2026", 10);

  await prisma.user.upsert({
    where: { email: "admin@velour.com" },
    update: {
      name: "Velour Director",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
    create: {
      name: "Velour Director",
      email: "admin@velour.com",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "demo@velour.com" },
    update: {
      name: "Aria Thorne",
      passwordHash: userPassword,
      role: "CUSTOMER",
    },
    create: {
      name: "Aria Thorne",
      email: "demo@velour.com",
      passwordHash: userPassword,
      role: "CUSTOMER",
    },
  });

  console.log("Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

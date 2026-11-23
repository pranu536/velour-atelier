import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from "@/lib/seed-data";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const category = searchParams.get("category");
    const gender = searchParams.get("gender");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";
    const featured = searchParams.get("featured");

    // Single product lookup by slug
    if (slug) {
      try {
        const product = await prisma.product.findUnique({
          where: { slug },
          include: { category: true },
        });
        if (product) {
          return NextResponse.json({ success: true, product });
        }
      } catch (dbErr) {
        console.warn("DB lookup notice:", dbErr.message);
      }

      const fallback = INITIAL_PRODUCTS.find((p) => p.slug === slug);
      if (fallback) {
        return NextResponse.json({ success: true, product: fallback });
      }
      return NextResponse.json({ success: false, error: "Garment not found" }, { status: 404 });
    }

    // Multiple products query
    let products = [];
    try {
      const where = {};
      if (category) {
        where.category = { slug: category };
      }
      if (gender && gender !== "all") {
        where.gender = { in: [gender, "Unisex"] };
      }
      if (featured === "true") {
        where.isFeatured = true;
      }
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { tags: { has: search.toLowerCase() } },
        ];
      }

      let orderBy = { createdAt: "desc" };
      if (sort === "price_asc") orderBy = { price: "asc" };
      if (sort === "price_desc") orderBy = { price: "desc" };
      if (sort === "rating") orderBy = { rating: "desc" };

      products = await prisma.product.findMany({
        where,
        include: { category: true },
        orderBy,
      });
    } catch (dbError) {
      // Graceful fallback to rich curated catalog
      products = [...INITIAL_PRODUCTS];

      if (category) {
        products = products.filter((p) => p.categorySlug === category);
      }
      if (gender && gender !== "all") {
        products = products.filter((p) => p.gender === gender || p.gender === "Unisex");
      }
      if (featured === "true") {
        products = products.filter((p) => p.isFeatured);
      }
      if (search) {
        const q = search.toLowerCase();
        products = products.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.tags?.some((t) => t.toLowerCase().includes(q))
        );
      }

      if (sort === "price_asc") products.sort((a, b) => a.price - b.price);
      else if (sort === "price_desc") products.sort((a, b) => b.price - a.price);
      else if (sort === "rating") products.sort((a, b) => b.rating - a.rating);
    }

    return NextResponse.json({ success: true, count: products.length, products });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const product = await prisma.product.create({
      data: body,
      include: { category: true },
    });
    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}

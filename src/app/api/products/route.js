import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const category = searchParams.get("category");
    const gender = searchParams.get("gender") || searchParams.get("department");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";
    const featured = searchParams.get("featured");
    const newArrival = searchParams.get("newArrival") || searchParams.get("new");
    const inStock = searchParams.get("inStock");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 50;
    const skip = (page - 1) * limit;

    // 1. Single product lookup by slug
    if (slug) {
      const product = await prisma.product.findUnique({
        where: { slug },
        include: { category: true },
      });

      if (!product) {
        return NextResponse.json(
          { success: false, error: "Garment not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, product });
    }

    // 2. Build where clause
    const where = {};

    // Department / Gender filter
    if (gender && gender !== "all") {
      if (gender === "Kids") {
        where.gender = "Kids";
      } else if (gender === "Unisex") {
        where.gender = "Unisex";
      } else if (gender === "Men" || gender === "Women") {
        const strict = searchParams.get("strict") === "true";
        where.gender = strict ? gender : { in: [gender, "Unisex"] };
      } else {
        where.gender = gender;
      }
    }

    // Category filter by slug
    if (category && category !== "all") {
      where.category = { slug: category };
    }

    // Featured filter
    if (featured === "true") {
      where.isFeatured = true;
    }

    // New Arrival filter
    if (newArrival === "true") {
      where.isNewArrival = true;
    }

    // In-Stock availability filter
    if (inStock === "true") {
      where.inStock = true;
    }

    // Search query filter (name, description, tags)
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { tags: { has: q.toLowerCase() } },
      ];
    }

    // Sorting
    let orderBy = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    else if (sort === "price_desc") orderBy = { price: "desc" };
    else if (sort === "rating") orderBy = { rating: "desc" };
    else if (sort === "newest") orderBy = { createdAt: "desc" };

    // Get total count matching criteria for pagination
    const total = await prisma.product.count({ where });

    // Fetch products with category relationship
    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy,
      skip,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      count: products.length,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      products,
    });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products from database" },
      { status: 500 }
    );
  }
}

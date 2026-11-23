import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const rawSlug = resolvedParams?.slug || "";
    const slug = rawSlug ? decodeURIComponent(rawSlug) : "";

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Slug is required" },
        { status: 400 }
      );
    }

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
  } catch (error) {
    console.error("Product slug API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product from database" },
      { status: 500 }
    );
  }
}


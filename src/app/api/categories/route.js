import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { INITIAL_CATEGORIES } from "@/lib/seed-data";

export async function GET() {
  try {
    let categories = [];
    try {
      categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
      });
    } catch (dbError) {
      console.warn("Using fallback categories:", dbError.message);
      categories = INITIAL_CATEGORIES.map((c, i) => ({
        id: `mock-cat-${i + 1}`,
        ...c,
      }));
    }

    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error("Categories API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

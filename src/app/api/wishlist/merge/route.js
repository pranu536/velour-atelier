import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/wishlist/merge
 * Merges guest wishlist product IDs into the logged-in customer's database record (User.wishlistIds).
 * Enforces deduplication, validates product existence, and requires customer session.
 */
export async function POST(request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Authentication required to merge wishlist." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { guestProductIds } = body;

    if (!Array.isArray(guestProductIds)) {
      return NextResponse.json(
        { error: "guestProductIds must be an array of product IDs." },
        { status: 400 }
      );
    }

    // Filter valid 24-char hex ObjectIds
    const validIds = guestProductIds.filter(
      (id) => typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id)
    );

    // Verify products exist in MongoDB Atlas
    const existingProducts =
      validIds.length > 0
        ? await prisma.product.findMany({
            where: { id: { in: validIds } },
            select: { id: true },
          })
        : [];

    const verifiedGuestIds = existingProducts.map((p) => p.id);

    // Retrieve customer's current wishlistIds
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, wishlistIds: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 404 }
      );
    }

    const currentIds = user.wishlistIds || [];

    // Deduplicate and merge IDs
    const mergedIds = Array.from(
      new Set([...currentIds, ...verifiedGuestIds])
    );

    // Persist to MongoDB Atlas User model
    await prisma.user.update({
      where: { id: session.user.id },
      data: { wishlistIds: mergedIds },
    });

    // Retrieve full product records for the merged list
    const items =
      mergedIds.length > 0
        ? await prisma.product.findMany({
            where: { id: { in: mergedIds } },
            include: { category: true },
          })
        : [];

    return NextResponse.json({
      success: true,
      wishlistIds: mergedIds,
      items,
      mergedCount: verifiedGuestIds.length,
      totalCount: mergedIds.length,
    });
  } catch (error) {
    console.error("POST /api/wishlist/merge error:", error);
    return NextResponse.json(
      { error: "Failed to merge guest wishlist into customer account." },
      { status: 500 }
    );
  }
}


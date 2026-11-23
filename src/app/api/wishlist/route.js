import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/wishlist
 * Retrieves wishlist products for authenticated user, or verifies guest IDs.
 */
export async function GET(request) {
  try {
    const session = await getServerAuthSession();
    const { searchParams } = new URL(request.url);

    // 1. Authenticated customer request
    if (session?.user?.id) {
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

      const wishlistIds = user.wishlistIds || [];
      if (wishlistIds.length === 0) {
        return NextResponse.json({
          success: true,
          authenticated: true,
          wishlistIds: [],
          items: [],
        });
      }

      // Fetch live product records matching wishlistIds
      const items = await prisma.product.findMany({
        where: { id: { in: wishlistIds } },
        include: { category: true },
      });

      return NextResponse.json({
        success: true,
        authenticated: true,
        wishlistIds,
        items,
      });
    }

    // 2. Unauthenticated guest request with IDs parameter
    const idsParam = searchParams.get("ids");
    if (idsParam) {
      const requestedIds = idsParam
        .split(",")
        .map((id) => id.trim())
        .filter((id) => /^[0-9a-fA-F]{24}$/.test(id));

      if (requestedIds.length === 0) {
        return NextResponse.json({
          success: true,
          authenticated: false,
          wishlistIds: [],
          items: [],
        });
      }

      const items = await prisma.product.findMany({
        where: { id: { in: requestedIds } },
        include: { category: true },
      });

      return NextResponse.json({
        success: true,
        authenticated: false,
        wishlistIds: requestedIds,
        items,
      });
    }

    // Unauthenticated and no IDs provided
    return NextResponse.json({
      success: true,
      authenticated: false,
      wishlistIds: [],
      items: [],
    });
  } catch (error) {
    console.error("GET /api/wishlist error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve wishlist." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/wishlist
 * Adds, removes, or toggles a product in the authenticated user's wishlistIds.
 * Requires customer authorization and validates product ID against live database.
 */
export async function POST(request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Authentication required to update wishlist." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, action = "toggle" } = body;

    // Validate productId format (24-character hexadecimal MongoDB ObjectId)
    if (
      !productId ||
      typeof productId !== "string" ||
      !/^[0-9a-fA-F]{24}$/.test(productId)
    ) {
      return NextResponse.json(
        { error: "Invalid product identifier format." },
        { status: 400 }
      );
    }

    // Validate product exists in MongoDB Atlas
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found in atelier catalog." },
        { status: 404 }
      );
    }

    // Fetch current user wishlist
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
    const isCurrentlySaved = currentIds.includes(productId);
    let updatedIds;

    if (action === "add") {
      updatedIds = isCurrentlySaved ? currentIds : [...currentIds, productId];
    } else if (action === "remove") {
      updatedIds = currentIds.filter((id) => id !== productId);
    } else {
      // Toggle
      updatedIds = isCurrentlySaved
        ? currentIds.filter((id) => id !== productId)
        : [...currentIds, productId];
    }

    // Persist to MongoDB Atlas User model
    await prisma.user.update({
      where: { id: session.user.id },
      data: { wishlistIds: updatedIds },
    });

    return NextResponse.json({
      success: true,
      wishlistIds: updatedIds,
      isWishlisted: updatedIds.includes(productId),
      productId,
      action: updatedIds.includes(productId) ? "added" : "removed",
    });
  } catch (error) {
    console.error("POST /api/wishlist error:", error);
    return NextResponse.json(
      { error: "Failed to update wishlist." },
      { status: 500 }
    );
  }
}


import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/orders/[id]
 * Retrieves an order by either its MongoDB id or orderNumber (e.g., VA-20261123-ABCD).
 * Enforces customer authentication and ownership (or ADMIN role).
 */
export async function GET(request, context) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required to view order details." },
        { status: 401 }
      );
    }

    const params = await context.params;
    const { id } = params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid order identifier." },
        { status: 400 }
      );
    }

    // Determine query filter: support both MongoDB ObjectId and orderNumber string
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const identifierCondition = isObjectId
      ? { OR: [{ id }, { orderNumber: id }] }
      : { orderNumber: id };

    // Query order with ownership validation
    const order = await prisma.order.findFirst({
      where: {
        ...identifierCondition,
        // Restrict to customer unless user is an ADMIN
        ...(session.user.role === "ADMIN" ? {} : { userId: session.user.id }),
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found or access denied." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while fetching order details." },
      { status: 500 }
    );
  }
}


import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/addresses/[id]/default
 * Sets the specified address as the customer's primary default delivery address.
 * Sets isDefault: false on all other addresses belonging to this customer.
 */
export async function PATCH(request, context) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to update default address." },
        { status: 401 }
      );
    }

    const params = await context.params;
    const addressId = params?.id;

    if (!addressId) {
      return NextResponse.json(
        { error: "Address identifier is required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, addresses: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Customer account not found." },
        { status: 404 }
      );
    }

    const existingAddresses = user.addresses || [];
    const targetAddress = existingAddresses.find((a) => a.id === addressId);

    // Ownership check: Prevent setting default on an address belonging to another user
    if (!targetAddress) {
      return NextResponse.json(
        { error: "Address not found or unauthorized." },
        { status: 404 }
      );
    }

    const updatedAddresses = existingAddresses.map((a) => ({
      ...a,
      isDefault: a.id === addressId,
    }));

    await prisma.user.update({
      where: { id: session.user.id },
      data: { addresses: updatedAddresses },
    });

    return NextResponse.json({
      success: true,
      message: "Default delivery address updated.",
      addresses: updatedAddresses,
    });
  } catch (error) {
    console.error("PATCH /api/addresses/[id]/default error:", error);
    return NextResponse.json(
      { error: "Failed to update default delivery address." },
      { status: 500 }
    );
  }
}


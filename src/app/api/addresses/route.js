import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { validateAddress } from "@/lib/addressValidation";

export const dynamic = "force-dynamic";

/**
 * GET /api/addresses
 * Retrieves saved delivery addresses for the authenticated customer.
 */
export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to view addresses." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { addresses: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Customer account not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      addresses: user.addresses || [],
    });
  } catch (error) {
    console.error("GET /api/addresses error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve delivery addresses." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/addresses
 * Adds a new delivery address to the customer's account.
 */
export async function POST(request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to add an address." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { isValid, errors, sanitized } = validateAddress(body);

    if (!isValid) {
      return NextResponse.json(
        { error: "Validation failed. Please correct the highlighted fields.", errors },
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
    const isFirstAddress = existingAddresses.length === 0;
    const shouldBeDefault = isFirstAddress || sanitized.isDefault;

    // Generate unique ID for this address
    const addressId = `addr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newAddress = {
      id: addressId,
      ...sanitized,
      isDefault: shouldBeDefault,
    };

    // If new address is default, reset default flag on all other addresses
    const updatedAddresses = shouldBeDefault
      ? [
          ...existingAddresses.map((a) => ({ ...a, isDefault: false })),
          newAddress,
        ]
      : [...existingAddresses, newAddress];

    await prisma.user.update({
      where: { id: session.user.id },
      data: { addresses: updatedAddresses },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Delivery address saved successfully.",
        address: newAddress,
        addresses: updatedAddresses,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/addresses error:", error);
    return NextResponse.json(
      { error: "Failed to save delivery address." },
      { status: 500 }
    );
  }
}


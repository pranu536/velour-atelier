import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { validateAddress } from "@/lib/addressValidation";

export const dynamic = "force-dynamic";

/**
 * PUT /api/addresses/[id]
 * Updates an existing delivery address for the authenticated customer.
 * Enforces ownership check: customers can only edit their own addresses.
 */
export async function PUT(request, context) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to edit addresses." },
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
    const targetIndex = existingAddresses.findIndex((a) => a.id === addressId);

    // Ownership check: Prevent editing an address belonging to another user
    if (targetIndex === -1) {
      return NextResponse.json(
        { error: "Address not found or unauthorized." },
        { status: 404 }
      );
    }

    const targetAddress = existingAddresses[targetIndex];
    const shouldBeDefault = sanitized.isDefault || (targetAddress.isDefault && existingAddresses.length === 1);

    const updatedAddress = {
      ...targetAddress,
      ...sanitized,
      id: addressId,
      isDefault: shouldBeDefault,
    };

    let updatedAddresses;
    if (shouldBeDefault) {
      // Unset default on all other addresses
      updatedAddresses = existingAddresses.map((a, idx) =>
        idx === targetIndex ? updatedAddress : { ...a, isDefault: false }
      );
    } else {
      updatedAddresses = existingAddresses.map((a, idx) =>
        idx === targetIndex ? updatedAddress : a
      );
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { addresses: updatedAddresses },
    });

    return NextResponse.json({
      success: true,
      message: "Delivery address updated successfully.",
      address: updatedAddress,
      addresses: updatedAddresses,
    });
  } catch (error) {
    console.error("PUT /api/addresses/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update delivery address." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/addresses/[id]
 * Deletes an existing delivery address for the authenticated customer.
 * Enforces ownership check: customers can only delete their own addresses.
 */
export async function DELETE(request, context) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to delete addresses." },
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
    const targetIndex = existingAddresses.findIndex((a) => a.id === addressId);

    // Ownership check: Prevent deleting an address belonging to another user
    if (targetIndex === -1) {
      return NextResponse.json(
        { error: "Address not found or unauthorized." },
        { status: 404 }
      );
    }

    const wasDefault = existingAddresses[targetIndex].isDefault;
    let remainingAddresses = existingAddresses.filter((a) => a.id !== addressId);

    // If the deleted address was default and other addresses remain, promote first address to default
    if (wasDefault && remainingAddresses.length > 0) {
      remainingAddresses = remainingAddresses.map((a, idx) =>
        idx === 0 ? { ...a, isDefault: true } : a
      );
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { addresses: remainingAddresses },
    });

    return NextResponse.json({
      success: true,
      message: "Delivery address removed.",
      addresses: remainingAddresses,
    });
  } catch (error) {
    console.error("DELETE /api/addresses/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to remove delivery address." },
      { status: 500 }
    );
  }
}


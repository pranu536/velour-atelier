import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

// Standard RFC-compliant email regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseErr) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload provided" },
        { status: 400 }
      );
    }

    const { name, email, password } = body || {};

    // 1. Name validation and sanitization
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Full name is required" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      return NextResponse.json(
        { success: false, error: "Name must be at least 2 characters long" },
        { status: 400 }
      );
    }
    if (trimmedName.length > 70) {
      return NextResponse.json(
        { success: false, error: "Name cannot exceed 70 characters" },
        { status: 400 }
      );
    }

    // 2. Email validation and normalization
    if (!email || typeof email !== "string" || email.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Email address is required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    if (!EMAIL_REGEX.test(cleanEmail) || cleanEmail.length > 254) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // 3. Password validation
    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Password is required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }
    if (password.length > 100) {
      return NextResponse.json(
        { success: false, error: "Password cannot exceed 100 characters" },
        { status: 400 }
      );
    }

    // 4. Duplicate email verification
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email address already exists" },
        { status: 409 }
      );
    }

    // 5. Secure password hashing with 10 salt rounds
    const passwordHash = await bcrypt.hash(password, 10);

    // 6. User creation in MongoDB Atlas
    // Strictly assign role: "CUSTOMER" to prevent privilege escalation
    const newUser = await prisma.user.create({
      data: {
        name: trimmedName,
        email: cleanEmail,
        passwordHash,
        role: "CUSTOMER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // 7. Success response (never exposes passwordHash)
    return NextResponse.json(
      {
        success: true,
        message: "Atelier account created successfully",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration endpoint error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while creating your account" },
      { status: 500 }
    );
  }
}

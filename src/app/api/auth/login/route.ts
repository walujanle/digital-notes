import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { cookies } from "next/headers";
import { generateToken } from "@/lib/auth";
import { setCsrfCookie } from "@/lib/csrf";

const prisma = new PrismaClient();

// Define validation schema for login data
const loginSchema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false), // Add rememberMe field
});

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();

    // Validate the input data
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { identifier, password, rememberMe } = validation.data;

    // Find the user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });

    // If user doesn't exist or password doesn't match
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Set expiration based on "Remember Me" option
    const expiry = new Date();
    // If "Remember Me" is checked, set longer expiration (30 days)
    // Otherwise set shorter expiration (1 day)
    const expiryDays = rememberMe ? 30 : 1;
    expiry.setDate(expiry.getDate() + expiryDays);

    // Generate JWT token with appropriate expiration
    const token = await generateToken(user.id, expiryDays);

    // Store session in database
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: expiry,
      },
    });

    // Set the token in a HTTP-only cookie
    const cookieStore = cookies();
    cookieStore.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: expiryDays * 24 * 60 * 60, // Convert days to seconds
    });

    // Generate CSRF token and set in cookie
    await setCsrfCookie();

    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json({
      message: "Login successful",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

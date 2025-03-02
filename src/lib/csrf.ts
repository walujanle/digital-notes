import { cookies } from "next/headers";
import crypto from "crypto";
import { jwtVerify, SignJWT } from "jose";

// Secret for CSRF tokens
const CSRF_SECRET =
  process.env.CSRF_SECRET || process.env.JWT_SECRET || "csrf-fallback-secret";

/**
 * Generate a CSRF token
 */
export async function generateCsrfToken(): Promise<string> {
  const secret = new TextEncoder().encode(CSRF_SECRET);
  const token = crypto.randomBytes(32).toString("hex");

  const jwt = await new SignJWT({ token })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);

  return jwt;
}

/**
 * Verify a CSRF token
 */
export async function verifyCsrfToken(token: string): Promise<boolean> {
  try {
    const secret = new TextEncoder().encode(CSRF_SECRET);
    await jwtVerify(token, secret);
    return true;
  } catch (error) {
    console.error("CSRF verification failed:", error);
    return false;
  }
}

/**
 * Set CSRF token in cookies
 */
export async function setCsrfCookie(): Promise<string> {
  const token = await generateCsrfToken();
  const cookieStore = cookies();

  cookieStore.set({
    name: "csrf_token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  });

  return token;
}

/**
 * Middleware to validate CSRF token
 */
export async function validateCsrf(request: Request) {
  // Skip validation for GET, HEAD, OPTIONS requests
  const method = request.method.toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    return true;
  }

  try {
    const cookieStore = cookies();
    const csrfCookie = cookieStore.get("csrf_token")?.value;

    if (!csrfCookie) {
      return false;
    }

    // Get token from header
    const csrfHeader = request.headers.get("X-CSRF-Token");

    if (!csrfHeader || csrfHeader !== csrfCookie) {
      return false;
    }

    return await verifyCsrfToken(csrfCookie);
  } catch (error) {
    console.error("CSRF validation error:", error);
    return false;
  }
}

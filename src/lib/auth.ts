import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { prisma } from "@/lib/prisma";

// Type for user data in token
interface TokenPayload {
  userId: string;
  exp: number;
}

/**
 * Get the authenticated user from the request
 * @returns User object or null if not authenticated
 */
export async function getAuthUser() {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    if (!authToken) {
      console.log("No auth token found");
      return null;
    }

    // Verify the token
    const jwtSecret = new TextEncoder().encode(
      process.env.JWT_SECRET || "your-fallback-secret-key-for-development"
    );

    const { payload } = (await jwtVerify(authToken, jwtSecret)) as {
      payload: TokenPayload;
    };

    // Check if token is expired
    if (payload.exp * 1000 < Date.now()) {
      console.log("Token expired");
      return null;
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      console.log("User not found in database");
      return null;
    }

    return user;
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

/**
 * Middleware to check if user is authenticated
 * @returns Response or null if authenticated
 */
export async function requireAuth() {
  const user = await getAuthUser();

  if (!user) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        message: "You must be logged in to access this resource",
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  return null;
}

/**
 * Generate a JWT token for authentication
 * @param userId The user ID to include in the token
 * @param expiryDays Number of days before token expires (default 7)
 */
export async function generateToken(
  userId: string,
  expiryDays: number = 7
): Promise<string> {
  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || "your-fallback-secret-key-for-development"
  );

  // Current time in seconds
  const iat = Math.floor(Date.now() / 1000);
  // Expiry in specified days
  const exp = iat + 60 * 60 * 24 * expiryDays;

  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(secret);

  return token;
}

export async function getUserById(id: string) {
  try {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Clear authentication tokens/cookies
 */
export async function clearAuthCookies() {
  const cookieStore = cookies();

  cookieStore.set({
    name: "auth_token",
    value: "",
    expires: new Date(0),
    path: "/",
  });
}

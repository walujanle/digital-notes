import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  try {
    const cookieStore = cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    if (authToken) {
      // Simply mark the token as expired in the database if we have it
      // No need to verify or decode the JWT
      try {
        await prisma.session.updateMany({
          where: {
            token: authToken,
          },
          data: {
            expired: true,
          },
        });
      } catch (e) {
        console.error("Failed to update session during logout:", e);
        // Continue with logout process even if updating the session fails
      }

      // Delete the auth cookie
      cookieStore.delete("auth_token");
    }

    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

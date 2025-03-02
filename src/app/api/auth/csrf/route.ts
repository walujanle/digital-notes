import { NextResponse } from "next/server";
import { setCsrfCookie } from "@/lib/csrf";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await setCsrfCookie();

    return NextResponse.json({
      message: "CSRF token generated",
    });
  } catch (error) {
    console.error("CSRF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate CSRF token" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Paths that require authentication
const PROTECTED_PATHS = ["/notes", "/api/notes"];

// Paths that are open to the public
const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/api/auth/login",
  "/api/auth/signup",
  "/",
];

// Simple in-memory store for rate limiting
const rateLimit = {
  window: 60 * 1000, // 1 minute
  max: 100, // max requests per window
  store: new Map<string, { count: number; reset: number }>(),
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Get the origin from request headers
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  const referer = request.headers.get("referer");

  // Add security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;"
  );

  // Skip middleware for static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Check for API requests from external origins
  if (pathname.startsWith("/api/")) {
    // For API requests, verify the origin matches our host
    if (origin) {
      const originHostname = new URL(origin).hostname;
      const currentHost = host ? host.split(":")[0] : "";

      // If origin doesn't match our host (and isn't localhost for development)
      if (
        originHostname !== currentHost &&
        originHostname !== "localhost" &&
        !originHostname.match(/^127\.\d+\.\d+\.\d+$/)
      ) {
        return NextResponse.json(
          {
            error: "Forbidden",
            message: "Cross-origin requests are not allowed",
          },
          { status: 403 }
        );
      }
    } else if (referer && !pathname.startsWith("/api/auth/")) {
      // No origin but has referer - check if referer is from our domain
      try {
        const refererHostname = new URL(referer).hostname;
        const currentHost = host ? host.split(":")[0] : "";

        if (
          refererHostname !== currentHost &&
          refererHostname !== "localhost" &&
          !refererHostname.match(/^127\.\d+\.\d+\.\d+$/)
        ) {
          return NextResponse.json(
            {
              error: "Forbidden",
              message: "External API requests are not allowed",
            },
            { status: 403 }
          );
        }
      } catch {
        // Invalid referer format
        return NextResponse.json(
          { error: "Forbidden", message: "Invalid request origin" },
          { status: 403 }
        );
      }
    }

    // Set strict CORS headers
    response.headers.set("Access-Control-Allow-Origin", origin || "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  // Check if path needs protection
  const needsAuth = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  const isPublic = PUBLIC_PATHS.some((path) => pathname === path);

  if (!needsAuth || isPublic) {
    return NextResponse.next();
  }

  // Check for auth token
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    // If API route, return 401
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    // Redirect to login page for other routes
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", encodeURI(pathname));
    return NextResponse.redirect(url);
  }

  // Implement basic rate limiting for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const ip = request.ip || "unknown";
    const now = Date.now();

    // Clean up old entries
    rateLimit.store.forEach((entry, key) => {
      if (entry.reset < now) {
        rateLimit.store.delete(key);
      }
    });

    const entry = rateLimit.store.get(ip) || {
      count: 0,
      reset: now + rateLimit.window,
    };

    if (entry.count >= rateLimit.max) {
      return new NextResponse(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": `${Math.ceil((entry.reset - now) / 1000)}`,
        },
      });
    }

    entry.count++;
    rateLimit.store.set(ip, entry);

    response.headers.set("X-RateLimit-Limit", rateLimit.max.toString());
    response.headers.set(
      "X-RateLimit-Remaining",
      (rateLimit.max - entry.count).toString()
    );
    response.headers.set("X-RateLimit-Reset", entry.reset.toString());
  }

  // Token exists, allow the request to proceed
  return response;
}

export const config = {
  matcher: [
    // Apply to all API routes
    "/api/:path*",
    // Apply to all pages except static assets
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

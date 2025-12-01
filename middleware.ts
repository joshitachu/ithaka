import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that should be accessible without an authenticated user_code cookie
const PUBLIC_PATHS = [
  "/login",
  "/api/auth",
  "/api/cpv", // public CPV lookup
  "/favicon.ico",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow Next internals, static assets and public paths
  if (pathname.startsWith("/_next") || pathname.startsWith("/static") || PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // If cookie present, allow
  // If cookie present, allow
  const userCode = req.cookies.get("user_code")?.value;
  if (userCode) {
    return NextResponse.next();
  }

  // NOTE: Authentication must go through the login route (/api/auth/login) which sets
  // an HttpOnly cookie. We do NOT accept raw X-User-Code headers here to prevent
  // bypassing the login flow. Requests without the cookie will be redirected to /login
  // (or receive 401 for API paths).

  // If this is an API request, return JSON 401 with a helpful message
  if (pathname.startsWith("/api")) {
    return new Response(JSON.stringify({ error: "Authenticate first: please enter your 12-digit code." }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  // Otherwise redirect to the login page
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

export const config = {
  // run middleware for all routes
  matcher: "/:path*",
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Pages that require login
const protectedRoutes = ["/dashboard", "/lobby", "/game", "/profile"];

// Pages that logged-in users shouldn't see
const authRoutes = ["/login", "/signup"];

export function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  // Not logged in → redirect to login
  if (!token && protectedRoutes.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Already logged in → redirect to dashboard
  if (token && authRoutes.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Only run on these paths (skip static files, images, etc.)
export const config = {
  matcher: ["/dashboard/:path*", "/lobby/:path*", "/game/:path*", "/profile/:path*", "/login", "/signup"],
};

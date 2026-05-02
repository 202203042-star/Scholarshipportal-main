import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/api/auth",
  "/api/register",
  "/api/admin/setup",
  "/_next",
  "/favicon.ico",
  "/icon",
  "/apple-icon",
  "/placeholder",
  "/logout.png",
];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow all public paths and static files
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  // Check JWT token
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    // next-auth v5 uses a different cookie name
    cookieName:
      process.env.NODE_ENV === "production"
        ? "__Secure-authjs.session-token"
        : "authjs.session-token",
  });

  const isLoggedIn = !!token;

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.png|.*\\.svg|.*\\.jpg|.*\\.ico).*)"],
};

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

  // Check JWT token (works on Edge — no mongoose needed)
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isLoggedIn = !!token;

  // Unauthenticated → redirect to login
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.png|.*\\.svg|.*\\.jpg|.*\\.ico).*)"],
};

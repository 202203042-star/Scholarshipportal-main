import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/api/auth",
  "/api/register",
  "/api/admin/setup",
  "/api/contact",
  "/_next",
  "/favicon.ico",
  "/icon",
  "/apple-icon",
  "/placeholder",
  "/logout.png",
];

async function getSessionToken(req: NextRequest) {
  // Try all possible next-auth v5 cookie names
  const cookieNames = [
    "__Secure-authjs.session-token", // production HTTPS
    "authjs.session-token",           // local HTTP
    "__Host-authjs.session-token",    // some v5 configs
    "next-auth.session-token",        // v4 fallback
    "__Secure-next-auth.session-token", // v4 production
  ];

  for (const cookieName of cookieNames) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName,
    });
    if (token) return token;
  }
  return null;
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow all public paths and static files
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  const token = await getSessionToken(req);
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

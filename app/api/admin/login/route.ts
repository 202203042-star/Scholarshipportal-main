import { NextRequest, NextResponse } from "next/server";

// Admin credentials - change these!
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "Admin@123";
const ADMIN_TOKEN = "scholarhub-admin-secret-token-2025";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username aur password zaroori hai" }, { status: 400 });
    }

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Galat username ya password" }, { status: 401 });
    }

    return NextResponse.json({
      message: "Admin login successful",
      token: ADMIN_TOKEN,
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
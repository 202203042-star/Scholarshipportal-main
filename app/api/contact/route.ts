import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Contact from "@/models/Contact";
import { getToken } from "next-auth/jwt";

// Helper — try both cookie names (next-auth v5 beta inconsistency)
async function getAdminToken(req: NextRequest) {
  // Try secure cookie first (production/HTTPS)
  let token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: "__Secure-authjs.session-token",
  });
  if (token) return token;

  // Try non-secure cookie (local dev HTTP)
  token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: "authjs.session-token",
  });
  return token;
}

// POST — submit contact query (public, no auth needed)
export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    await connectDB();
    const contact = await Contact.create({ name, email, message });
    return NextResponse.json({ message: "Message sent successfully!", contact }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET — fetch all queries (admin only)
export async function GET(req: NextRequest) {
  try {
    const token = await getAdminToken(req);
    if (!token || (token as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const contacts = await Contact.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ contacts });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH — mark as read/unread (admin only)
export async function PATCH(req: NextRequest) {
  try {
    const token = await getAdminToken(req);
    if (!token || (token as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const { id, isRead } = await req.json();
    const contact = await Contact.findByIdAndUpdate(id, { isRead }, { new: true });
    return NextResponse.json({ contact });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE — delete a query (admin only)
export async function DELETE(req: NextRequest) {
  try {
    const token = await getAdminToken(req);
    if (!token || (token as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const { id } = await req.json();
    await Contact.findByIdAndDelete(id);
    return NextResponse.json({ message: "Deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

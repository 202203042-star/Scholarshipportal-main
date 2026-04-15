import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Scholarship from "@/models/Scholarship";

const ADMIN_TOKEN = "scholarhub-admin-secret-token-2025";

function checkAuth(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  return token === ADMIN_TOKEN;
}

// PUT - edit scholarship
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await connectDB();
    const body = await req.json();
    const scholarship = await Scholarship.findByIdAndUpdate(params.id, body, { new: true });
    if (!scholarship) return NextResponse.json({ error: "Scholarship not found" }, { status: 404 });
    return NextResponse.json({ message: "Scholarship updated successfully!", scholarship });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE - remove scholarship
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await connectDB();
    const scholarship = await Scholarship.findByIdAndDelete(params.id);
    if (!scholarship) return NextResponse.json({ error: "Scholarship not found" }, { status: 404 });
    return NextResponse.json({ message: "Scholarship deleted successfully!" });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
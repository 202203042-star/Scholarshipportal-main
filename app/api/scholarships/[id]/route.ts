import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Scholarship from "@/models/Scholarship";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const s = await Scholarship.findById(id);
    if (!s) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(s);
  } catch {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const body = await req.json();
    const updated = await Scholarship.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: false }
    );
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ scholarship: updated, message: "Update ho gaya!" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "DB error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const deleted = await Scholarship.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ message: "Delete ho gaya!" });
  } catch {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
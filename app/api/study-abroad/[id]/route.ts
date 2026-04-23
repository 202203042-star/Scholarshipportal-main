// app/api/study-abroad/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import mongoose from "mongoose";

const AbroadScholarshipSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  provider:    { type: String, required: true },
  country:     { type: String, required: true },
  amount:      { type: String, required: true },
  deadline:    { type: String, required: true },
  eligibility: { type: String, required: true },
  level:       { type: String, default: "Master" },
  fields:      { type: String, default: "" },
  bond:        { type: String, default: "No bond" },
  applyLink:   { type: String, required: true },
  documents:   { type: [String], default: [] },
  tips:        { type: String, default: "" },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

const AbroadScholarship = mongoose.models.AbroadScholarship ||
  mongoose.model("AbroadScholarship", AbroadScholarshipSchema);

// ── PUT — update ────────────────────────────────────────────────
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const body = await req.json();
    const updated = await AbroadScholarship.findByIdAndUpdate(params.id, body, { new: true });
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ scholarship: updated, message: "Updated!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "DB error" }, { status: 500 });
  }
}

// ── DELETE ──────────────────────────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const deleted = await AbroadScholarship.findByIdAndDelete(params.id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ message: "Deleted!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "DB error" }, { status: 500 });
  }
}
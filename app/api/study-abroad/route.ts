// app/api/study-abroad/route.ts

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import mongoose from "mongoose";

// ── Model ──────────────────────────────────────────────────────
const AbroadScholarshipSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  provider:    { type: String, required: true },
  country:     { type: String, required: true, enum: ["usa", "uk", "canada", "australia", "germany"] },
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

// ── GET — fetch all ─────────────────────────────────────────────
export async function GET() {
  try {
    await connectDB();
    const scholarships = await AbroadScholarship.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ scholarships });
  } catch {
    return NextResponse.json({ scholarships: [], error: "DB error" }, { status: 500 });
  }
}

// ── POST — create new ───────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const body = await req.json();
    const scholarship = await AbroadScholarship.create(body);
    return NextResponse.json({ scholarship, message: "Added successfully!" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "DB error" }, { status: 500 });
  }
}
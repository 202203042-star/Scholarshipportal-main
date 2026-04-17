import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Scholarship from "@/models/Scholarship";
import { auth } from "@/lib/auth";

// Auto-inactive expired scholarships
async function autoDeactivateExpired() {
  const now = new Date();
  await Scholarship.updateMany(
    { deadline: { $lt: now }, isActive: true },
    { $set: { isActive: false } }
  );
}

export async function GET() {
  try {
    await connectDB();
    await autoDeactivateExpired();
    // titleHi aur titleGu explicitly select karo
    const scholarships = await Scholarship.find({})
      .select("title titleHi titleGu description amount eligibility category deadline applyLink youtubeLink isActive level course state gender income documents applicants createdAt")
      .sort({ createdAt: -1 });
    return NextResponse.json({ scholarships });
  } catch {
    return NextResponse.json({ scholarships: [], error: "DB error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const body = await req.json();
    const scholarship = await Scholarship.create(body);
    return NextResponse.json({ scholarship, message: "Scholarship added successfully!" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "DB error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Scholarship from "@/models/Scholarship";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();
    const scholarships = await Scholarship.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ scholarships });  // ← ye fix hai
  } catch (error) {
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
    return NextResponse.json({ scholarship, message: "Scholarship add ho gayi!" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Kuch galat hua" }, { status: 500 });
  }
}
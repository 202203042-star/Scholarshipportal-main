import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    const existing = await User.findOne({ email: "admin_admin@scholarhub.admin" });
    if (existing) {
      return NextResponse.json({ message: "Admin already exists!" });
    }

    const hashedPassword = await bcrypt.hash("admin123", 12);
    await User.create({
      name: "Admin",
      email: "admin_admin@scholarhub.admin",
      password: hashedPassword,
      role: "admin",
    });

    return NextResponse.json({
      message: "✅ Admin created!",
      username: "admin",
      password: "admin123",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
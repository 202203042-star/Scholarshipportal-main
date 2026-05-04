import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import StudentNotification from "@/models/StudentNotification";
import { getToken } from "next-auth/jwt";

async function getSessionToken(req: NextRequest) {
  let token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, cookieName: "__Secure-authjs.session-token" });
  if (!token) token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, cookieName: "authjs.session-token" });
  return token;
}

// GET — fetch notifications for logged-in student
export async function GET(req: NextRequest) {
  try {
    const token = await getSessionToken(req);
    if (!token || !token.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const notifications = await StudentNotification.find({ userEmail: token.email })
      .sort({ createdAt: -1 })
      .limit(20);
    const unreadCount = await StudentNotification.countDocuments({ userEmail: token.email, isRead: false });
    return NextResponse.json({ notifications, unreadCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH — mark all as read
export async function PATCH(req: NextRequest) {
  try {
    const token = await getSessionToken(req);
    if (!token || !token.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    await StudentNotification.updateMany(
      { userEmail: token.email, isRead: false },
      { $set: { isRead: true } }
    );
    return NextResponse.json({ message: "All marked as read" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

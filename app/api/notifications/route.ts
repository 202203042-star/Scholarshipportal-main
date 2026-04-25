import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import Scholarship from "@/models/Scholarship";
import User from "@/models/User";
import { auth } from "@/lib/auth";
import nodemailer from "nodemailer";

async function sendScholarshipNotification(
  title: string,
  message: string,
  type: string,
  scholarshipId?: string
) {
  try {
    await connectDB();

    let targetEmails: Set<string> = new Set();
    let targetUsers: Map<string, string> = new Map(); // email -> name

    if (scholarshipId) {
      // Fetch scholarship
      const scholarship = await Scholarship.findById(scholarshipId);
      if (!scholarship) return;

      const scholarshipCategories: string[] = Array.isArray(scholarship.category)
        ? scholarship.category
        : [scholarship.category];

      // 1. Applicants — those who have already applied
      if (scholarship.applicants?.length) {
        const applicantUsers = await User.find({
          _id: { $in: scholarship.applicants }
        }).select("email name");

        applicantUsers.forEach(u => {
          targetEmails.add(u.email);
          targetUsers.set(u.email, u.name || "");
        });
      }

      // 2. Students with matching categories
      const categoryUsers = await User.find({
        $or: [
          { category: { $in: scholarshipCategories } },
          { category: "General" },
        ]
      }).select("email name");

      categoryUsers.forEach(u => {
        targetEmails.add(u.email);
        targetUsers.set(u.email, u.name || "");
      });

    } else {
      // No specific scholarship — send to all users
      const allUsers = await User.find({}).select("email name");
      allUsers.forEach(u => {
        targetEmails.add(u.email);
        targetUsers.set(u.email, u.name || "");
      });
    }

    if (targetEmails.size === 0) {
      console.log("No user found to send email");
      return;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const typeColors: Record<string, { bg: string; color: string; emoji: string }> = {
      info:    { bg: "#eff6ff", color: "#1d4ed8", emoji: "ℹ️" },
      warning: { bg: "#fffbeb", color: "#d97706", emoji: "⚠️" },
      success: { bg: "#f0fdf4", color: "#16a34a", emoji: "✅" },
    };
    const tc = typeColors[type] || typeColors.info;

    // Send each user a separate email
    const emailPromises = Array.from(targetEmails).map(email => {
      const userName = targetUsers.get(email) || "";
      return transporter.sendMail({
        from: `"ScholarHub" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `${tc.emoji} ${title} — ScholarHub`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:28px;background:#f8fafc;border-radius:16px;">
            
            <div style="text-align:center;margin-bottom:24px;">
              <div style="display:inline-block;background:linear-gradient(135deg,#1d4ed8,#4f46e5);border-radius:14px;padding:14px 24px;">
                <span style="color:white;font-size:22px;">🎓</span>
                <span style="color:white;font-weight:800;font-size:18px;margin-left:8px;">ScholarHub</span>
              </div>
            </div>

            <div style="background:white;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
              
              <div style="background:${tc.bg};padding:20px 24px;border-bottom:2px solid ${tc.color}20;">
                <p style="margin:0;font-size:13px;font-weight:700;color:${tc.color};text-transform:uppercase;letter-spacing:1px;">
                  ${tc.emoji} Scholarship Notification
                </p>
                <h2 style="margin:6px 0 0;color:#1a1a2e;font-size:20px;">${title}</h2>
              </div>

              <div style="padding:24px;">
                ${userName ? `<p style="color:#64748b;font-size:14px;margin:0 0 16px;">Hello <strong>${userName}</strong>,</p>` : ""}
                <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">${message}</p>
                
                <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}" 
                  style="display:inline-block;background:linear-gradient(135deg,#1d4ed8,#4f46e5);color:white;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:700;font-size:14px;">
                  Open ScholarHub →
                </a>
              </div>

              <div style="padding:16px 24px;background:#f8fafc;border-top:1px solid #f0f0f0;">
                <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
                  This email was sent by ScholarHub admin.<br/>
                  Scholarship Portal — Gujarat & Central
                </p>
              </div>
            </div>
          </div>
        `,
      });
    });

    await Promise.allSettled(emailPromises);
    console.log(`✅ ${targetEmails.size} users were emailed`);
  } catch (error) {
    console.error("Email error:", error);
  }
}

export async function GET() {
  try {
    await connectDB();
    const notifications = await Notification.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ notifications });
  } catch {
    return NextResponse.json({ notifications: [], error: "DB error" }, { status: 500 });
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

    // Save to the database
    const notification = await Notification.create({
      title: body.title,
      message: body.message,
      type: body.type,
      scholarshipId: body.scholarshipId || null,
    });

    // Background: send emails to all users
    sendScholarshipNotification(
      body.title,
      body.message,
      body.type,
      body.scholarshipId
    );

    return NextResponse.json({
      notification,
      message: "Notification sent!"
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
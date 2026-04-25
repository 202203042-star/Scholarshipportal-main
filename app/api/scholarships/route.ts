// app/api/scholarships/route.ts

import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import connectDB from "@/lib/mongodb";
import Scholarship from "@/models/Scholarship";
import User from "@/models/User";
import { auth } from "@/lib/auth";

// ── Gmail transporter (same as OTP) ──────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Email template ────────────────────────────────────────────
function buildScholarshipEmail(params: {
  studentName?: string;
  action: "added";
  scholarship: {
    title: string;
    amount: number;
    deadline: string;
    eligibility: string;
    category: string[];
    applyLink?: string;
    description?: string;
  };
}): string {
  const { studentName, scholarship } = params;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:32px auto;padding:0 16px 32px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:16px 16px 0 0;padding:24px 28px;text-align:center;">
      <span style="font-size:28px;">🎓</span>
      <h1 style="margin:8px 0 0;color:white;font-size:22px;font-weight:800;">ScholarHub</h1>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">New Scholarship Available!</p>
    </div>

    <!-- Body -->
    <div style="background:white;padding:28px;border-radius:0 0 16px 16px;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

      ${studentName ? `<p style="margin:0 0 16px;font-size:14px;color:#64748b;">Hello <strong style="color:#1a1a2e;">${studentName}</strong> 👋</p>` : ""}

      <!-- Green new badge -->
      <div style="background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:12px;padding:14px 18px;margin-bottom:18px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <span style="font-size:18px;">✅</span>
          <span style="font-size:11px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:0.5px;">New Scholarship Added</span>
        </div>
        <p style="margin:0 0 5px;font-size:18px;font-weight:800;color:#1a1a2e;">${scholarship.title}</p>
        <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">${scholarship.description || "A new scholarship opportunity is now available for you."}</p>
      </div>

      <!-- Details table -->
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:18px;">
        ${[
          ["💰 Amount", `₹${scholarship.amount.toLocaleString("en-IN")}`],
          ["📅 Last Date", new Date(scholarship.deadline).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })],
          ["✅ Eligibility", scholarship.eligibility],
          ["🏷️ Category", scholarship.category.join(", ")],
        ].map(([label, value], i) => `
        <div style="display:flex;padding:10px 16px;${i % 2 === 0 ? "background:#f1f5f9;" : "background:white;"}">
          <span style="font-size:13px;color:#64748b;font-weight:600;width:130px;flex-shrink:0;">${label}</span>
          <span style="font-size:13px;color:#1a1a2e;font-weight:700;">${value}</span>
        </div>`).join("")}
      </div>

      ${scholarship.applyLink ? `
      <div style="text-align:center;margin-bottom:18px;">
        <a href="${scholarship.applyLink}"
          style="display:inline-block;background:linear-gradient(135deg,#667eea,#764ba2);color:white;font-weight:700;font-size:14px;padding:13px 32px;border-radius:12px;text-decoration:none;">
          Apply Now →
        </a>
      </div>` : ""}

      <p style="margin:18px 0 0;font-size:12px;color:#94a3b8;text-align:center;line-height:1.6;">
        This email was sent by ScholarHub Admin.<br>
        Visit <a href="${process.env.NEXT_PUBLIC_APP_URL || "#"}" style="color:#667eea;text-decoration:none;">ScholarHub Portal</a> for more scholarships.
      </p>
    </div>

    <p style="text-align:center;margin:16px 0 0;font-size:11px;color:#94a3b8;">
      © ${new Date().getFullYear()} ScholarHub · All rights reserved
    </p>
  </div>
</body>
</html>`;
}

// ── Send emails in batches ────────────────────────────────────
async function sendBatchEmails(
  users: { email: string; name?: string }[],
  subject: string,
  htmlFn: (name?: string) => string
) {
  const BATCH = 10;
  let success = 0, failed = 0;

  for (let i = 0; i < users.length; i += BATCH) {
    const batch = users.slice(i, i + BATCH);
    await Promise.allSettled(
      batch.map(async (u) => {
        try {
          await transporter.sendMail({
            from: `"ScholarHub" <${process.env.EMAIL_USER}>`,
            to: u.email,
            subject,
            html: htmlFn(u.name),
          });
          success++;
        } catch (err) {
          console.error(`Email failed for ${u.email}:`, err);
          failed++;
        }
      })
    );
    if (i + BATCH < users.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  return { success, failed };
}

// ── Auto-inactive expired ─────────────────────────────────────
async function autoDeactivateExpired() {
  const now = new Date();
  await Scholarship.updateMany(
    { deadline: { $lt: now }, isActive: true },
    { $set: { isActive: false } }
  );
}

// ── GET ───────────────────────────────────────────────────────
export async function GET() {
  try {
    await connectDB();
    await autoDeactivateExpired();
    const scholarships = await Scholarship.find({})
      .select("title titleHi titleGu description amount eligibility category deadline applyLink youtubeLink isActive level course state gender income documents applicants createdAt")
      .sort({ createdAt: -1 });
    return NextResponse.json({ scholarships });
  } catch {
    return NextResponse.json({ scholarships: [], error: "DB error" }, { status: 500 });
  }
}

// ── POST — Add new scholarship → email all students ───────────
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const body = await req.json();

    // 1. Create scholarship
    const scholarship = await Scholarship.create(body);

    // 2. Background: send email to all students (don't wait for response)
    User.find({}, { email: 1, name: 1, _id: 0 })
      .then(async (users) => {
        if (!users.length) return;
        const subject = `🎓 New Scholarship: ${scholarship.title} — ScholarHub`;
        await sendBatchEmails(users, subject, (name) =>
          buildScholarshipEmail({
            studentName: name,
            action: "added",
            scholarship: {
              title:       scholarship.title,
              amount:      scholarship.amount,
              deadline:    scholarship.deadline,
              eligibility: scholarship.eligibility,
              category:    scholarship.category,
              applyLink:   scholarship.applyLink,
              description: scholarship.description,
            },
          })
        );
        console.log(`[ScholarHub] New scholarship emails sent to ${users.length} students`);
      })
      .catch((err) => console.error("[ScholarHub] Email send error:", err));

    return NextResponse.json(
      { scholarship, message: "Scholarship added successfully! Emails are being sent to all students." },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "DB error" }, { status: 500 });
  }
}
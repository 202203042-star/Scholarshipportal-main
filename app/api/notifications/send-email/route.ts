// /api/notifications/send-email/route.ts

import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Scholarship from "@/models/Scholarship";
import Notification from "@/models/Notification";
import { auth } from "@/lib/auth";

// ── Gmail transporter (same as OTP) ──────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Beautiful HTML email template ────────────────────────────
function buildEmailHTML(params: {
  notifTitle: string;
  notifMessage: string;
  notifType: "info" | "warning" | "success";
  scholarship?: {
    title: string;
    titleHi?: string;
    titleGu?: string;
    amount: number;
    deadline: string;
    eligibility?: string;
    applyLink?: string;
    category?: string[];
  } | null;
  recipientName?: string;
}): string {
  const { notifTitle, notifMessage, notifType, scholarship, recipientName } = params;

  const typeConfig = {
    info:    { color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", emoji: "ℹ️",  label: "Information" },
    warning: { color: "#d97706", bg: "#fffbeb", border: "#fde68a", emoji: "⚠️",  label: "Important Notice" },
    success: { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", emoji: "✅",  label: "Good News" },
  };

  const cfg = typeConfig[notifType] || typeConfig.info;

  const scholarshipSection = scholarship ? `
    <div style="margin-top:20px;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:14px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:12px 20px;">
        <span style="color:white;font-size:14px;font-weight:700;">🎓 Scholarship Details</span>
      </div>
      <div style="padding:20px;">
        <p style="margin:0 0 4px;font-size:18px;font-weight:800;color:#1a1a2e;">${scholarship.title}</p>
        ${scholarship.titleHi ? `<p style="margin:0 0 2px;font-size:13px;color:#667eea;">${scholarship.titleHi}</p>` : ""}
        ${scholarship.titleGu ? `<p style="margin:0 0 12px;font-size:13px;color:#059669;">${scholarship.titleGu}</p>` : ""}

        <table style="width:100%;border-collapse:collapse;margin-top:8px;">
          <tr>
            <td style="padding:8px 12px;background:#f1f5f9;border-radius:8px;font-size:13px;color:#64748b;font-weight:600;width:40%;">💰 Amount</td>
            <td style="padding:8px 12px;font-size:14px;font-weight:700;color:#16a34a;">₹${scholarship.amount.toLocaleString("en-IN")}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;font-size:13px;color:#64748b;font-weight:600;">📅 Deadline</td>
            <td style="padding:8px 12px;font-size:14px;font-weight:700;color:#dc2626;">${new Date(scholarship.deadline).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</td>
          </tr>
          ${scholarship.eligibility ? `
          <tr>
            <td style="padding:8px 12px;background:#f1f5f9;border-radius:8px;font-size:13px;color:#64748b;font-weight:600;">✅ Eligibility</td>
            <td style="padding:8px 12px;font-size:13px;color:#374151;">${scholarship.eligibility}</td>
          </tr>` : ""}
          ${scholarship.category?.length ? `
          <tr>
            <td style="padding:8px 12px;font-size:13px;color:#64748b;font-weight:600;">🏷️ Category</td>
            <td style="padding:8px 12px;font-size:13px;color:#374151;">${scholarship.category.join(", ")}</td>
          </tr>` : ""}
        </table>

        ${scholarship.applyLink ? `
        <div style="margin-top:16px;text-align:center;">
          <a href="${scholarship.applyLink}"
            style="display:inline-block;background:linear-gradient(135deg,#667eea,#764ba2);color:white;font-weight:700;font-size:14px;padding:12px 32px;border-radius:10px;text-decoration:none;">
            Apply Now →
          </a>
        </div>` : ""}
      </div>
    </div>
  ` : "";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:32px auto;padding:0 16px 32px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:16px 16px 0 0;padding:24px 28px;text-align:center;">
      <div style="display:inline-block;margin-bottom:8px;">
        <span style="font-size:28px;">🎓</span>
      </div>
      <h1 style="margin:0;color:white;font-size:22px;font-weight:800;letter-spacing:-0.3px;">ScholarHub</h1>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">Scholarship Portal Notification</p>
    </div>

    <!-- Body -->
    <div style="background:white;padding:28px;border-radius:0 0 16px 16px;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

      ${recipientName ? `<p style="margin:0 0 16px;font-size:14px;color:#64748b;">Hello <strong style="color:#1a1a2e;">${recipientName}</strong> 👋</p>` : ""}

      <!-- Notification Card -->
      <div style="background:${cfg.bg};border:1.5px solid ${cfg.border};border-radius:12px;padding:18px 20px;margin-bottom:8px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <span style="font-size:18px;">${cfg.emoji}</span>
          <span style="font-size:11px;font-weight:700;color:${cfg.color};text-transform:uppercase;letter-spacing:0.5px;">${cfg.label}</span>
        </div>
        <p style="margin:0 0 6px;font-size:18px;font-weight:800;color:#1a1a2e;">${notifTitle}</p>
        <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">${notifMessage}</p>
      </div>

      ${scholarshipSection}

      <!-- Footer note -->
      <p style="margin:20px 0 0;font-size:12px;color:#94a3b8;text-align:center;line-height:1.6;">
        This email was sent by ScholarHub Admin.<br>
        Any questions? <a href="mailto:${process.env.EMAIL_USER}" style="color:#667eea;text-decoration:none;">contact us</a>.
      </p>
    </div>

    <!-- Bottom brand -->
    <p style="text-align:center;margin:16px 0 0;font-size:11px;color:#94a3b8;">
      © ${new Date().getFullYear()} ScholarHub · All rights reserved
    </p>
  </div>
</body>
</html>`;
}

// ── POST /api/notifications/send-email ───────────────────────
export async function POST(req: NextRequest) {
  try {
    // Admin auth check
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { notificationId, scholarshipId, targetCategory, personalEmail } = await req.json();

    if (!notificationId) {
      return NextResponse.json({ error: "notificationId required" }, { status: 400 });
    }

    // ── 1. Notification fetch ──
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    // ── 2. Scholarship fetch (optional) ──
    let scholarship: any = null;
    if (scholarshipId) {
      scholarship = await Scholarship.findById(scholarshipId);
    }

    // ── 3. Target users decide karo ──
    let targetUsers: { email: string; name?: string }[] = [];

    if (personalEmail) {
      // Case A: Personal — only a specific email
      targetUsers = [{ email: personalEmail, name: personalEmail.split("@")[0] }];

    } else if (targetCategory && targetCategory !== "all") {
      // Case B: Category-wise — only students of that category
      targetUsers = await User.find(
        {
          $or: [
            { casteCategory: { $regex: new RegExp("^" + targetCategory + "$", "i") } },
            { category: { $regex: new RegExp("^" + targetCategory + "$", "i") } },
          ],
        },
        { email: 1, name: 1, _id: 0 }
      );
      // If none found, send to all
      if (targetUsers.length === 0) {
        targetUsers = await User.find({}, { email: 1, name: 1, _id: 0 });
      }

    } else if (scholarship) {
      // Case C: Specific scholarship → applicants + category-match users
      const applicantEmails: string[] = scholarship.applicants || [];
      const applicantUsers = await User.find(
        { email: { $in: applicantEmails } },
        { email: 1, name: 1, _id: 0 }
      );
      const scholarshipCategories: string[] = scholarship.category || [];
      let categoryUsers: any[] = [];
      if (scholarshipCategories.length > 0 && !scholarshipCategories.includes("Any")) {
        categoryUsers = await User.find(
          {
            email: { $nin: applicantEmails },
            $or: [
              { casteCategory: { $in: scholarshipCategories.map((c: string) => c.toLowerCase()) } },
              { category: { $in: scholarshipCategories } },
            ],
          },
          { email: 1, name: 1, _id: 0 }
        );
      }
      const allEmails = new Set<string>();
      targetUsers = [];
      for (const u of [...applicantUsers, ...categoryUsers]) {
        if (!allEmails.has(u.email)) { allEmails.add(u.email); targetUsers.push({ email: u.email, name: u.name }); }
      }
      if (targetUsers.length === 0) {
        targetUsers = await User.find({}, { email: 1, name: 1, _id: 0 });
      }

    } else {
      // Case D: No filter — all registered users
      targetUsers = await User.find({}, { email: 1, name: 1, _id: 0 });
    }

    if (targetUsers.length === 0) {
      return NextResponse.json({ error: "No users found to send email" }, { status: 404 });
    }

    // ── 4. Send emails (batch of 10 to avoid Gmail rate limits) ──
    const BATCH_SIZE = 10;
    let successCount = 0;
    let failCount    = 0;

    for (let i = 0; i < targetUsers.length; i += BATCH_SIZE) {
      const batch = targetUsers.slice(i, i + BATCH_SIZE);

      await Promise.allSettled(
        batch.map(async (user) => {
          try {
            const html = buildEmailHTML({
              notifTitle:   notification.title,
              notifMessage: notification.message,
              notifType:    notification.type,
              scholarship:  scholarship
                ? {
                    title:       scholarship.title,
                    titleHi:     scholarship.titleHi,
                    titleGu:     scholarship.titleGu,
                    amount:      scholarship.amount,
                    deadline:    scholarship.deadline,
                    eligibility: scholarship.eligibility,
                    applyLink:   scholarship.applyLink,
                    category:    scholarship.category,
                  }
                : null,
              recipientName: user.name,
            });

            await transporter.sendMail({
              from:    `"ScholarHub" <${process.env.EMAIL_USER}>`,
              to:      user.email,
              subject: `${notification.title} — ScholarHub`,
              html,
            });

            successCount++;
          } catch (err) {
            console.error(`Email failed for ${user.email}:`, err);
            failCount++;
          }
        })
      );

      // Small delay between batches (to avoid Gmail rate limits)
      if (i + BATCH_SIZE < targetUsers.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // ── 5. Response ──
    const total = targetUsers.length;

    if (successCount === 0) {
      return NextResponse.json(
        { error: `No emails were sent. ${failCount} failed.` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: failCount === 0
        ? `✅ ${successCount} student${successCount > 1 ? "s" : ""} successfully emailed!`
        : `⚠️ ${successCount}/${total} emails sent (${failCount} failed)`,
      successCount,
      failCount,
      total,
    });

  } catch (error: any) {
    console.error("Send email error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
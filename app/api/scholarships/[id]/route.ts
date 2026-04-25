// app/api/scholarships/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import connectDB from "@/lib/mongodb";
import Scholarship from "@/models/Scholarship";
import User from "@/models/User";
import { auth } from "@/lib/auth";

// ── Gmail transporter ─────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Email Templates ───────────────────────────────────────────
function buildEditEmail(params: {
  studentName?: string;
  scholarship: {
    title: string;
    amount: number;
    deadline: string;
    eligibility: string;
    category: string[];
    applyLink?: string;
    description?: string;
  };
  changes: string[];
}): string {
  const { studentName, scholarship, changes } = params;

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
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">Scholarship Update</p>
    </div>

    <!-- Body -->
    <div style="background:white;padding:28px;border-radius:0 0 16px 16px;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

      ${studentName ? `<p style="margin:0 0 16px;font-size:14px;color:#64748b;">Hello <strong style="color:#1a1a2e;">${studentName}</strong> 👋</p>` : ""}

      <!-- Update badge -->
      <div style="background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:12px;padding:14px 18px;margin-bottom:18px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <span style="font-size:18px;">✏️</span>
          <span style="font-size:11px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:0.5px;">Scholarship Updated</span>
        </div>
        <p style="margin:0 0 4px;font-size:18px;font-weight:800;color:#1a1a2e;">${scholarship.title}</p>
        <p style="margin:0;font-size:13px;color:#64748b;">The admin has updated this scholarship. Please check the latest details below.</p>
      </div>

      <!-- What changed -->
      ${changes.length > 0 ? `
      <div style="background:#fefce8;border:1px solid #fde68a;border-radius:12px;padding:14px 18px;margin-bottom:18px;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#d97706;text-transform:uppercase;letter-spacing:0.5px;">What was updated:</p>
        ${changes.map(c => `<p style="margin:0 0 4px;font-size:13px;color:#92400e;">• ${c}</p>`).join("")}
      </div>` : ""}

      <!-- Updated details -->
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

function buildDeleteEmail(params: {
  studentName?: string;
  scholarshipTitle: string;
}): string {
  const { studentName, scholarshipTitle } = params;

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
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">Scholarship Notice</p>
    </div>

    <!-- Body -->
    <div style="background:white;padding:28px;border-radius:0 0 16px 16px;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

      ${studentName ? `<p style="margin:0 0 16px;font-size:14px;color:#64748b;">Hello <strong style="color:#1a1a2e;">${studentName}</strong> 👋</p>` : ""}

      <!-- Delete badge -->
      <div style="background:#fef2f2;border:1.5px solid #fecaca;border-radius:12px;padding:14px 18px;margin-bottom:18px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <span style="font-size:18px;">🗑️</span>
          <span style="font-size:11px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:0.5px;">Scholarship Removed</span>
        </div>
        <p style="margin:0 0 4px;font-size:18px;font-weight:800;color:#1a1a2e;">${scholarshipTitle}</p>
        <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">
          This scholarship has been removed by the admin and is no longer available. 
          Please visit ScholarHub to explore other available scholarships.
        </p>
      </div>

      <div style="text-align:center;margin-bottom:18px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "#"}"
          style="display:inline-block;background:linear-gradient(135deg,#667eea,#764ba2);color:white;font-weight:700;font-size:14px;padding:13px 32px;border-radius:12px;text-decoration:none;">
          View Other Scholarships →
        </a>
      </div>

      <p style="margin:18px 0 0;font-size:12px;color:#94a3b8;text-align:center;line-height:1.6;">
        This email was sent by ScholarHub Admin.<br>
        We apologize for any inconvenience caused.
      </p>
    </div>

    <p style="text-align:center;margin:16px 0 0;font-size:11px;color:#94a3b8;">
      © ${new Date().getFullYear()} ScholarHub · All rights reserved
    </p>
  </div>
</body>
</html>`;
}

// ── Batch email sender ────────────────────────────────────────
async function sendBatchEmails(
  users: { email: string; name?: string }[],
  subject: string,
  htmlFn: (name?: string) => string
) {
  const BATCH = 10;
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
        } catch (err) {
          console.error(`Email failed for ${u.email}:`, err);
        }
      })
    );
    if (i + BATCH < users.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }
}

// ── Detect what changed ───────────────────────────────────────
function detectChanges(oldData: any, newData: any): string[] {
  const changes: string[] = [];
  if (newData.amount !== undefined && oldData.amount !== newData.amount)
    changes.push(`Amount changed to ₹${Number(newData.amount).toLocaleString("en-IN")}`);
  if (newData.deadline !== undefined && String(oldData.deadline) !== String(newData.deadline))
    changes.push(`Deadline updated to ${new Date(newData.deadline).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}`);
  if (newData.eligibility !== undefined && oldData.eligibility !== newData.eligibility)
    changes.push("Eligibility criteria updated");
  if (newData.isActive !== undefined && oldData.isActive !== newData.isActive)
    changes.push(newData.isActive ? "Scholarship is now Active" : "Scholarship is now Inactive");
  if (newData.applyLink !== undefined && oldData.applyLink !== newData.applyLink)
    changes.push("Application link updated");
  return changes;
}

// ── GET ───────────────────────────────────────────────────────
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

// ── PUT — Edit scholarship → email applicants ─────────────────
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

    // 1. Fetch old data (to detect changes)
    const oldScholarship = await Scholarship.findById(id);
    if (!oldScholarship) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // 2. Update
    const updated = await Scholarship.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: false }
    );
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // 3. Background: send email to applicants
    const applicantEmails: string[] = oldScholarship.applicants || [];
    if (applicantEmails.length > 0) {
      const changes = detectChanges(oldScholarship, body);

      // Only send email for meaningful changes (ignore minor changes like isActive toggle)
      const shouldEmail = changes.length > 0 || Object.keys(body).some(k =>
        ["title","description","eligibility","amount","deadline","applyLink","documents"].includes(k)
      );

      if (shouldEmail) {
        User.find({ email: { $in: applicantEmails } }, { email: 1, name: 1, _id: 0 })
          .then(async (users) => {
            if (!users.length) return;
            const subject = `✏️ Scholarship Updated: ${updated.title} — ScholarHub`;
            await sendBatchEmails(users, subject, (name) =>
              buildEditEmail({
                studentName: name,
                scholarship: {
                  title:       updated.title,
                  amount:      updated.amount,
                  deadline:    updated.deadline,
                  eligibility: updated.eligibility,
                  category:    updated.category,
                  applyLink:   updated.applyLink,
                  description: updated.description,
                },
                changes,
              })
            );
            console.log(`[ScholarHub] Edit emails sent to ${users.length} applicants`);
          })
          .catch((err) => console.error("[ScholarHub] Edit email error:", err));
      }
    }

    return NextResponse.json({ scholarship: updated, message: "Updated!" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "DB error" }, { status: 500 });
  }
}

// ── DELETE — Remove scholarship → email applicants ────────────
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

    // 1. First fetch scholarship (need data before delete)
    const scholarship = await Scholarship.findById(id);
    if (!scholarship) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const applicantEmails: string[] = scholarship.applicants || [];
    const scholarshipTitle = scholarship.title;

    // 2. Delete
    await Scholarship.findByIdAndDelete(id);

    // 3. Background: send email to applicants
    if (applicantEmails.length > 0) {
      User.find({ email: { $in: applicantEmails } }, { email: 1, name: 1, _id: 0 })
        .then(async (users) => {
          if (!users.length) return;
          const subject = `🗑️ Scholarship Removed: ${scholarshipTitle} — ScholarHub`;
          await sendBatchEmails(users, subject, (name) =>
            buildDeleteEmail({ studentName: name, scholarshipTitle })
          );
          console.log(`[ScholarHub] Delete emails sent to ${users.length} applicants`);
        })
        .catch((err) => console.error("[ScholarHub] Delete email error:", err));
    }

    return NextResponse.json({ message: "Deleted!" });
  } catch {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
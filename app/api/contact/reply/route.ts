import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getToken } from "next-auth/jwt";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

export async function POST(req: NextRequest) {
  try {
    // Auth check — both cookie names for local + production
    let token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, cookieName: "__Secure-authjs.session-token" });
    if (!token) token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, cookieName: "authjs.session-token" });
    if (!token || (token as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { to, name, originalMessage, reply } = await req.json();
    if (!to || !reply) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    await transporter.sendMail({
      from: `"ScholarHub Admin" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Re: Your query on ScholarHub",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:28px;background:#f8fafc;border-radius:16px;">
          <div style="background:linear-gradient(135deg,#1d4ed8,#4f46e5);border-radius:12px;padding:20px 24px;text-align:center;margin-bottom:20px;">
            <span style="color:white;font-size:22px;">🎓</span>
            <span style="color:white;font-weight:800;font-size:18px;margin-left:8px;">ScholarHub</span>
          </div>

          <div style="background:white;border-radius:14px;padding:24px;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
            <p style="color:#64748b;font-size:14px;margin:0 0 16px;">Hello <strong style="color:#1a1a2e;">${name || "there"}</strong>,</p>

            <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 20px;">${reply.replace(/\n/g, "<br/>")}</p>

            ${originalMessage ? `
            <div style="background:#f8fafc;border-left:3px solid #e2e8f0;padding:12px 16px;border-radius:0 8px 8px 0;margin-top:20px;">
              <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">Your original message</p>
              <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">${originalMessage}</p>
            </div>` : ""}

            <div style="margin-top:24px;padding-top:16px;border-top:1px solid #f0f0f0;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">ScholarHub — Scholarship Portal · Gujarat & Central</p>
            </div>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ message: "Reply sent!" });
  } catch (err: any) {
    console.error("Reply error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

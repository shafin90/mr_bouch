import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseMeetingRequest, withMeetingStatus } from "@/lib/meeting-request";
import * as nodemailer from "nodemailer";

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[char]!));

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Request not found." }, { status: 400 });

    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    if (!smtpHost || !smtpUser || !smtpPass) {
      return NextResponse.json({ error: "Email configuration is missing. Set SMTP_HOST, SMTP_USER and SMTP_PASS before approving." }, { status: 503 });
    }

    const { data: meeting, error: lookupError } = await supabase
      .from("meeting_requests").select("*").eq("id", id).single();
    if (lookupError || !meeting) return NextResponse.json({ error: "Request not found." }, { status: 404 });

    const details = parseMeetingRequest(meeting.message);
    if (!details.date || !details.time) {
      return NextResponse.json({ error: "The request does not contain a valid date and time." }, { status: 400 });
    }
    if (details.status === "rejected") return NextResponse.json({ error: "This request has already been declined." }, { status: 409 });

    const { data: others, error: othersError } = await supabase
      .from("meeting_requests").select("id,message").neq("id", id).limit(500);
    if (othersError) return NextResponse.json({ error: "Could not check time slot availability." }, { status: 500 });
    const conflict = (others ?? []).some((other) => {
      const otherDetails = parseMeetingRequest(other.message);
      return otherDetails.status === "accepted" && otherDetails.date === details.date && otherDetails.time === details.time;
    });
    if (conflict) return NextResponse.json({ error: "This time slot has already been confirmed for another request." }, { status: 409 });

    const name = String(meeting.name ?? "Participant");
    const email = String(meeting.email ?? "");
    if (!email) return NextResponse.json({ error: "This request has no email address." }, { status: 400 });
    const acceptedMessage = withMeetingStatus(meeting.message, "accepted");
    const { error: updateError } = await supabase.from("meeting_requests")
      .update({ message: acceptedMessage }).eq("id", id);
    if (updateError) return NextResponse.json({ error: "Could not confirm the request." }, { status: 500 });

    const dateLabel = new Intl.DateTimeFormat("en-GB", {
      weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Abidjan",
    }).format(new Date(`${details.date}T12:00:00Z`));
    const formatLabel = "One-to-one video conference";
    const organization = meeting.organization ? `<p><b>Organization:</b> ${escapeHtml(String(meeting.organization))}</p>` : "";

    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: { user: smtpUser, pass: smtpPass },
      });
      await transporter.sendMail({
        from: process.env.SMTP_FROM || smtpUser,
        to: email,
        subject: "Your meeting is confirmed — Touré Ahmed Bouah",
        html: `<!doctype html><html lang="en"><meta charset="utf-8"><body style="font-family:Arial,sans-serif;color:#0f1c28;background:#f8f6f0;padding:32px"><main style="max-width:560px;margin:auto;background:#fff;padding:32px;border-top:4px solid #b38938"><p>Hello ${escapeHtml(name)},</p><h1 style="font-size:22px">Your request is confirmed</h1><p>Your time slot has been booked with the office of Touré Ahmed Bouah.</p><p><b>Date:</b> ${dateLabel}<br><b>Time:</b> ${escapeHtml(details.time)} (Abidjan time)<br><b>Format:</b> ${formatLabel}</p>${organization}<p>For online meetings, connection details will be sent to you by the office.</p><p style="color:#68737d;font-size:12px">SOPHIA S.A. · Abidjan, Côte d’Ivoire</p></main></body></html>`,
      });
    } catch (mailError) {
      await supabase.from("meeting_requests").update({ message: withMeetingStatus(meeting.message, "pending") }).eq("id", id);
      console.error("Meeting confirmation email failed:", mailError);
      const rawMessage = mailError instanceof Error ? mailError.message : String(mailError);
      const diagnostic = rawMessage.replaceAll(smtpPass, "[redacted]").slice(0, 400);
      return NextResponse.json({
        error: "The confirmation email could not be sent. The time slot was not booked.",
        diagnostic,
      }, { status: 502 });
    }

    return NextResponse.json({ success: true, sent: true, status: "accepted" });
  } catch (error) {
    console.error("Meeting approval error:", error);
    return NextResponse.json({ error: "Server error while approving the request." }, { status: 500 });
  }
}

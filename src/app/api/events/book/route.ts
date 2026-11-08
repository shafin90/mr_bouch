import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import * as nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const eventId = String(body.eventId || "");
    const fullName = String(body.fullName || "").trim();
    const email = String(body.email || "").trim();
    const phone = String(body.phone || "").trim();
    const location = String(body.location || "").trim();
    const seats = Number(body.seats || 1);

    if (!eventId || !email || !fullName || !location || !Number.isInteger(seats)) {
      return NextResponse.json({ error: "Nom, email, lieu et nombre de places sont obligatoires." }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: ev, error: eventError } = await supabase.from("events").select("*").eq("id", eventId).single();
    if (eventError || !ev) return NextResponse.json({ error: "Événement introuvable." }, { status: 404 });
    const eventTitle = String(ev.title || "Événement officiel");
    const eventDate = ev.date ? `${ev.date}${ev.time ? ` à ${ev.time}` : ""}` : "";
    const eventLocation = String(ev.location || "");

    const { data: reservation, error: reservationError } = await supabase.rpc("register_for_event", {
      p_event_id: eventId,
      p_full_name: fullName,
      p_email: email,
      p_phone: phone,
      p_location: location,
      p_seats: seats,
    });
    if (reservationError) throw reservationError;
    if (!reservation?.success) {
      return NextResponse.json({ error: reservation?.error || "Impossible de réserver ces places." }, { status: 409 });
    }

    const confirmationCode = reservation.confirmation_code;
    const assignedSeats: number[] = reservation.seat_numbers || [];
    const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[char]!));

    // 3. Send confirmation email via Nodemailer
    let sent = false;
    let previewUrl = "";

    try {
      const smtpHost = process.env.SMTP_HOST;
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;

      let transporter: ReturnType<typeof nodemailer.createTransport>;

      if (smtpHost && smtpUser && smtpPass) {
        transporter = nodemailer.createTransport({
          host: smtpHost,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_SECURE === "true",
          auth: { user: smtpUser, pass: smtpPass },
        });
      } else {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      }

      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8f6f0; margin: 0; padding: 24px; color: #0f1c28; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2ddd3; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
    .header { background: #081928; color: #ffffff; padding: 32px 28px; text-align: center; }
    .gold-label { color: #b38938; font-size: 11px; font-weight: 700; letter-spacing: 0.28em; text-transform: uppercase; margin-bottom: 8px; }
    .title { font-family: Georgia, serif; font-size: 24px; font-weight: 400; margin: 0; }
    .content { padding: 32px 28px; font-size: 15px; line-height: 1.6; color: #334155; }
    .code-box { background: #fdfaf3; border: 1px dashed #b38938; padding: 16px 20px; border-radius: 6px; text-align: center; margin: 24px 0; }
    .code-val { font-family: monospace; font-size: 20px; font-weight: 700; color: #081928; letter-spacing: 2px; }
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px 20px; margin: 20px 0; }
    .meta-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #edf2f7; font-size: 14px; }
    .meta-row:last-child { border-bottom: none; }
    .meta-label { color: #64748b; }
    .meta-value { font-weight: 600; color: #081928; text-align: right; }
    .footer { background: #f8f6f0; padding: 20px 28px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2ddd3; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="gold-label">Confirmation Officielle</div>
      <h1 class="title">Réservation Enregistrée</h1>
    </div>
    <div class="content">
      <p>Bonjour <strong>${escapeHtml(fullName)}</strong>,</p>
      <p>Votre place pour l'événement ci-dessous a été réservée avec succès auprès du cabinet de M. Touré Ahmed Bouah :</p>
      
      <div class="code-box">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; margin-bottom: 4px;">Numéro de réservation</div>
        <div class="code-val">${confirmationCode}</div>
      </div>

      <div class="meta-box">
        <div class="meta-row">
          <span class="meta-label">Événement :</span>
          <span class="meta-value">${escapeHtml(eventTitle)}</span>
        </div>
        ${eventDate ? `
        <div class="meta-row">
          <span class="meta-label">Date :</span>
          <span class="meta-value">${escapeHtml(eventDate)}</span>
        </div>` : ""}
        ${eventLocation ? `
        <div class="meta-row">
          <span class="meta-label">Lieu :</span>
          <span class="meta-value">${escapeHtml(eventLocation)}</span>
        </div>` : ""}
        <div class="meta-row">
          <span class="meta-label">Nombre de place(s) :</span>
          <span class="meta-value">${seats}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Places attribuées :</span>
          <span class="meta-value">${assignedSeats.join(", ")}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Ville / pays :</span>
          <span class="meta-value">${escapeHtml(location)}</span>
        </div>
      </div>

      <p>Veuillez présenter ce numéro lors de votre arrivée. Pour toute question ou modification, vous pouvez contacter notre secrétariat.</p>
    </div>
    <div class="footer">
      Cabinet de Touré Ahmed Bouah — SOPHIA S.A.<br>
      Abidjan, Côte d'Ivoire • Courriel officiel automatique
    </div>
  </div>
</body>
</html>
      `;

      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || '"Cabinet de Touré Ahmed Bouah" <evenements@sophiasa.net>',
        to: email,
        subject: `Confirmation de réservation : ${eventTitle} (${confirmationCode})`,
        html: emailHtml,
      });

      sent = true;
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) previewUrl = preview;
    } catch (mailErr) {
      console.warn("Mail sending warning:", mailErr);
    }

    return NextResponse.json({
      success: true,
      confirmationCode,
      seatNumbers: assignedSeats,
      emailSent: sent,
      previewUrl,
    });
  } catch (err: any) {
    console.error("Booking error:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}

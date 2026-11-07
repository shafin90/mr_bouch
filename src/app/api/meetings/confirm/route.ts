import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import * as nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, email, organization, preferred_date, preferred_time, meeting_type, status } = body;

    if (!email) {
      return NextResponse.json({ error: "Adresse email requise" }, { status: 400 });
    }

    // 1. Update status in database
    const supabase = await createClient();
    try {
      if (id) {
        // Try updating status column or message
        const { error } = await supabase
          .from("meeting_requests")
          .update({
            message: `[Statut: ${status || "accepted"}] Confirmé par le cabinet le ${new Date().toLocaleDateString("fr-FR")}`,
          })
          .eq("id", id);
      }
    } catch (dbErr) {
      console.warn("DB update warning (non-fatal):", dbErr);
    }

    // 2. Prepare HTML Email Content
    const formatLabel = meeting_type === "in_person"
      ? "En personne (Siège de SOPHIA S.A. — Cocody 2 Plateaux, Abidjan)"
      : "Visioconférence sécurisée (Le lien vous sera communiqué 24h avant l'échange)";

    const formattedDate = preferred_date
      ? new Date(preferred_date).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
      : "Date convenue avec le secrétariat";

    const emailHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Confirmation de rendez-vous — Touré Ahmed Bouah</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8f6f0; margin: 0; padding: 40px 20px; color: #0f1c28;">
  <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border: 1px solid #d6d0c4; border-top: 4px solid #b38938;">
    <!-- Header -->
    <tr>
      <td style="padding: 32px 36px; background-color: #081928; text-align: left;">
        <span style="color: #b38938; font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;">Cabinet de la Présidence</span>
        <h1 style="color: #ffffff; font-family: Georgia, serif; font-size: 24px; font-weight: normal; margin: 8px 0 0; letter-spacing: -0.02em;">Touré Ahmed Bouah</h1>
        <p style="color: rgba(255,255,255,0.6); font-size: 11px; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 0.12em;">SOPHIA S.A. · République de Côte d'Ivoire</p>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding: 36px 36px 28px;">
        <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
          Cher(e) <strong>${name || "Monsieur / Madame"}</strong>,
        </p>
        <p style="font-size: 14px; line-height: 1.7; color: #4e5b66; margin: 0 0 24px;">
          Nous avons le plaisir de vous informer que votre demande de rendez-vous avec Monsieur <strong>Touré Ahmed Bouah</strong> a été examinée et <strong>officiellement confirmée</strong> par le secrétariat de la Présidence.
        </p>

        <!-- Meeting Summary Box -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f6f0; border: 1px solid #e6e2d8; margin: 0 0 28px;">
          <tr>
            <td style="padding: 20px;">
              <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em; color: #8a6c35; font-weight: 700; margin: 0 0 14px;">
                Détails du Rendez-vous
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px; color: #0f1c28;">
                <tr>
                  <td style="padding: 6px 0; width: 120px; color: #7a8793;">Date :</td>
                  <td style="padding: 6px 0; font-weight: 600;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #7a8793;">Créneau horaire :</td>
                  <td style="padding: 6px 0; font-weight: 600;">${preferred_time || "10:30"} (Heure d'Abidjan — GMT)</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #7a8793;">Format :</td>
                  <td style="padding: 6px 0; font-weight: 600;">${formatLabel}</td>
                </tr>
                ${organization ? `
                <tr>
                  <td style="padding: 6px 0; color: #7a8793;">Organisation :</td>
                  <td style="padding: 6px 0; font-weight: 600;">${organization}</td>
                </tr>
                ` : ""}
              </table>
            </td>
          </tr>
        </table>

        <p style="font-size: 13px; line-height: 1.7; color: #4e5b66; margin: 0 0 20px;">
          En cas d'empêchement ou pour toute modification préalable, nous vous prions de bien vouloir contacter notre cabinet au moins 24 heures à l'avance.
        </p>

        <div style="border-top: 1px solid #e6e2d8; padding-top: 24px; margin-top: 28px;">
          <p style="font-size: 13px; font-weight: 600; color: #0f1c28; margin: 0;">
            Le Secrétariat Général de SOPHIA S.A.
          </p>
          <p style="font-size: 12px; color: #7a8793; margin: 4px 0 0;">
            Cocody 2 Plateaux, Abidjan · (+225) 27 22 41 15 68 · presidence@sophiasa.net
          </p>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #f4f0e6; padding: 18px 36px; text-align: center; font-size: 11px; color: #7a8793; border-top: 1px solid #e6e2d8;">
        Ce message est confidentiel et destiné exclusivement à ${email}.
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // 3. Send email using Nodemailer
    let sent = false;
    let messageId = "";
    let previewUrl = "";

    try {
      // Check if custom SMTP exists in env
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
        // Fallback to test ethereal account for dev/staging verification
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

      const info = await transporter.sendMail({
        from: '"Cabinet de Touré Ahmed Bouah" <presidence@sophiasa.net>',
        to: email,
        subject: "Confirmation officielle de votre rendez-vous — Touré Ahmed Bouah",
        html: emailHtml,
      });

      sent = true;
      messageId = info.messageId;
      previewUrl = nodemailer.getTestMessageUrl(info) || "";
    } catch (mailErr: any) {
      console.warn("Mail transport warning (fallback logged):", mailErr.message);
    }

    return NextResponse.json({
      success: true,
      sent,
      messageId,
      previewUrl,
      recipient: email,
      status: "accepted",
    });
  } catch (err: any) {
    console.error("Meeting confirmation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

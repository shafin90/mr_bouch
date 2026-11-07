"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const timeSlots = ["09:00", "10:30", "14:00", "15:30", "17:00"];

export function MeetingRequestForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [meetingFormat, setMeetingFormat] = useState("in_person");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = e.currentTarget;
    const data = new FormData(form);
    const supabase = createClient();

    const requestDetails = `[Format: ${meetingFormat}] Message: ${data.get("message")}`;

    const { error } = await supabase.from("meeting_requests").insert({
      name: data.get("name"),
      email: data.get("email"),
      organization: data.get("organization"),
      message: requestDetails,
      meeting_type: meetingFormat,
      preferred_date: data.get("date"),
      preferred_time: data.get("time"),
      status: "pending",
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
    } else {
      setStatus("success");
      setMessage(
        "Votre demande a bien été transmise. Le secrétariat de Touré Ahmed Bouah prendra contact avec vous dans les meilleurs délais."
      );
      form.reset();
    }
  }

  if (status === "success") {
    return (
      <div style={{ background: "var(--paper)", padding: "48px 32px", textAlign: "center", borderTop: "2px solid var(--gold)" }}>
        <div style={{ color: "var(--gold)", fontSize: "28px", marginBottom: "16px" }}>
          ◇
        </div>
        <h3 style={{ fontFamily: "Georgia, serif", fontSize: "28px", color: "var(--ink)", marginBottom: "12px" }}>
          Demande transmise avec succès
        </h3>
        <p style={{ fontSize: "14px", lineHeight: 1.75, color: "var(--muted)", maxWidth: "460px", margin: "0 auto 28px" }}>
          {message}
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="btn-primary"
        >
          Envoyer un autre message ↗
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      {/* Name & Email */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px" }}>
        <div>
          <label style={{ display: "block", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "10px", fontWeight: 700, color: "var(--ink)", marginBottom: "8px" }}>
            Nom &amp; Prénom <span style={{ color: "var(--gold)" }}>*</span>
          </label>
          <input
            name="name"
            required
            placeholder="Votre nom complet"
            style={{
              width: "100%",
              padding: "13px 16px",
              fontSize: "13px",
              background: "#fff",
              border: "1px solid var(--border)",
              color: "var(--ink)",
              outline: "none",
              borderRadius: "0",
            }}
            className="focus:border-gold"
          />
        </div>

        <div>
          <label style={{ display: "block", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "10px", fontWeight: 700, color: "var(--ink)", marginBottom: "8px" }}>
            Adresse e-mail <span style={{ color: "var(--gold)" }}>*</span>
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder="votre.email@exemple.com"
            style={{
              width: "100%",
              padding: "13px 16px",
              fontSize: "13px",
              background: "#fff",
              border: "1px solid var(--border)",
              color: "var(--ink)",
              outline: "none",
              borderRadius: "0",
            }}
            className="focus:border-gold"
          />
        </div>
      </div>

      {/* Organization */}
      <div>
        <label style={{ display: "block", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "10px", fontWeight: 700, color: "var(--ink)", marginBottom: "8px" }}>
          Organisation / Société
        </label>
        <input
          name="organization"
          placeholder="Nom de votre organisation ou entreprise"
          style={{
            width: "100%",
            padding: "13px 16px",
            fontSize: "13px",
            background: "#fff",
            border: "1px solid var(--border)",
            color: "var(--ink)",
            outline: "none",
            borderRadius: "0",
          }}
          className="focus:border-gold"
        />
      </div>

      {/* Format */}
      <div style={{ border: "1px solid var(--border)", padding: "18px", background: "var(--paper)" }}>
        <label style={{ display: "block", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "10px", fontWeight: 700, color: "var(--ink)", marginBottom: "12px" }}>
          Format du rendez-vous
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", fontSize: "13px", color: "var(--ink)" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input
              type="radio"
              name="format"
              value="in_person"
              checked={meetingFormat === "in_person"}
              onChange={() => setMeetingFormat("in_person")}
              style={{ accentColor: "var(--gold)" }}
            />
            En personne (Siège SOPHIA S.A., Abidjan)
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input
              type="radio"
              name="format"
              value="online"
              checked={meetingFormat === "online"}
              onChange={() => setMeetingFormat("online")}
              style={{ accentColor: "var(--gold)" }}
            />
            Visioconférence
          </label>
        </div>
      </div>

      {/* Date & Time */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px" }}>
        <div>
          <label style={{ display: "block", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "10px", fontWeight: 700, color: "var(--ink)", marginBottom: "8px" }}>
            Date souhaitée <span style={{ color: "var(--gold)" }}>*</span>
          </label>
          <input
            name="date"
            type="date"
            required
            style={{
              width: "100%",
              padding: "13px 16px",
              fontSize: "13px",
              background: "#fff",
              border: "1px solid var(--border)",
              color: "var(--ink)",
              outline: "none",
              borderRadius: "0",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "10px", fontWeight: 700, color: "var(--ink)", marginBottom: "8px" }}>
            Créneau horaire <span style={{ color: "var(--gold)" }}>*</span>
          </label>
          <select
            name="time"
            required
            style={{
              width: "100%",
              padding: "13px 16px",
              fontSize: "13px",
              background: "#fff",
              border: "1px solid var(--border)",
              color: "var(--ink)",
              outline: "none",
              borderRadius: "0",
            }}
          >
            <option value="">Sélectionner une heure</option>
            {timeSlots.map((t) => (
              <option key={t} value={t}>
                {t} (Heure d&apos;Abidjan)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Message */}
      <div>
        <label style={{ display: "block", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "10px", fontWeight: 700, color: "var(--ink)", marginBottom: "8px" }}>
          Message / Objet de l&apos;échange <span style={{ color: "var(--gold)" }}>*</span>
        </label>
        <textarea
          name="message"
          required
          rows={4}
          placeholder="Décrivez brièvement le projet ou sujet que vous souhaitez aborder..."
          style={{
            width: "100%",
            padding: "13px 16px",
            fontSize: "13px",
            background: "#fff",
            border: "1px solid var(--border)",
            color: "var(--ink)",
            outline: "none",
            borderRadius: "0",
            lineHeight: 1.6,
          }}
        />
      </div>

      <p style={{ fontSize: "11px", color: "var(--muted)", margin: "0" }}>
        Vos informations restent strictement confidentielles et réservées au cabinet de Touré Ahmed Bouah.
      </p>

      {message && status === "error" && (
        <p style={{ color: "#d9534f", fontSize: "12px", margin: "0" }}>{message}</p>
      )}

      <div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="btn-primary"
          style={{ width: "100%", justifyContent: "center" }}
        >
          {status === "loading" ? "Envoi en cours..." : "Transmettre la demande ↗"}
        </button>
      </div>
    </form>
  );
}

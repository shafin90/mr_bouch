import type { Metadata } from "next";
import { MeetingRequestForm } from "@/components/forms/MeetingRequestForm";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Rendez-vous — Touré Ahmed Bouah",
  description: "Demande de rendez-vous officiel avec Touré Ahmed Bouah, Président de SOPHIA S.A.",
};

export default function RendezVousPage() {
  return (
    <div style={{ background: "var(--paper)", minHeight: "100vh" }}>
      {/* Header — Navy */}
      <section style={{ background: "var(--navy)", color: "#fff", padding: "clamp(80px, 10vw, 120px) 0 clamp(60px, 8vw, 100px)" }}>
        <div className="container-x">
          <Reveal>
            <p className="eyebrow">Contact &amp; Échange</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 style={{ color: "#fff", lineHeight: 0.9, maxWidth: 640, marginBottom: 24 }}>
              Demande de<br /><em>Rendez-vous</em>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p style={{ color: "rgba(203,211,216,0.85)", maxWidth: 520, fontSize: "17px", lineHeight: 1.75 }}>
              Pour toute proposition de partenariat, projet d&apos;aménagement foncier ou échange institutionnel, veuillez compléter le formulaire ci-dessous.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Form + Contacts */}
      <section style={{ background: "var(--paper)", padding: "clamp(60px, 8vw, 100px) 0" }}>
        <div
          className="container-x"
          style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: "clamp(40px, 6vw, 80px)", alignItems: "start" }}
        >
          {/* Form */}
          <Reveal>
            <div
              style={{
                background: "var(--cream)",
                padding: "clamp(32px, 4vw, 48px)",
                borderTop: "2px solid var(--gold)",
              }}
            >
              <MeetingRequestForm />
            </div>
          </Reveal>

          {/* Contact info */}
          <Reveal delay={0.1}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Cabinet */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 28 }}>
                <span
                  style={{
                    display: "block",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    fontSize: "9px",
                    fontWeight: 700,
                    color: "var(--gold)",
                    marginBottom: 16,
                  }}
                >
                  Cabinet de la Présidence
                </span>
                <p
                  style={{
                    fontFamily: "Georgia, serif",
                    fontSize: "clamp(18px, 2vw, 22px)",
                    color: "var(--ink)",
                    lineHeight: 1.5,
                    margin: "0 0 12px",
                  }}
                >
                  SOPHIA S.A.
                </p>
                <p style={{ color: "var(--muted)", fontSize: "14px", lineHeight: 1.75, margin: "0 0 20px" }}>
                  Cocody 2 Plateaux<br />
                  Abidjan, Côte d&apos;Ivoire
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <a href="tel:+2252722411568" style={{ color: "var(--ink)", fontSize: "14px", textDecoration: "none", fontWeight: 600 }}>
                    (+225) 27 22 41 15 68
                  </a>
                  <a href="mailto:presidence@sophiasa.net" style={{ color: "var(--gold)", fontSize: "14px", textDecoration: "none" }}>
                    presidence@sophiasa.net
                  </a>
                </div>
              </div>

              {/* Confidentiality */}
              <div
                style={{
                  background: "var(--cream)",
                  padding: "24px 28px",
                  borderLeft: "2px solid var(--gold)",
                }}
              >
                <strong
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "var(--ink)",
                    marginBottom: 10,
                  }}
                >
                  Confidentialité &amp; Déontologie
                </strong>
                <p style={{ fontSize: "13px", lineHeight: 1.75, color: "var(--muted)", margin: 0 }}>
                  Tous les échanges et documents transmis au secrétariat de Touré Ahmed Bouah sont traités avec la plus stricte discrétion.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

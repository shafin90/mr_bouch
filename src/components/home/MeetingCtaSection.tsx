import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";

export function MeetingCtaSection() {
  return (
    <section
      style={{
        background: "var(--navy)",
        color: "#fff",
        padding: "clamp(70px, 9vw, 110px) 0",
      }}
    >
      <div className="container-x">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.15fr 0.85fr",
            gap: "clamp(36px, 6vw, 64px)",
            alignItems: "center",
          }}
          className="cta-grid"
        >
          {/* Left: Proposal & Invitation */}
          <div>
            <Reveal>
              <p className="eyebrow">
                <span>✦</span> Cabinet &amp; Partenariats
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <h2 style={{ color: "#fff", marginBottom: 20 }}>
                Chaque transformation<br />commence par une <em>rencontre.</em>
              </h2>
            </Reveal>

            <Reveal delay={0.2}>
              <p
                style={{
                  color: "rgba(220, 228, 235, 0.85)",
                  maxWidth: 520,
                  fontSize: "15px",
                  lineHeight: 1.8,
                  marginBottom: 32,
                }}
              >
                Partenariat foncier institutionnel, investissement dans les macro-lots d&apos;Akwaba City ou co-développement d&apos;infrastructures : le cabinet de Touré Ahmed Bouah est à votre écoute pour une consultation privée.
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 24 }}>
                <Link href="/rendez-vous" className="btn-primary">
                  Demander un rendez-vous ↗
                </Link>
                <Link href="/biographie" className="text-link-light">
                  En savoir plus sur le parcours ↗
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Right: Direct Executive Coordinates Box */}
          <Reveal delay={0.2}>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderTop: "2px solid var(--gold)",
                padding: "clamp(28px, 4vw, 40px)",
                display: "flex",
                flexDirection: "column",
                gap: 24,
              }}
            >
              <div>
                <span
                  style={{
                    display: "block",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    fontSize: "9px",
                    fontWeight: 700,
                    color: "var(--gold)",
                    marginBottom: 8,
                  }}
                >
                  Cabinet de la Présidence
                </span>
                <p style={{ color: "#fff", fontSize: "19px", fontFamily: "Georgia, serif", lineHeight: 1.4, margin: "0 0 6px" }}>
                  SOPHIA S.A.
                </p>
                <p style={{ color: "rgba(255, 255, 255, 0.65)", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>
                  Cocody 2 Plateaux, Abidjan · Côte d&apos;Ivoire
                </p>
              </div>

              <div style={{ height: 1, background: "rgba(255, 255, 255, 0.1)" }} />

              <div>
                <span
                  style={{
                    display: "block",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    fontSize: "9px",
                    fontWeight: 700,
                    color: "var(--gold)",
                    marginBottom: 8,
                  }}
                >
                  Secrétariat Général
                </span>
                <p style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "13px", margin: "0 0 6px" }}>
                  Téléphone : <strong style={{ color: "#fff" }}>(+225) 27 22 41 15 68</strong>
                </p>
                <p style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "13px", margin: 0 }}>
                  Courriel :{" "}
                  <a href="mailto:presidence@sophiasa.net" style={{ color: "var(--gold)", textDecoration: "none" }}>
                    presidence@sophiasa.net
                  </a>
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

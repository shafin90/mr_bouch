import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { getPublishedPageContent } from "@/lib/site-content";

export async function MeetingCtaSection() {
  const content = await getPublishedPageContent("home");
  const shared = await getPublishedPageContent("shared");
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
                <span>✦</span> {content.meetingEyebrow}
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <h2 style={{ color: "#fff", marginBottom: 20, whiteSpace: "pre-line" }}>
                {content.meetingTitle}
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
                {content.meetingBody}
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 24 }}>
                <Link href="/rendez-vous" className="btn-primary">
                  {content.meetingCta} ↗
                </Link>
                <Link href="/biographie" className="text-link-light">
                  {content.meetingSecondaryCta} ↗
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
                  {content.meetingOfficeLabel}
                </span>
                <p style={{ color: "#fff", fontSize: "19px", fontFamily: "Georgia, serif", lineHeight: 1.4, margin: "0 0 6px" }}>
                  {shared.officeName}
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
                  {content.meetingSecretariatLabel}
                </span>
                <p style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "13px", margin: "0 0 6px" }}>
                  {shared.footerPhoneLabel} : <strong style={{ color: "#fff" }}>{shared.footerPhone}</strong>
                </p>
                <p style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "13px", margin: 0 }}>
                  {shared.footerEmailLabel} :{" "}
                  <a href={`mailto:${shared.footerEmail}`} style={{ color: "var(--gold)", textDecoration: "none" }}>
                    {shared.footerEmail}
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

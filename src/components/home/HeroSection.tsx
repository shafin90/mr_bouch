import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { getPublishedPageContent } from "@/lib/site-content";

export async function HeroSection() {
  const content = await getPublishedPageContent("home");
  return (
    <>
      {/* Hero — Deep Restful Navy Section */}
      <section
        style={{
          background: "var(--navy)",
          color: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="container-x" style={{ padding: "clamp(60px, 8vw, 100px) clamp(1.25rem, 5vw, 3.5rem)" }}>
          <div className="hero-grid">
            {/* Left: Copy & Anchor (Natural Left-to-Right Eye Path) */}
            <div style={{ maxWidth: 580 }}>
              <Reveal>
                <p className="eyebrow">
                  <span>✦</span> {content.heroEyebrow}
                </p>
              </Reveal>

              <Reveal delay={0.1}>
                <h1 style={{ color: "#fff", marginBottom: 24, whiteSpace: "pre-line" }}>{content.heroTitle}</h1>
              </Reveal>

              <Reveal delay={0.2}>
                <p
                  style={{
                    color: "rgba(220, 228, 235, 0.88)",
                    maxWidth: 520,
                    marginBottom: 36,
                    fontSize: "16px",
                    lineHeight: 1.8,
                  }}
                >
                  {content.heroBody}
                </p>
              </Reveal>

              <Reveal delay={0.3}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 24 }}>
                  <Link href="/entrepreneuriat" className="btn-primary">
                    {content.heroProjectsCta} <span aria-hidden="true">↗</span>
                  </Link>
                  <Link href="/rendez-vous" className="text-link-light">
                    {content.heroContactCta} <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </Reveal>
            </div>

            {/* Right: Imposing, Grand Architectural Portrait */}
            <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
              <Reveal delay={0.2}>
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: "480px",
                  }}
                >
                  {/* Architectural offset gold frame */}
                  <div
                    style={{
                      position: "absolute",
                      inset: "-16px 16px 16px -16px",
                      border: "1.5px solid var(--gold)",
                      pointerEvents: "none",
                    }}
                  />
                  
                  {/* Portrait Canvas */}
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "3/4",
                      width: "100%",
                      minHeight: "440px",
                      overflow: "hidden",
                      background: "var(--navy-mid)",
                      boxShadow: "0 25px 60px rgba(0, 0, 0, 0.45)",
                    }}
                  >
                    <img
                      src={content.heroImage}
                      alt="Touré Ahmed Bouah"
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "50% 16%",
                        filter: "saturate(0.85) contrast(1.05)",
                      }}
                    />
                    
                    {/* Subtle corner watermark badge */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: "linear-gradient(to top, rgba(8, 25, 40, 0.85) 0%, transparent 100%)",
                        padding: "32px 20px 14px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "10px",
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                          color: "rgba(255, 255, 255, 0.85)",
                          fontWeight: 700,
                        }}
                      >
                        {content.heroName || "Touré Ahmed Bouah"}
                      </span>
                      <span
                        style={{
                          fontSize: "9px",
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: "var(--gold)",
                          fontWeight: 700,
                        }}
                      >
                        {content.officeName}
                      </span>
                    </div>
                  </div>

                  {/* Footnotes underneath image */}
                  <div
                    style={{
                      marginTop: 18,
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "9.5px",
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: "rgba(255, 255, 255, 0.5)",
                      fontWeight: 600,
                      paddingLeft: 4,
                    }}
                  >
                    <span>{content.heroLocation}</span>
                    <span style={{ color: "var(--gold)" }}>{content.heroRole}</span>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>

        {/* Project scope is presented as a lead, with verification details on the project page. */}
        <div className="proof-dashboard">
          <div className="container-x">
            <div className="proof-dashboard-grid">
              <div className="proof-metric-item">
                <span className="proof-metric-number">Akwaba City</span>
                <span className="proof-metric-label">{content.homeProjectMetric}</span>
              </div>
              <div className="proof-metric-item">
                <span className="proof-metric-number">SOPHIA S.A.</span>
                <span className="proof-metric-label">Aménagement &amp; co-développement</span>
              </div>
              <div className="proof-metric-item">
                <span className="proof-metric-number">Côte d&apos;Ivoire</span>
                <span className="proof-metric-label">Ancrage territorial</span>
              </div>
              <div className="proof-metric-item">
                <span className="proof-metric-number">Partenariats</span>
                <span className="proof-metric-label">Dialoguons sur les opportunités</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

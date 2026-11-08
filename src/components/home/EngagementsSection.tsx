import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { getPublishedPageContent } from "@/lib/site-content";

export async function EngagementsSection() {
  const content = await getPublishedPageContent("home");
  const focusAreas = [content.focus1, content.focus2, content.focus3, content.focus4];
  return (
    <section style={{ background: "var(--paper)", padding: "clamp(70px, 9vw, 110px) 0" }}>
      <div className="container-x">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "0.9fr 1.1fr",
            gap: "clamp(36px, 6vw, 72px)",
            alignItems: "center",
          }}
          className="about-split"
        >
          {/* Left: Offset Portrait Image with Fine Gold Frame */}
          <Reveal>
            <div style={{ position: "relative", maxWidth: 420, margin: "0 auto" }}>
              <div
                style={{
                  position: "absolute",
                  inset: "-12px 12px 12px -12px",
                  border: "1px solid var(--gold)",
                  pointerEvents: "none",
                }}
              />
              <div style={{ position: "relative", aspectRatio: "4/5", overflow: "hidden", background: "#10283a" }}>
                <img
                  src={content.engagementsImage}
                  alt="Fondation Solidarité & Développement"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.7) contrast(1.04)" }}
                />
              </div>
            </div>
          </Reveal>

          {/* Right: Focused Content */}
          <div>
            <Reveal>
              <p className="eyebrow-dark">
                <span className="section-marker">03</span> {content.engagementsEyebrow.replace(/^03\s*/, "")}
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <h2 style={{ marginBottom: 20 }}>
                {content.engagementsTitle}
              </h2>
            </Reveal>

            <Reveal delay={0.2}>
              <p style={{ fontSize: "15px", lineHeight: 1.8, marginBottom: 24, color: "var(--muted)" }}>
                {content.engagementsBody}
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="principles-grid">
                {focusAreas.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.4}>
              <Link href="/engagements" className="text-link">
                {content.engagementsCta} ↗
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

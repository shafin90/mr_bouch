/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { getPublishedPageContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Engagements & Fondation — Touré Ahmed Bouah",
  description: "Engagements de Touré Ahmed Bouah à travers la Fondation Solidarité & Développement.",
};

export default async function EngagementsPage() {
  const content = await getPublishedPageContent("engagements");
  const areas = [content.area1, content.area2, content.area3, content.area4].map((entry, index) => {
    const [title, ...description] = entry.split(" — ");
    return { num: String(index + 1).padStart(2, "0"), title, desc: description.join(" — ") };
  });
  return (
    <div style={{ background: "var(--paper)", minHeight: "100vh" }}>
      {/* Hero — Navy */}
      <section
        style={{
          background: "var(--navy)",
          color: "#fff",
          padding: "clamp(80px, 10vw, 120px) 0",
        }}
      >
        <div
          className="container-x"
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "clamp(40px, 6vw, 80px)",
            alignItems: "center",
          }}
        >
          <div>
            <Reveal>
              <p className="eyebrow">{content.eyebrow}</p>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 style={{ color: "#fff", lineHeight: 0.9, marginBottom: 32 }}>
                {content.title}
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p style={{ color: "rgba(203,211,216,0.85)", maxWidth: 520, fontSize: "17px", lineHeight: 1.75, marginBottom: 36 }}>
                {content.intro}
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <Link href="/rendez-vous" className="btn-primary">
                {content.heroCta} ↗
              </Link>
            </Reveal>
          </div>

          <Reveal delay={0.2}>
            <div style={{ position: "relative", maxWidth: 440, marginLeft: "auto" }}>
              <div
                style={{
                  position: "absolute",
                  inset: "-16px 16px 16px -16px",
                  border: "1px solid var(--gold)",
                  pointerEvents: "none",
                }}
              />
              <div style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden" }}>
                <img
                  src={content.heroImage}
                  alt="Touré Ahmed Bouah lors d'une rencontre communautaire"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.65) contrast(1.04)" }}
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Quote */}
      <section style={{ background: "var(--cream)", padding: "clamp(60px, 8vw, 100px) 0" }}>
        <div className="container-x" style={{ maxWidth: 800 }}>
          <Reveal>
            <blockquote
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "clamp(22px, 3vw, 36px)",
                color: "var(--ink)",
                fontWeight: 400,
                fontStyle: "italic",
                lineHeight: 1.4,
                letterSpacing: "-0.03em",
                margin: 0,
              }}
            >
              {content.quote}
            </blockquote>
            <p style={{ marginTop: 20, fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--gold)" }}>
              Touré Ahmed Bouah
            </p>
          </Reveal>
        </div>
      </section>

      {/* 4 Areas */}
      <section style={{ background: "var(--paper)", padding: "clamp(80px, 10vw, 120px) 0" }}>
        <div className="container-x">
          <Reveal>
            <p className="eyebrow-dark">Axes d&apos;Intervention</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 style={{ marginBottom: 56 }}>
              {content.areasTitle}
            </h2>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", borderTop: "1px solid var(--border)", gap: 0 }}>
            {areas.map((a, idx) => (
              <Reveal key={a.num} delay={idx * 0.08}>
                <div
                  style={{
                    padding: "36px",
                    borderBottom: idx < 2 ? "1px solid var(--border)" : "none",
                    borderRight: idx % 2 === 0 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <span style={{ color: "var(--gold)", font: "italic 15px Georgia, serif", display: "block", marginBottom: 32 }}>{a.num}</span>
                  <h3 style={{ marginBottom: 14, fontSize: "clamp(18px, 2vw, 24px)" }}>{a.title}</h3>
                  <p style={{ fontSize: "14px", lineHeight: 1.75 }}>{a.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--navy)", padding: "clamp(60px, 8vw, 100px) 0" }}>
        <div className="container-x" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 32 }}>
          <Reveal>
            <h2 style={{ color: "#fff", maxWidth: 480 }}>
              {content.closingTitle}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Link href="/rendez-vous" className="btn-primary">{content.closingCta} ↗</Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";

const focusAreas = [
  "Éco-Urbanisme & Villes Durables",
  "Paix Foncière & Justice Coutumière",
  "Formation aux Métiers de la Ville",
  "Éducation & Santé Communautaire",
];

export function EngagementsSection() {
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
                <Image
                  src="https://www.fratmat.info/uploads/images/2025/08/05/248649.jpeg"
                  alt="Fondation Solidarité & Développement"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  style={{ objectFit: "cover", filter: "saturate(0.7) contrast(1.04)" }}
                />
              </div>
            </div>
          </Reveal>

          {/* Right: Focused Content */}
          <div>
            <Reveal>
              <p className="eyebrow-dark">
                <span className="section-marker">03</span> Engagements &amp; RSE
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <h2 style={{ marginBottom: 20 }}>
                Bâtir un Modèle Équitable,<br />
                Respectueux des <em>Communautés.</em>
              </h2>
            </Reveal>

            <Reveal delay={0.2}>
              <p style={{ fontSize: "15px", lineHeight: 1.8, marginBottom: 24, color: "var(--muted)" }}>
                Pour Touré Ahmed Bouah, la viabilité d&apos;un grand projet foncier repose sur la concorde et le dialogue continu avec les populations locales. À travers la <strong style={{ color: "var(--ink)" }}>Fondation Solidarité &amp; Développement</strong>, il investit dans l&apos;éducation, l&apos;accès à l&apos;eau potable et la formation technique dans les villages riverains.
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
                Découvrir la fondation ↗
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Biographie — Touré Ahmed Bouah",
  description: "Biographie officielle de Touré Ahmed Bouah : ingénieur en gestion des risques, PDG de SOPHIA S.A., promoteur d'Akwaba City et auteur de 49 ouvrages.",
};

const timelineMilestones = [
  { period: "1995 — 2003", title: "Formation d'Ingénieur & Gestion des Risques", desc: "Études supérieures en France spécialisées en gestion des risques. Début de carrière dans la sûreté aéroportuaire et le conseil organisationnel, forgeant une culture méthodique d'anticipation et d'analyse." },
  { period: "2004", title: "Création de SOPHIA S.A.", desc: "Fondation de la Société de Promotion de l'Habitat et de l'Investissement en Afrique. Structuration d'opérations d'aménagement foncier concertées avec les communautés locales et validées par l'État." },
  { period: "2010 — 2017", title: "Grands Lotissements & Sécurisation Foncière", desc: "Réalisation de plusieurs programmes de lotissements d'envergure dans le Grand Abidjan avec viabilisation (VRD) et délivrance de titres de concession définitive (ACD)." },
  { period: "2018 — 2023", title: "Genèse d'Akwaba City (12 000 Hectares)", desc: "Conception du masterplan de la Ville Nouvelle Akwaba City le long de l'autoroute du Nord reliant Abidjan et Anyama. Déclaration d'utilité publique et adhésion des chefferies coutumières." },
  { period: "2024 — 2026", title: "Consolidation & 49ᵉ Ouvrage Publié", desc: "Poursuite des partenariats techniques et financiers pour les infrastructures structurantes. Publication de son 49ᵉ ouvrage doctrinal et engagement continu pour la cohésion sociale." },
];

const principles = [
  "Acheter avec marge — la valeur se crée à la décision",
  "Protéger le capital — anticiper avant de s'engager",
  "Tenir avec intention — maîtriser revenus, équité et sortie",
  "Penser indépendamment — les preuves sur la foule",
  "Construire au-delà de soi — liberté, résilience, héritage",
  "Sécuriser le foncier — titres définitifs avant tout",
];

export default function BiographiePage() {
  return (
    <div style={{ background: "var(--paper)", minHeight: "100vh" }}>
      {/* Hero Header — Navy */}
      <section style={{ background: "var(--navy)", color: "#fff", padding: "clamp(80px, 10vw, 120px) 0 0" }}>
        <div
          className="container-x"
          style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "clamp(40px, 6vw, 80px)", alignItems: "flex-end" }}
        >
          <div style={{ paddingBottom: "clamp(60px, 8vw, 100px)" }}>
            <Reveal>
              <p className="eyebrow">Biographie Officielle</p>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 style={{ color: "#fff", lineHeight: 0.9, marginBottom: 32 }}>
                Touré<br />Ahmed <em>Bouah</em>
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p style={{ color: "rgba(203,211,216,0.85)", maxWidth: 500, fontSize: "17px", lineHeight: 1.75, marginBottom: 36 }}>
                Entrepreneur ivoirien, dirigeant de <strong style={{ color: "#fff" }}>SOPHIA S.A.</strong> et président de la <strong style={{ color: "#fff" }}>Fondation Solidarité &amp; Développement</strong>. Son parcours associe développement urbain à grande échelle, rigueur d&apos;ingénieur en gestion des risques, engagement intellectuel avec 49 ouvrages publiés, et contribution active au progrès social.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 28 }}>
                <a href="#parcours" className="btn-primary">Voir le parcours chronologique ↗</a>
                <Link href="/rendez-vous" className="text-link-light">Prendre contact ↗</Link>
              </div>
            </Reveal>
          </div>

          {/* Portrait */}
          <div style={{ position: "relative", alignSelf: "flex-end" }}>
            <Reveal delay={0.2}>
              <div
                style={{
                  position: "relative",
                  maxWidth: 380,
                  marginLeft: "auto",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: "-16px 16px 16px -16px",
                    border: "1px solid var(--gold)",
                    pointerEvents: "none",
                  }}
                />
                <div style={{ position: "relative", aspectRatio: "4/5", overflow: "hidden" }}>
                  <Image
                    src="https://www.echosmedias.net/uploads/2025-06/fi_2151.jpg"
                    alt="Touré Ahmed Bouah"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 36vw"
                    style={{ objectFit: "cover", objectPosition: "50% 20%", filter: "saturate(0.65) contrast(1.05)" }}
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Five Principles */}
      <section style={{ background: "var(--navy)", color: "#fff" }}>
        <div
          className="container-x"
          style={{ padding: "clamp(60px, 8vw, 100px) 0", borderTop: "1px solid rgba(255,255,255,0.1)" }}
        >
          <Reveal>
            <p className="eyebrow">Cinq principes d&apos;action</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 style={{ color: "#fff", maxWidth: 480, marginBottom: 40 }}>
              Bâtir pour<br /><em>l&apos;Afrique</em>
            </h2>
          </Reveal>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              margin: "0",
            }}
          >
            {principles.map((p, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <div
                  style={{
                    textTransform: "uppercase",
                    letterSpacing: "0.09em",
                    borderBottom: "1px solid rgba(255,255,255,0.12)",
                    padding: "16px 0",
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  <span style={{ color: "var(--gold)", marginRight: 10 }}>◇</span>
                  {p}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section id="parcours" style={{ background: "var(--cream)", padding: "clamp(80px, 10vw, 120px) 0" }}>
        <div className="container-x">
          <Reveal>
            <p className="eyebrow-dark">Jalons</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 style={{ marginBottom: 56 }}>Repères <em>Chronologiques</em></h2>
          </Reveal>

          <div style={{ maxWidth: 760, display: "flex", flexDirection: "column", gap: 2 }}>
            {timelineMilestones.map((m, i) => (
              <Reveal key={m.period} delay={i * 0.08}>
                <div
                  style={{
                    background: "var(--paper)",
                    borderLeft: "2px solid var(--gold)",
                    padding: "clamp(20px, 3vw, 32px) clamp(20px, 3vw, 36px)",
                    marginBottom: 2,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "ui-monospace, monospace",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--gold)",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      display: "block",
                      marginBottom: 8,
                    }}
                  >
                    {m.period}
                  </span>
                  <h3
                    style={{
                      fontFamily: "Georgia, serif",
                      fontSize: "clamp(18px, 2vw, 22px)",
                      letterSpacing: "-0.02em",
                      marginBottom: 10,
                    }}
                  >
                    {m.title}
                  </h3>
                  <p style={{ fontSize: "14px", lineHeight: 1.75, margin: 0 }}>{m.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section style={{ background: "var(--paper)", padding: "clamp(60px, 8vw, 100px) 0" }}>
        <div className="container-x" style={{ maxWidth: 760, margin: "0 auto" }}>
          <Reveal>
            <blockquote
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "clamp(22px, 3vw, 32px)",
                color: "var(--ink)",
                fontWeight: 400,
                fontStyle: "italic",
                lineHeight: 1.4,
                letterSpacing: "-0.025em",
                borderLeft: "2px solid var(--gold)",
                paddingLeft: "clamp(20px, 3vw, 36px)",
                margin: 0,
              }}
            >
              « Bâtir pour l&apos;Afrique, c&apos;est associer rigueur d&apos;ingénierie, sécurité juridique inattaquable et respect profond des territoires. »
            </blockquote>
            <p
              style={{
                marginTop: 20,
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: "var(--gold)",
              }}
            >
              Touré Ahmed Bouah
            </p>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--cream)", padding: "clamp(60px, 8vw, 100px) 0", borderTop: "1px solid var(--border)" }}>
        <div className="container-x" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 32 }}>
          <div>
            <Reveal>
              <p className="eyebrow-dark">Collaborons</p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 style={{ maxWidth: 480 }}>
                Prêt à faire passer votre<br />investissement au niveau <em>supérieur ?</em>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <Link href="/rendez-vous" className="btn-primary">
              Prendre rendez-vous ↗
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

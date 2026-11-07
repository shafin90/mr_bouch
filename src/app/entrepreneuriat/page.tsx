/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Entrepreneuriat & SOPHIA S.A. — Touré Ahmed Bouah",
  description: "Aménagement foncier de grande envergure, Ville Nouvelle Akwaba City (12 000 Ha) et opportunités d'investissement immobilier avec SOPHIA S.A.",
};

const competencies = [
  { num: "01", title: "Aménagement Foncier & Titres ACD", desc: "Sécurisation intégrale des emprises foncières : purge officielle des droits coutumiers, validation préfectorale et obtention des Arrêtés de Concession Définitive (ACD)." },
  { num: "02", title: "Viabilisation Lourde & VRD", desc: "Coordination des études techniques et chantiers structurants : voiries lourdes, assainissement, adduction d'eau potable et réseaux électriques." },
  { num: "03", title: "Maîtrise d'Ouvrage Déléguée (MOD)", desc: "Accompagnement d'investisseurs institutionnels, de promoteurs et de banques dans le pilotage opérationnel, juridique et technique de projets immobiliers complexes." },
  { num: "04", title: "Programmes Résidentiels & Éco-Cités", desc: "Développement de logements collectifs et individuels de qualité, conçus avec des architectes de renom pour des cadres de vie durables." },
];

const modalities = [
  { title: "Macro-Lots Viabilisés", forWho: "Promoteurs, Constructeurs, Entreprises", desc: "Acquisition de parcelles viabilisées clés en main avec titres fonciers directs pour le développement immédiat de programmes d'habitat, de commerce ou de logistique." },
  { title: "Sociétés de Projet Dédiées (SPV)", forWho: "Fonds d'investissement, Family Offices", desc: "Co-investissement au capital de structures ad hoc pour le financement et la réalisation de tranches urbaines complètes, avec gouvernance partagée et rentabilité maîtrisée." },
  { title: "Partenariats Public-Privé (PPP)", forWho: "Bailleurs institutionnels, Opérateurs", desc: "Concession et réalisation d'équipements structurants : gares de transport multimodal, marchés régionaux, infrastructures d'énergie et de santé." },
];

export default function EntrepreneuriatPage() {
  return (
    <div style={{ background: "var(--paper)", minHeight: "100vh" }}>
      {/* Hero — Navy */}
      <section style={{ background: "var(--navy)", color: "#fff", padding: "clamp(80px, 10vw, 120px) 0" }}>
        <div className="container-x">
          <Reveal>
            <p className="eyebrow">SOPHIA S.A. · Aménagement Urbain</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 style={{ color: "#fff", lineHeight: 0.9, maxWidth: 680, marginBottom: 28 }}>
              Bâtir les Territoires<br />de <em>Demain.</em>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p style={{ color: "rgba(203,211,216,0.85)", maxWidth: 540, fontSize: "17px", lineHeight: 1.75 }}>
              À travers <strong style={{ color: "#fff" }}>SOPHIA S.A.</strong>, Touré Ahmed Bouah pilote des initiatives d&apos;aménagement foncier, de viabilisation et de promotion immobilière répondant aux besoins d&apos;urbanisation durable de la Côte d&apos;Ivoire.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Akwaba City Feature */}
      <section id="akwaba" style={{ background: "var(--cream)", padding: "clamp(80px, 10vw, 120px) 0" }}>
        <div
          className="container-x"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px, 6vw, 80px)", alignItems: "center" }}
        >
          <div>
            <Reveal>
              <span style={{ display: "block", textTransform: "uppercase", letterSpacing: "0.16em", fontSize: "11px", fontWeight: 700, color: "var(--gold)", marginBottom: 16 }}>
                Projet Phare
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 style={{ marginBottom: 20 }}>
                Akwaba City : La Ville<br />Nouvelle du <em>Grand Abidjan</em>
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p style={{ fontSize: "15px", lineHeight: 1.75, marginBottom: 24, color: "var(--muted)" }}>
                Conçu sur une emprise de plus de <strong>12 000 hectares</strong> sur l&apos;axe reliant Abidjan et Anyama, Akwaba City est un projet d&apos;aménagement d&apos;intérêt national visant à décongestionner la capitale économique et à accueillir la future croissance métropolitaine.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="principles-grid" style={{ marginBottom: 32 }}>
                {[
                  "Arrêté de concession ministériel",
                  "Pôles : affaires, logistique, éducation",
                  "Cadre juridique protégeant les investisseurs",
                  "Titres ACD définitifs garantis par l'État",
                ].map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.4}>
              <Link href="/rendez-vous" className="btn-primary">
                Échanger sur Akwaba City ↗
              </Link>
            </Reveal>
          </div>

          <Reveal delay={0.2}>
            <div>
              <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", marginBottom: 2, overflow: "hidden" }}>
                <Image
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80"
                  alt="Akwaba City"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  style={{ objectFit: "cover", filter: "saturate(0.7)" }}
                />
              </div>
              <div
                style={{
                  background: "var(--navy)",
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  textAlign: "center",
                }}
              >
                {[
                  { val: "12 000", label: "Hectares" },
                  { val: "+1,5 M", label: "Habitants cibles" },
                  { val: "100%", label: "Titres sécurisés" },
                ].map((s, i) => (
                  <div
                    key={s.label}
                    style={{
                      padding: "24px 12px",
                      borderRight: i < 2 ? "1px solid rgba(255,255,255,0.12)" : "none",
                    }}
                  >
                    <strong style={{ display: "block", color: "var(--gold)", fontFamily: "Georgia, serif", fontSize: "clamp(22px, 2.5vw, 30px)", fontWeight: 400, marginBottom: 4 }}>
                      {s.val}
                    </strong>
                    <span style={{ display: "block", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "9px", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Competencies */}
      <section style={{ background: "var(--paper)", padding: "clamp(80px, 10vw, 120px) 0" }}>
        <div className="container-x">
          <Reveal>
            <p className="eyebrow-dark">Expertises</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 style={{ marginBottom: 56 }}>
              Les Savoir-Faire<br />de <em>SOPHIA S.A.</em>
            </h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", borderTop: "1px solid var(--border)" }}>
            {competencies.map((c, idx) => (
              <Reveal key={c.num} delay={idx * 0.08}>
                <div
                  style={{
                    padding: "36px",
                    borderBottom: idx < 2 ? "1px solid var(--border)" : "none",
                    borderRight: idx % 2 === 0 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <span style={{ color: "var(--gold)", font: "italic 15px Georgia, serif", display: "block", marginBottom: 24 }}>{c.num}</span>
                  <h3 style={{ marginBottom: 14, fontSize: "clamp(18px, 2vw, 22px)" }}>{c.title}</h3>
                  <p style={{ fontSize: "14px", lineHeight: 1.75, color: "var(--muted)" }}>{c.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Modalities */}
      <section style={{ background: "var(--navy)", padding: "clamp(80px, 10vw, 120px) 0" }}>
        <div className="container-x">
          <Reveal>
            <p className="eyebrow">Partenariats</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 style={{ color: "#fff", marginBottom: 56 }}>
              Modalités de<br /><em>Co-Développement</em>
            </h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
            {modalities.map((m, idx) => (
              <Reveal key={m.title} delay={idx * 0.1}>
                <div
                  style={{
                    padding: "36px 36px 36px 0",
                    paddingLeft: idx > 0 ? 36 : 0,
                    borderRight: idx < 2 ? "1px solid rgba(255,255,255,0.12)" : "none",
                  }}
                >
                  <span style={{ display: "block", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "9px", fontWeight: 700, color: "var(--gold)", marginBottom: 20 }}>
                    {m.forWho}
                  </span>
                  <h3 style={{ color: "#fff", fontFamily: "Georgia, serif", fontSize: "clamp(18px, 2vw, 24px)", marginBottom: 16 }}>{m.title}</h3>
                  <p style={{ color: "rgba(200,210,216,0.8)", fontSize: "14px", lineHeight: 1.75 }}>{m.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--cream)", padding: "clamp(60px, 8vw, 100px) 0", borderTop: "1px solid var(--border)" }}>
        <div className="container-x" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 32 }}>
          <Reveal>
            <h2 style={{ maxWidth: 480 }}>
              Amenez l&apos;opportunité.<br /><em>Amenez les détails.</em>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Link href="/rendez-vous" className="btn-primary">
              Démarrer la conversation ↗
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";

const flagshipProjects = [
  {
    num: "01",
    tag: "VILLE NOUVELLE · GRAND ABIDJAN",
    title: "Akwaba City",
    scale: "12 000+ Hectares",
    desc: "Projet urbain d'envergure nationale reliant Abidjan et Anyama. Une cité intégrée comprenant quartiers d'affaires, zones résidentielles, pôles technologiques et corridors de transport multimodal.",
    specs: "Décret d'utilité publique · Titres ACD garantis",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    href: "/entrepreneuriat#akwaba",
  },
  {
    num: "02",
    tag: "HUB LOGISTIQUE & TRANSPORT",
    title: "Pôle Logistique d'Anyama",
    scale: "Plateforme Régionale",
    desc: "Infrastructures de fret connectées aux corridors autoroutiers nord pour fluidifier le transit de marchandises vers l'intérieur du pays et l'hinterland sous-régional.",
    specs: "Connexion autoroutière directe · Entrepôts sécurisés",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
    href: "/entrepreneuriat#logistique",
  },
  {
    num: "03",
    tag: "SÉCURISATION FONCIÈRE",
    title: "Lotissements Viabilisés ACD",
    scale: "Portefeuille Institutionnel",
    desc: "Parcelles prêtes à bâtir avec voirie, eau potable et électricité, délivrées avec Arrêté de Concession Définitive (ACD) pour promoteurs et investisseurs privés.",
    specs: "Purge coutumière certifiée · Zéro contentieux",
    image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=800&q=80",
    href: "/entrepreneuriat#foncier",
  },
  {
    num: "04",
    tag: "HABITAT & MIXITÉ URBAINE",
    title: "Programmes Résidentiels & Éco-Cités",
    scale: "Standing Élevé & Mixte",
    desc: "Conception de résidences modernes et respectueuses de l'environnement, intégrant espaces verts, commerces de proximité et équipements scolaires.",
    specs: "Conception bioclimatique · Cadre de vie préservé",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    href: "/entrepreneuriat#residentiel",
  },
];

export function BusinessProjectsSection() {
  return (
    <section style={{ background: "var(--cream)", padding: "clamp(70px, 9vw, 110px) 0" }}>
      <div className="container-x">
        {/* Header with Unified Left-Aligned Reading Focus */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 52, flexWrap: "wrap", gap: 20 }}>
          <div>
            <Reveal>
              <p className="eyebrow-dark">
                <span className="section-marker">02</span> Entrepreneuriat &amp; Mégaprojets
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 style={{ maxWidth: 640 }}>
                Des Réalisations <em>Structurantes</em><br />pour le Territoire.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <Link href="/entrepreneuriat" className="text-link">
              Consulter tous les programmes ↗
            </Link>
          </Reveal>
        </div>

        {/* 2x2 Clean Structured Investor Cards (High Eye Comfort) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))", gap: "24px" }}>
          {flagshipProjects.map((p, idx) => (
            <Reveal key={p.title} delay={idx * 0.08}>
              <div className="peaceful-project-card">
                {/* Photo Top with Fixed Aspect Ratio */}
                <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", overflow: "hidden", background: "#10283a" }}>
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 45vw"
                    style={{ objectFit: "cover", filter: "saturate(0.75)" }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: 14,
                      left: 14,
                      background: "rgba(8, 25, 40, 0.88)",
                      color: "#fff",
                      fontSize: "9px",
                      fontWeight: 700,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      padding: "5px 10px",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                    }}
                  >
                    Projet #{p.num}
                  </div>
                </div>

                {/* Card Body with Clear Scannable Hierarchy */}
                <div style={{ padding: "28px 28px 24px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                    <span
                      style={{
                        textTransform: "uppercase",
                        letterSpacing: "0.14em",
                        fontSize: "9px",
                        fontWeight: 700,
                        color: "var(--gold)",
                      }}
                    >
                      {p.tag}
                    </span>
                    <span
                      style={{
                        fontFamily: "ui-monospace, monospace",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "var(--ink)",
                      }}
                    >
                      {p.scale}
                    </span>
                  </div>

                  <h3 style={{ margin: "0 0 12px", fontSize: "22px" }}>
                    {p.title}
                  </h3>

                  <p style={{ margin: "0 0 20px", fontSize: "14px", lineHeight: 1.7, flexGrow: 1 }}>
                    {p.desc}
                  </p>

                  <div
                    style={{
                      borderTop: "1px solid var(--border-light)",
                      paddingTop: 14,
                      marginBottom: 16,
                      fontSize: "11px",
                      color: "var(--muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span style={{ color: "var(--gold)" }}>✓</span>
                    <span>{p.specs}</span>
                  </div>

                  <div style={{ paddingTop: 4 }}>
                    <Link href={p.href} className="text-link">
                      Détails de l&apos;opération ↗
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

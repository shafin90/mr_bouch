import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";

const books = [
  {
    num: "01",
    title: "L'Aménagement du Territoire et la Maîtrise des Risques en Afrique",
    category: "URBANISME & RISQUES",
    desc: "Une synthèse doctrinale sur la gestion des vulnérabilités foncières et la planification rationnelle des métropoles ouest-africaines face aux défis démographiques.",
    year: "2024",
  },
  {
    num: "02",
    title: "La Ville Nouvelle : Modèle de Croissance et d'Inclusion",
    category: "ÉCONOMIE & PROSPECTIVE",
    desc: "Analyse approfondie de la viabilité des cités intégrées et des retombées socio-économiques pour les populations riveraines et investisseurs institutionnels.",
    year: "2023",
  },
  {
    num: "03",
    title: "Foncier, Équité et Progrès Social",
    category: "GOUVERNANCE & SOCIÉTÉ",
    desc: "Plaidoyer pour un nouveau contrat territorial associant chefferies coutumières, promoteurs privés et puissance publique dans une dynamique apaisée.",
    year: "2022",
  },
];

export function PublicationsSection() {
  return (
    <section style={{ background: "var(--cream)", padding: "clamp(70px, 9vw, 110px) 0" }}>
      <div className="container-x">
        {/* Header with Unified Left-Aligned Reading Focus */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 52, flexWrap: "wrap", gap: 20 }}>
          <div>
            <Reveal>
              <p className="eyebrow-dark">
                <span className="section-marker">04</span> Publications &amp; Essais
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 style={{ maxWidth: 640 }}>
                49 Ouvrages pour<br /><em>Nourrir les Idées.</em>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <Link href="/biographie#publications" className="text-link">
              Consulter le corpus littéraire ↗
            </Link>
          </Reveal>
        </div>

        {/* 3-Column Editorial Grid */}
        <div className="path-grid">
          {books.map((b, idx) => (
            <Reveal key={b.title} delay={idx * 0.1}>
              <div
                style={{
                  paddingRight: idx < 2 ? "32px" : "0",
                  paddingLeft: idx > 0 ? "32px" : "0",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
                  <span className="path-num">{b.num}</span>
                  <span
                    style={{
                      textTransform: "uppercase",
                      letterSpacing: "0.14em",
                      fontSize: "9px",
                      fontWeight: 700,
                      color: "var(--gold)",
                    }}
                  >
                    {b.category}
                  </span>
                </div>

                <h3 style={{ margin: "0 0 14px", minHeight: "58px", fontSize: "20px", lineHeight: 1.3 }}>
                  {b.title}
                </h3>

                <p style={{ margin: "0 0 24px", fontSize: "14px", lineHeight: 1.75, flexGrow: 1 }}>
                  {b.desc}
                </p>

                <div
                  style={{
                    paddingTop: 16,
                    borderTop: "1px solid var(--border-light)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px", color: "var(--muted)", fontWeight: 600 }}>
                    Année {b.year}
                  </span>
                  <Link href="/biographie#publications" className="text-link" style={{ fontSize: "10px" }}>
                    Lire l&apos;extrait ↗
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

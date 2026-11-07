import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";

const roles = [
  {
    num: "01",
    tag: "AMÉNAGEMENT FONCIER",
    title: "Promoteur Immobilier & Bâtisseur",
    desc: "Président-Directeur Général de SOPHIA S.A., Touré Ahmed Bouah pilote l'aménagement de grands ensembles fonciers et urbains en Côte d'Ivoire. Il transforme le foncier brut en territoires structurés, viabilisés et sécurisés avec titres ACD.",
    href: "/entrepreneuriat",
    linkText: "Explorer les projets",
  },
  {
    num: "02",
    tag: "ÉDITION & DOCTRINE",
    title: "Auteur de 49 Ouvrages",
    desc: "Auteur prolifique, il consacre ses écrits aux enjeux du développement économique, à la maîtrise des risques et à la structuration des villes africaines. Ses essais constituent une contribution intellectuelle majeure.",
    href: "/biographie",
    linkText: "Consulter ses écrits",
  },
  {
    num: "03",
    tag: "SOLIDARITÉ SOCIALE",
    title: "Philanthrope & Action Communautaire",
    desc: "À travers la Fondation Solidarité & Développement, il soutient l'éducation, la formation aux métiers techniques du bâtiment et l'amélioration du cadre de vie des communautés villageoises riveraines.",
    href: "/engagements",
    linkText: "Découvrir la fondation",
  },
];

export function BackgroundSection() {
  return (
    <section style={{ background: "var(--paper)", padding: "clamp(70px, 9vw, 110px) 0" }}>
      <div className="container-x">
        {/* Section Header with Clear Scanning Anchor */}
        <div style={{ marginBottom: 52 }}>
          <Reveal>
            <p className="eyebrow-dark">
              <span className="section-marker">01</span> Le Parcours &amp; La Vision
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 style={{ maxWidth: 640 }}>
              Entreprendre avec une vision.<br />
              Agir avec <em>conviction.</em>
            </h2>
          </Reveal>
        </div>

        {/* 3-Column Numbered Grid with Balanced Eye-Level Alignment */}
        <div className="path-grid">
          {roles.map((item, idx) => (
            <Reveal key={item.title} delay={idx * 0.1}>
              <article
                style={{
                  paddingRight: idx < 2 ? "32px" : "0",
                  paddingLeft: idx > 0 ? "32px" : "0",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 28 }}>
                  <span className="path-num">{item.num}</span>
                  <span
                    style={{
                      textTransform: "uppercase",
                      letterSpacing: "0.14em",
                      fontSize: "9px",
                      fontWeight: 700,
                      color: "var(--gold)",
                    }}
                  >
                    {item.tag}
                  </span>
                </div>

                <h3 style={{ margin: "0 0 16px", minHeight: "64px" }}>
                  {item.title}
                </h3>

                <p style={{ margin: "0 0 24px", flexGrow: 1, fontSize: "14px", lineHeight: 1.75 }}>
                  {item.desc}
                </p>

                <div style={{ paddingTop: 16, borderTop: "1px solid var(--border-light)" }}>
                  <Link href={item.href} className="text-link">
                    {item.linkText} ↗
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

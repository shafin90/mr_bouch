import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { getPublishedPageContent } from "@/lib/site-content";

const flagshipProjects = [
  {
    num: "01",
    tag: "VILLE NOUVELLE · GRAND ABIDJAN",
    title: "Akwaba City",
    scale: "Grand Abidjan",
    desc: "Projet de ville nouvelle présenté sur le corridor Abidjan–Anyama. Le périmètre, le calendrier, les autorisations et les besoins de partenariat sont à confirmer dans un dossier projet daté.",
    specs: "Statut et pièces justificatives à présenter en dossier projet",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    href: "/entrepreneuriat#akwaba",
  },
  {
    num: "02",
    tag: "HUB LOGISTIQUE & TRANSPORT",
    title: "Pôle Logistique d'Anyama",
    scale: "Plateforme Régionale",
    desc: "Piste de développement logistique autour d'Anyama, destinée à répondre aux besoins de fret et de stockage. Le périmètre et le niveau d'avancement doivent être précisés.",
    specs: "Concept présenté · détails opérationnels à confirmer",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
    href: "/entrepreneuriat#projets",
  },
  {
    num: "03",
    tag: "SÉCURISATION FONCIÈRE",
    title: "Lotissements Viabilisés ACD",
    scale: "Portefeuille Institutionnel",
    desc: "Offre d'aménagement foncier destinée aux promoteurs et investisseurs. La disponibilité, la viabilisation et les titres doivent être vérifiés parcelle par parcelle avant tout engagement.",
    specs: "Documents fonciers et état de viabilisation à vérifier",
    image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=800&q=80",
    href: "/entrepreneuriat#projets",
  },
  {
    num: "04",
    tag: "HABITAT & MIXITÉ URBAINE",
    title: "Programmes Résidentiels & Éco-Cités",
    scale: "Standing Élevé & Mixte",
    desc: "Pistes de programmes résidentiels et mixtes. Les études, les équipements prévus et le calendrier de réalisation seront communiqués lorsqu'ils seront disponibles.",
    specs: "Programme indicatif · études à documenter",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    href: "/entrepreneuriat#projets",
  },
];

export async function BusinessProjectsSection() {
  const [content, entrepreneurship] = await Promise.all([
    getPublishedPageContent("home"),
    getPublishedPageContent("entrepreneurship"),
  ]);
  const projects = flagshipProjects.map((project, index) => ({
    ...project,
    image: content[`project${index + 1}Image`] || project.image,
    title: entrepreneurship[`investorProject${index + 1}Title`],
    desc: entrepreneurship[`investorProject${index + 1}Body`],
    specs: entrepreneurship[`investorProject${index + 1}Status`],
    tag: content[`project${index + 1}Tag`],
    scale: content[`project${index + 1}Scale`],
  }));
  return (
    <section style={{ background: "var(--cream)", padding: "clamp(70px, 9vw, 110px) 0" }}>
      <div className="container-x">
        {/* Header with Unified Left-Aligned Reading Focus */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 52, flexWrap: "wrap", gap: 20 }}>
          <div>
            <Reveal>
              <p className="eyebrow-dark">
                <span className="section-marker">02</span> {content.projectEyebrow.replace(/^02\s*/, "")}
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 style={{ maxWidth: 640, whiteSpace: "pre-line" }}>{content.projectTitle}</h2>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <Link href="/entrepreneuriat" className="text-link">
              {content.projectCta} ↗
            </Link>
          </Reveal>
        </div>

        {/* 2x2 Clean Structured Investor Cards (High Eye Comfort) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))", gap: "24px" }}>
          {projects.map((p, idx) => (
            <Reveal key={p.title} delay={idx * 0.08}>
              <div className="peaceful-project-card">
                {/* Photo Top with Fixed Aspect Ratio */}
                <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", overflow: "hidden", background: "#10283a" }}>
                  <img
                    src={p.image}
                    alt={p.title}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.75)" }}
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
                    Projet #{p.num} · Illustratif
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
                    <span style={{ color: "var(--gold)" }}>i</span>
                    <span>{p.specs}</span>
                  </div>

                  <div style={{ paddingTop: 4 }}>
                    <Link href={p.href} className="text-link">
                      {idx === 0 ? "Voir le statut et les sources" : "Voir dans le portefeuille"} ↗
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

import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { createClient } from "@/lib/supabase/server";

export async function NewsSection() {
  let articles: any[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("news")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(3);
    if (data && data.length > 0) {
      articles = data;
    }
  } catch (err) {
    // fallback
  }

  if (articles.length === 0) {
    articles = [
      {
        id: "1",
        title: "SOPHIA S.A. franchit une étape décisive pour le pôle d'affaires d'Akwaba City",
        excerpt: "Analyse des retombées économiques et des accords institutionnels garantissant la viabilisation de 12 000 hectares dans le Grand Abidjan.",
        category: "Investissements",
        slug: "akwaba-city-etape-decisive",
        image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
        date: "15 Mars 2026",
      },
      {
        id: "2",
        title: "Tribune : Pourquoi la maîtrise des risques fonciers est le levier clé de l'Afrique",
        excerpt: "Touré Ahmed Bouah détaille dans une tribune exclusive comment sécuriser les capitaux privés face aux défis de l'urbanisation rapide.",
        category: "Tribune & Idées",
        slug: "maitrise-des-risques-fonciers",
        image_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
        date: "28 Février 2026",
      },
      {
        id: "3",
        title: "Développement territorial : Nouveau protocole d'accord avec les communautés villageoises",
        excerpt: "Un modèle pionnier de cohésion sociale et de redistribution assurant une paix foncière pérenne pour les chantiers d'envergure.",
        category: "Actualités",
        slug: "protocole-accord-communautes",
        image_url: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80",
        date: "20 Janvier 2026",
      },
    ];
  }

  return (
    <section style={{ background: "var(--paper)", padding: "clamp(70px, 9vw, 110px) 0" }}>
      <div className="container-x">
        {/* Header with Unified Left-Aligned Reading Focus */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 52, flexWrap: "wrap", gap: 20 }}>
          <div>
            <Reveal>
              <p className="eyebrow-dark">
                <span className="section-marker">05</span> Actualités &amp; Tribunes
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 style={{ maxWidth: 640 }}>
                Regards sur l&apos;Économie<br />
                et la <em>Ville.</em>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <Link href="/actualites" className="text-link">
              Toutes les actualités ↗
            </Link>
          </Reveal>
        </div>

        {/* 3 Articles Grid in Bola Ranson Minimal Bordered Style */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: "24px" }}>
          {articles.map((item, idx) => (
            <Reveal key={item.id} delay={idx * 0.1}>
              <article
                className="peaceful-project-card"
                style={{ padding: "0", overflow: "hidden" }}
              >
                {item.image_url && (
                  <div style={{ overflow: "hidden", aspectRatio: "16/10", background: "#10283a" }}>
                    <img
                      src={item.image_url}
                      alt={item.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        filter: "saturate(0.75)",
                        transition: "transform 0.4s ease",
                      }}
                      className="hover:scale-103"
                    />
                  </div>
                )}

                <div style={{ padding: "24px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ textTransform: "uppercase", letterSpacing: "0.14em", fontSize: "9px", fontWeight: 700, color: "var(--gold)" }}>
                      {item.category || "Actualité"}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--muted)", fontFamily: "ui-monospace, monospace" }}>
                      {item.date || (item.created_at ? new Date(item.created_at).toLocaleDateString("fr-FR") : "")}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "19px", lineHeight: 1.35, marginBottom: 12 }}>
                    <Link href={`/actualites/${item.slug || item.id}`} style={{ color: "var(--ink)", textDecoration: "none" }} className="hover:text-gold">
                      {item.title}
                    </Link>
                  </h3>

                  {item.excerpt && (
                    <p style={{ fontSize: "13.5px", lineHeight: 1.7, flexGrow: 1, marginBottom: 20 }}>
                      {item.excerpt}
                    </p>
                  )}

                  <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px solid var(--border-light)" }}>
                    <Link href={`/actualites/${item.slug || item.id}`} className="text-link" style={{ fontSize: "10px" }}>
                      Lire l&apos;article ↗
                    </Link>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

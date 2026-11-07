/* eslint-disable */
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Actualités & Blog — Touré Ahmed Bouah",
  description: "Actualités, prises de parole et tribunes de Touré Ahmed Bouah, Président de SOPHIA S.A.",
};

export default async function ActualitesPage() {
  let news: any[] = [];
  try {
    const supabase = await createClient();
    const { data: dbNews } = await supabase
      .from("news")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (dbNews && dbNews.length > 0) {
      news = dbNews;
    }
  } catch (e) {
    // fallback
  }

  if (news.length === 0) {
    news = [
      { id: "1", title: "SOPHIA S.A. franchit une étape décisive pour le pôle d'affaires d'Akwaba City", excerpt: "Analyse des retombées économiques et des accords institutionnels garantissant la viabilisation de 12 000 hectares dans le Grand Abidjan.", category: "Investissements", slug: "akwaba-city-etape-decisive", image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80", date: "15 Mars 2026" },
      { id: "2", title: "Tribune : Pourquoi la maîtrise des risques fonciers est le levier clé de l'Afrique", excerpt: "Touré Ahmed Bouah détaille dans une tribune exclusive comment sécuriser les capitaux privés face aux défis de l'urbanisation rapide.", category: "Tribune & Idées", slug: "maitrise-des-risques-fonciers", image_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80", date: "28 Février 2026" },
      { id: "3", title: "Développement territorial : Nouveau protocole d'accord avec les communautés villageoises", excerpt: "Un modèle pionnier de cohésion sociale et de redistribution assurant une paix foncière pérenne pour les chantiers d'envergure.", category: "Actualités", slug: "protocole-accord-communautes", image_url: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1000&q=80", date: "20 Janvier 2026" },
    ];
  }

  return (
    <div style={{ background: "var(--paper)", minHeight: "100vh" }}>
      {/* Header — Navy */}
      <section style={{ background: "var(--navy)", color: "#fff", padding: "clamp(80px, 10vw, 120px) 0 clamp(60px, 8vw, 100px)" }}>
        <div className="container-x">
          <p className="eyebrow">Publications &amp; Presse</p>
          <h1 style={{ color: "#fff", lineHeight: 0.9, maxWidth: 640, marginBottom: 24 }}>
            Actualités &amp;<br /><em>Blog Officiel</em>
          </h1>
          <p style={{ color: "rgba(203,211,216,0.85)", maxWidth: 520, fontSize: "17px", lineHeight: 1.75 }}>
            Retrouvez les dernières annonces de <strong style={{ color: "#fff" }}>SOPHIA S.A.</strong>, les points d&apos;étape sur la Ville Nouvelle <strong style={{ color: "#fff" }}>Akwaba City</strong> et les réflexions personnelles de Touré Ahmed Bouah.
          </p>
        </div>
      </section>

      {/* Articles */}
      <section style={{ background: "var(--paper)", padding: "clamp(60px, 8vw, 100px) 0" }}>
        <div className="container-x">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 360px), 1fr))",
              borderTop: "1px solid var(--border)",
            }}
          >
            {news.map((a: any) => (
              <article
                key={a.id}
                style={{
                  borderBottom: "1px solid var(--border)",
                  borderRight: "1px solid var(--border)",
                  padding: "36px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                {a.image_url && (
                  <div style={{ overflow: "hidden", aspectRatio: "16/9", marginBottom: 8 }}>
                    <img
                      src={a.image_url}
                      alt={a.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        filter: "saturate(0.7)",
                        transition: "transform 0.4s ease",
                      }}
                    />
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    style={{
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      fontSize: "9px",
                      fontWeight: 700,
                      color: "var(--gold)",
                    }}
                  >
                    {a.category || "Actualité"}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--muted)",
                      fontFamily: "ui-monospace, monospace",
                    }}
                  >
                    {a.date || (a.created_at ? new Date(a.created_at).toLocaleDateString("fr-FR") : "")}
                  </span>
                </div>

                <h2
                  style={{
                    fontFamily: "Georgia, serif",
                    fontSize: "clamp(18px, 2vw, 22px)",
                    letterSpacing: "-0.025em",
                    lineHeight: 1.3,
                    margin: 0,
                  }}
                >
                  <Link
                    href={`/actualites/${a.slug || a.id}`}
                    style={{ color: "var(--ink)", textDecoration: "none" }}
                    className="hover:text-gold"
                  >
                    {a.title}
                  </Link>
                </h2>

                {a.excerpt && (
                  <p style={{ fontSize: "14px", lineHeight: 1.75, margin: 0, color: "var(--muted)" }}>
                    {a.excerpt}
                  </p>
                )}

                <Link
                  href={`/actualites/${a.slug || a.id}`}
                  className="text-link"
                  style={{ marginTop: "auto", fontSize: "10px" }}
                >
                  Lire l&apos;article ↗
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

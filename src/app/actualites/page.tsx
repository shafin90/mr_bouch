/* eslint-disable */
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getPublishedPageContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Actualités & Blog — Touré Ahmed Bouah",
  description: "Actualités, prises de parole et tribunes de Touré Ahmed Bouah, Président de SOPHIA S.A.",
};

export default async function ActualitesPage() {
  const content = await getPublishedPageContent("news");
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

  return (
    <div style={{ background: "var(--paper)", minHeight: "100vh" }}>
      {/* Header — Navy */}
      <section style={{ background: "var(--navy)", color: "#fff", padding: "clamp(80px, 10vw, 120px) 0 clamp(60px, 8vw, 100px)" }}>
        <div className="container-x">
          <p className="eyebrow">{content.eyebrow}</p>
          <h1 style={{ color: "#fff", lineHeight: 0.9, maxWidth: 640, marginBottom: 24 }}>
            {content.title}
          </h1>
          <p style={{ color: "rgba(203,211,216,0.85)", maxWidth: 520, fontSize: "17px", lineHeight: 1.75 }}>
            {content.intro}
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
            {news.length === 0 && <p style={{ padding: 36 }}>{content.empty}</p>}
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
                    {a.date || (a.created_at ? new Date(a.created_at).toLocaleDateString("en-GB") : "")}
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
                  {content.readMore} ↗
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

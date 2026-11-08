import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { getPublishedPageContent } from "@/lib/site-content";
import { createClient } from "@/lib/supabase/server";

export async function NewsSection() {
  const content = await getPublishedPageContent("home");
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

  return (
    <section style={{ background: "var(--paper)", padding: "clamp(70px, 9vw, 110px) 0" }}>
      <div className="container-x">
        {/* Header with Unified Left-Aligned Reading Focus */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 52, flexWrap: "wrap", gap: 20 }}>
          <div>
            <Reveal>
              <p className="eyebrow-dark">
                <span className="section-marker">05</span> {content.newsEyebrow.replace(/^05\s*/, "")}
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 style={{ maxWidth: 640, whiteSpace: "pre-line" }}>
                {content.newsTitle}
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <Link href="/actualites" className="text-link">
              {content.newsCta} ↗
            </Link>
          </Reveal>
        </div>

        {/* 3 Articles Grid in Bola Ranson Minimal Bordered Style */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: "24px" }}>
          {articles.length === 0 && <p>{content.newsEmpty}</p>}
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
                      {item.date || (item.created_at ? new Date(item.created_at).toLocaleDateString("en-GB") : "")}
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

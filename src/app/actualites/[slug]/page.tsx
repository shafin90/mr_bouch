import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { ViewTracker } from "@/components/news/ViewTracker";
import "@/components/editor/editor.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: article } = await supabase
    .from("news")
    .select("title, excerpt")
    .eq("slug", slug)
    .single();

  if (!article) {
    return {
      title: "Article introuvable — Touré Ahmed Bouah",
    };
  }

  return {
    title: `${article.title} — Touré Ahmed Bouah`,
    description: article.excerpt || "Actualité de Touré Ahmed Bouah",
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: article } = await supabase
    .from("news")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!article) {
    return (
      <section style={{ background: "var(--paper)", padding: "120px 0", minHeight: "80vh" }}>
        <div className="container-x" style={{ maxWidth: 760, textAlign: "center" }}>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "38px", color: "var(--ink)", marginBottom: 16 }}>Article introuvable</h1>
          <p style={{ color: "var(--muted)", marginBottom: 32 }}>Cet article n&apos;existe pas ou n&apos;est plus accessible.</p>
          <Link
            href="/actualites"
            className="btn-primary"
          >
            ← Retour aux actualités
          </Link>
        </div>
      </section>
    );
  }

  const plainText = (article.content || "").replace(/<[^>]+>/g, " ");
  const wordsCount = plainText.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordsCount / 200));

  return (
    <article style={{ background: "var(--paper)", padding: "clamp(60px, 8vw, 100px) 0", minHeight: "100vh" }}>
      <div className="container-x" style={{ maxWidth: 840 }}>
        {/* Navigation back */}
        <Link
          href="/actualites"
          className="text-link"
          style={{ fontSize: "11px", marginBottom: 36, display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <ArrowLeft className="h-3 w-3" /> Toutes les actualités
        </Link>

        {/* Header section */}
        <header style={{ marginTop: 24, marginBottom: 40, borderBottom: "1px solid var(--border)", paddingBottom: 32 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
            {article.category && (
              <span style={{ fontWeight: 700, color: "var(--gold)" }}>
                {article.category}
              </span>
            )}
            <span>•</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Calendar className="h-3 w-3 text-[var(--gold)]" />
              {article.date || (article.created_at ? new Date(article.created_at).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" }) : "")}
            </span>
            <span>•</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Clock className="h-3 w-3 text-[var(--gold)]" />
              ~{readingTime} min de lecture
            </span>
            <span>•</span>
            <ViewTracker slug={slug} />
          </div>

          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(32px, 4vw, 52px)", lineHeight: 1.1, color: "var(--ink)", letterSpacing: "-0.03em", marginBottom: 20 }}>
            {article.title}
          </h1>

          {article.excerpt && (
            <p style={{ fontSize: "18px", lineHeight: 1.7, color: "var(--muted)", fontFamily: "Georgia, serif", fontStyle: "italic", margin: 0 }}>
              {article.excerpt}
            </p>
          )}
        </header>

        {/* Featured Image */}
        {article.image_url && (
          <div style={{ overflow: "hidden", aspectRatio: "16/9", marginBottom: 48, border: "1px solid var(--border)" }}>
            <img
              src={article.image_url}
              alt={article.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.75)" }}
            />
          </div>
        )}

        {/* Content */}
        <div
          className="tiptap-content"
          style={{ fontSize: "16px", lineHeight: 1.85, color: "var(--ink)" }}
          dangerouslySetInnerHTML={{ __html: article.content || "" }}
        />

        {/* Footer of article */}
        <div style={{ marginTop: 64, paddingTop: 32, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <Link
            href="/actualites"
            className="text-link"
          >
            ← Retour aux actualités
          </Link>
          <Link
            href="/rendez-vous"
            className="btn-primary"
          >
            Prendre contact ↗
          </Link>
        </div>
      </div>
    </article>
  );
}

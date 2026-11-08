import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Reveal } from "@/components/ui/Reveal";
import { getPublishedPageContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Livres & essais — Touré Ahmed Bouah",
  description: "Découvrez les livres et essais de Touré Ahmed Bouah.",
};

export const dynamic = "force-dynamic";

export default async function PublicationsPage() {
  const content = await getPublishedPageContent("publications");
  const supabase = await createClient();
  const { data, error } = await supabase.from("books").select("id,title,brief,category,image_url,created_at")
    .eq("status", "published").order("created_at", { ascending: false });
  if (error) console.error("Publications query failed:", error.message);
  const books = data ?? [];

  return (
    <main style={{ background: "var(--paper)", minHeight: "100vh" }}>
      <section style={{ background: "var(--navy)", color: "#fff", padding: "clamp(70px, 9vw, 110px) 0" }}>
        <div className="container-x">
          <Reveal><p className="eyebrow"><span>✦</span> {content.eyebrow}</p></Reveal>
          <Reveal delay={0.1}><h1 style={{ color: "#fff", maxWidth: 740, margin: "16px 0 18px" }}>{content.title}</h1></Reveal>
          <Reveal delay={0.2}><p style={{ color: "rgba(220,228,235,.8)", maxWidth: 580 }}>{content.intro}</p></Reveal>
        </div>
      </section>
      <section className="container-x" style={{ padding: "clamp(48px, 7vw, 80px) clamp(1.25rem, 5vw, 3.5rem) 100px" }}>
        {books.length === 0 ? (
          <div style={{ background: "#fff", border: "1px solid var(--border-light)", padding: 48, textAlign: "center" }}>
            <BookOpen size={34} color="var(--gold)" strokeWidth={1.3} style={{ margin: "0 auto 16px" }} />
            <h2 style={{ fontSize: 26, marginBottom: 8 }}>{content.emptyTitle}</h2>
            <p style={{ margin: 0 }}>{content.emptyBody}</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,220px),260px))", justifyContent: "start", gap: 18 }}>
            {books.map((book, index) => (
              <Reveal key={book.id} delay={Math.min(index * 0.05, 0.25)}>
                <article style={{ height: "100%", overflow: "hidden", background: "#fff", border: "1px solid var(--border-light)" }}>
                  <div style={{ aspectRatio: "4/3", background: "var(--cream-soft)", display: "grid", placeItems: "center", overflow: "hidden" }}>
                    {book.image_url ? <img src={book.image_url} alt={`Couverture de ${book.title}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <BookOpen size={46} color="var(--gold)" strokeWidth={1.2} />}
                  </div>
                  <div style={{ padding: 18 }}>
                    <span style={{ color: "var(--gold)", fontSize: 10, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase" }}>{book.category}</span>
                    <h2 style={{ color: "var(--navy)", fontSize: 20, margin: "8px 0 10px" }}>{book.title}</h2>
                    {book.brief && <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65 }}>{book.brief}</p>}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

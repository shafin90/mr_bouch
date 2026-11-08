import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Reveal } from "@/components/ui/Reveal";
import { getPublishedPageContent } from "@/lib/site-content";
import { PublicationCards } from "@/components/home/PublicationCards";

export async function PublicationsSection() {
  const content = await getPublishedPageContent("home");
  const supabase = await createClient();
  const { data, error } = await supabase.from("books").select("id,title,brief,category,image_url,created_at")
    .eq("status", "published").order("created_at", { ascending: false }).limit(3);
  if (error) console.error("Homepage publications query failed:", error.message);
  const books = data ?? [];

  return (
    <section style={{ background: "var(--cream)", padding: "clamp(70px, 9vw, 110px) 0" }}>
      <div className="container-x">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 20, flexWrap: "wrap", marginBottom: 42 }}>
          <div>
            <Reveal><p className="eyebrow-dark"><span className="section-marker">04</span> {content.booksEyebrow.replace(/^04\s*/, "")}</p></Reveal>
            <Reveal delay={0.1}><h2 style={{ maxWidth: 640, marginTop: 10, whiteSpace: "pre-line" }}>{content.booksTitle}</h2></Reveal>
          </div>
          <Reveal delay={0.2}><Link href="/publications" className="text-link">{content.booksCta} <ArrowUpRight size={14} /></Link></Reveal>
        </div>

        {books.length === 0 ? (
          <div style={{ borderTop: "1px solid var(--border)", padding: "28px 0", display: "flex", alignItems: "center", gap: 14, color: "var(--muted)" }}>
            <BookOpen size={22} color="var(--gold)" strokeWidth={1.5} />
            <p style={{ margin: 0, fontSize: 14 }}>{content.booksEmpty}</p>
          </div>
        ) : (
          <PublicationCards books={books} />
        )}
      </div>
    </section>
  );
}

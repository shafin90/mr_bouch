import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/data/types";

export function NewsCard({ article }: { article: Article }) {
  return (
    <article className="group flex flex-col overflow-hidden border border-border bg-ivory shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={article.image.src}
          alt={article.image.alt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-navy">
          <span>{article.category}</span>
          <span className="h-px w-6 bg-border" />
          <span className="text-slate">{article.date}</span>
        </div>
        <h3 className="mt-4 font-display text-xl leading-snug text-navy">
          {article.title}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-slate">
          {article.excerpt}
        </p>
        <Link
          href={`/actualites`}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-navy transition-colors hover:text-navy"
        >
          Lire la suite
          <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );
}

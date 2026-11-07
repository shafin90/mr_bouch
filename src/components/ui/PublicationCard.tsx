import Image from "next/image";
import type { Publication } from "@/data/types";

export function PublicationCard({ publication }: { publication: Publication }) {
  return (
    <article className="group flex gap-6 border border-border bg-ivory p-6 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="relative w-2/5 shrink-0 overflow-hidden bg-stone">
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={publication.cover.src}
            alt={publication.cover.alt}
            fill
            sizes="(max-width: 768px) 50vw, 30vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-navy">
          {publication.date}
        </p>
        <h3 className="mt-2 font-display text-2xl leading-snug text-navy">
          {publication.title}
        </h3>
        <p className="mt-3 text-base leading-relaxed text-slate">
          {publication.description}
        </p>
        {publication.placeholder ? (
          <p className="mt-3 text-xs italic text-slate/70">
            Publication illustrative (placeholder) — contenu à compléter avec des informations vérifiées. Publication illustrative (placeholder) — contenu à compléter avec des informations vérifiées. Publication illustrative (placeholder) — contenu à compléter avec des informations vérifiées.
          </p>
        ) : null}
      </div>
    </article>
  );
}

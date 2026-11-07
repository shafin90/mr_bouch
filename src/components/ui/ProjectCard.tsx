import Image from "next/image";
import type { Project } from "@/data/types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group flex flex-col bg-ivory">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={project.image.src}
          alt={project.image.alt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-navy">
          {project.scope}
        </p>
        <h3 className="mt-3 font-display text-xl leading-snug text-navy">
          {project.name}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-slate">
          {project.overview}
        </p>
        <p className="mt-4 text-xs text-slate">
          Statut : {project.status}
        </p>
        {project.placeholder ? (
          <p className="mt-2 text-[11px] italic text-slate/70">
            Projet illustratif (placeholder)
          </p>
        ) : null}
      </div>
    </article>
  );
}

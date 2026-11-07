import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { projects } from "@/data/projects";

export function ProjectsSection() {
  return (
    <section className="bg-ivory py-60 md:py-60">
      <div className="container-x">
        <SectionHeading
          eyebrow="Réalisations"
          title="Des initiatives pensées pour produire un impact durable."
          description="Chaque projet traduit une ambition : répondre à des besoins concrets et participer à la construction d'un environnement plus structuré et plus durable."
        />
        <p className="mt-4 text-sm italic text-slate/70">
          Les projets présentés ci-dessous sont des illustrations (placeholders) et ne constituent pas des réalisations confirmées.
        </p>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {projects.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.08}>
              <ProjectCard project={p} />
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.3}>
          <div className="mt-12">
            <PrimaryButton href="/entrepreneuriat">Explorer les réalisations</PrimaryButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

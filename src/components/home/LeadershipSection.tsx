import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

const milestones = [
  { n: "01", title: "Formation", text: "Gestion des risques · France" },
  { n: "02", title: "Début de carrière", text: "Sécurité aéroportuaire · Enseignement supérieur" },
  { n: "03", title: "Entrepreneuriat", text: "SOPHIA · Développement urbain · 2004" },
  { n: "04", title: "Publications", text: "49 ouvrages publiés · Rapporté en 2026" },
];

export function LeadershipSection() {
  return (
    <section className="flex min-h-[calc(100vh-5rem)] items-center bg-ivory py-24 md:py-24">
      <div className="container-x w-full">
        <div className="max-w-3xl">
          <SectionHeading
            eyebrow="01 — Mon parcours"
            title="Une expérience qui façonne une vision."
            description="Un parcours entre expertise technique, entrepreneuriat et développement africain."
          />
        </div>
        <div className="mt-16 grid gap-12 md:grid-cols-2 md:gap-16">
          {milestones.map((m, i) => (
            <Reveal key={m.n} delay={i * 0.06}>
              <div className="border-t border-border pt-8">
                <span className="font-display text-5xl text-bronze">{m.n}</span>
                <h3 className="mt-4 font-display text-2xl text-navy">{m.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate">{m.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.3}>
          <div className="mt-16">
            <PrimaryButton href="/biographie">Découvrir ma biographie</PrimaryButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

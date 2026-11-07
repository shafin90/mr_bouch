import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const items = [
  { title: "Partenariats institutionnels", text: "Favoriser des collaborations fondées sur la confiance et une vision commune." },
  { title: "Coopération public-privé", text: "Rapprocher les acteurs publics et privés autour de projets structurants." },
  { title: "Dialogue stratégique", text: "Instaurer un échange durable entre décideurs et partenaires." },
];

export function InstitutionalSection() {
  return (
    <section className="bg-ivory py-60 md:py-60">
      <div className="container-x grid gap-16 md:grid-cols-12">
        <div className="md:col-span-6">
          <Reveal>
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <Image
                src="https://picsum.photos/seed/institutional/1200/900"
                alt="Relations institutionnelles"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
        <div className="md:col-span-6">
          <SectionHeading
            eyebrow="Relations institutionnelles"
            title="Construire des relations fondées sur la confiance et une vision commune."
            description="Les transformations durables reposent sur le dialogue, la coopération et la convergence des compétences entre les acteurs publics et privés."
          />
          <div className="mt-10 space-y-6">
            {items.map((it, i) => (
              <Reveal key={it.title} delay={0.1 + i * 0.06}>
                <div className="border-t border-border pt-5">
                  <h3 className="font-display text-xl text-navy">{it.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate">{it.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

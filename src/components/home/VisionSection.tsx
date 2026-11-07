import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

const highlights = [
  { title: "Éducation et sensibilisation", text: "Promouvoir l'accès au savoir et la transmission des valeurs." },
  { title: "Développement communautaire", text: "Soutenir des initiatives locales à impact durable." },
  { title: "Solidarité et inclusion", text: "Œuvrer pour une société plus juste et plus inclusive." },
];

export function VisionSection() {
  return (
    <section className="bg-ivory py-60 md:py-60">
      <div className="container-x grid gap-16 md:grid-cols-12">
        <div className="md:col-span-6">
          <SectionHeading
            eyebrow="Engagement"
            title="Le développement prend tout son sens lorsqu'il bénéficie à tous."
            description="Mon engagement social repose sur une conviction : le progrès économique doit s'accompagner d'opportunités, d'éducation et d'amélioration des conditions de vie."
          />
          <Reveal delay={0.1}>
            <p className="mt-8 text-base leading-relaxed text-slate">
              À travers la Fondation Solidarité &amp; Développement, je porte
              des actions au service de l&apos;éducation, de la solidarité et du
              développement communautaire.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {highlights.map((h, i) => (
              <Reveal key={h.title} delay={0.15 + i * 0.05}>
                <div className="border-t border-border pt-5">
                  <h3 className="font-display text-lg text-navy">{h.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate">{h.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.3}>
            <div className="mt-12">
              <PrimaryButton href="/engagements">Découvrir mes engagements</PrimaryButton>
            </div>
          </Reveal>
        </div>
        <div className="md:col-span-6">
          <Reveal>
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <Image
                src="/images/fondation.jpg"
                alt="Engagement social"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

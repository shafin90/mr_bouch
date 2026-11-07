import { PrimaryButton } from "@/components/ui/PrimaryButton";

interface UnderConstructionPageProps {
  eyebrow: string;
  title: string;
}

export function UnderConstructionPage({ eyebrow, title }: UnderConstructionPageProps) {
  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-ivory px-6 py-60">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-bronze">
          {eyebrow}
        </p>
        <h1 className="mt-6 font-display text-4xl leading-tight text-navy md:text-6xl">
          {title}
        </h1>
        <p className="mt-6 text-base leading-relaxed text-slate md:text-lg">
          Cette page est actuellement en cours de développement.
        </p>
        <div className="mt-10 flex justify-center">
          <PrimaryButton href="/">Retour à l&apos;accueil</PrimaryButton>
        </div>
      </div>
    </section>
  );
}

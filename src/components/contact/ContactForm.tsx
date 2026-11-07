"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type InquiryType = "business" | "institutional" | "general";

const labels: Record<InquiryType, string> = {
  business: "Demande professionnelle",
  institutional: "Demande institutionnelle",
  general: "Contact général",
};

export function ContactForm({ defaultType = "general" }: { defaultType?: InquiryType }) {
  const params = useSearchParams();
  const initial = (params.get("type") as InquiryType) || defaultType;
  const [type, setType] = useState<InquiryType>(initial);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(form: FormData) {
    const next: Record<string, string> = {};
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    if (!name) next.name = "Le nom est requis.";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Un email valide est requis.";
    if (!message) next.message = "Le message est requis.";
    return next;
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      // FUTURE BACKEND INTEGRATION:
      // This form will eventually submit inquiries to the backend
      // and trigger email notifications.
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className="border border-ivory/10 bg-charcoal p-8">
        <h2 className="font-heading text-3xl text-ivory">Merci pour votre message.</h2>
        <p className="mt-4 text-sm leading-relaxed text-ivory/70">
          Ceci est une démonstration côté client. Aucune donnée n’a été envoyée. L’intégration
          backend sera ajoutée ultérieurement.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-6 text-sm font-medium text-burgundy underline-offset-4 hover:underline"
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(labels) as InquiryType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={cn(
              "border px-4 py-2 text-sm transition-colors",
              type === t
                ? "border-burgundy bg-burgundy text-ivory"
                : "border-ivory/20 text-ivory hover:border-burgundy"
            )}
          >
            {labels[t]}
          </button>
        ))}
      </div>

      <input type="hidden" name="type" value={type} />

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-ivory">
          Nom
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="mt-2 w-full border border-ivory/20 bg-charcoal px-4 py-3 text-sm outline-none focus:border-burgundy"
        />
        {errors.name ? <p className="mt-1 text-xs text-burgundy">{errors.name}</p> : null}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-ivory">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-2 w-full border border-ivory/20 bg-charcoal px-4 py-3 text-sm outline-none focus:border-burgundy"
        />
        {errors.email ? <p className="mt-1 text-xs text-burgundy">{errors.email}</p> : null}
      </div>

      <div>
        <label htmlFor="organization" className="block text-sm font-medium text-ivory">
          Organisation (optionnel)
        </label>
        <input
          id="organization"
          name="organization"
          type="text"
          className="mt-2 w-full border border-ivory/20 bg-charcoal px-4 py-3 text-sm outline-none focus:border-burgundy"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-ivory">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          className="mt-2 w-full border border-ivory/20 bg-charcoal px-4 py-3 text-sm outline-none focus:border-burgundy"
        />
        {errors.message ? <p className="mt-1 text-xs text-burgundy">{errors.message}</p> : null}
      </div>

      <button
        type="submit"
        className="inline-flex h-12 items-center justify-center bg-burgundy px-8 text-sm font-medium text-ivory transition-colors hover:bg-charcoal"
      >
        Envoyer
      </button>
    </form>
  );
}


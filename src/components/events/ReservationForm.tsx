"use client";

import { useState } from "react";

export function ReservationForm({ eventId, maxSeats = 4 }: { eventId: string; maxSeats?: number }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [code, setCode] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [seats, setSeats] = useState(1);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/events/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          fullName,
          email,
          phone,
          seats,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la réservation");
      }

      setStatus("success");
      setCode(data.confirmationCode || "CONFIRMÉ");
      setEmailSent(!!data.emailSent);
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Une erreur est survenue.");
    }
  }

  return (
    <div>
      {status === "success" ? (
        <div className="border border-emerald-200 bg-emerald-50/60 p-6 text-emerald-950 rounded-lg">
          <h3 className="font-display text-2xl text-navy">Votre réservation est confirmée !</h3>
          <p className="mt-2 text-sm text-slate">
            Merci pour votre démarche. Votre place a été enregistrée auprès de l'organisation.
          </p>
          <div className="mt-4 rounded border border-emerald-300 bg-white p-3 text-center">
            <span className="block text-xs uppercase tracking-wider text-slate">Code de réservation</span>
            <span className="font-mono text-lg font-bold tracking-widest text-navy">{code}</span>
          </div>
          {emailSent ? (
            <p className="mt-3 text-xs text-emerald-800">
              ✉️ Un courriel de confirmation officiel a été envoyé à <strong>{email}</strong>.
            </p>
          ) : (
            <p className="mt-3 text-xs text-slate">
              ℹ️ Un courriel récapitulatif vous sera adressé dès validation par le cabinet.
            </p>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-navy mb-1">
              Nom complet *
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Ex : Kouamé Jean-Marc"
              className="w-full rounded border border-border bg-white px-3.5 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-navy focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-navy mb-1">
              Adresse e-mail *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="votre.email@domaine.com"
              className="w-full rounded border border-border bg-white px-3.5 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-navy focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-navy mb-1">
              Téléphone / WhatsApp
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+225 07 00 00 00 00"
              className="w-full rounded border border-border bg-white px-3.5 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-navy focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-navy mb-1">
              Nombre de place(s)
            </label>
            <select
              value={seats}
              onChange={(e) => setSeats(Number(e.target.value))}
              className="w-full rounded border border-border bg-white px-3.5 py-2.5 text-sm text-navy focus:border-navy focus:outline-none"
            >
              {Array.from({ length: maxSeats }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} {n > 1 ? "places" : "place"}
                </option>
              ))}
            </select>
          </div>

          <p className="text-[11px] text-slate leading-relaxed">
            En validant ce formulaire, vos données sont transmises au secrétariat de Touré Ahmed Bouah pour confirmation et prise en charge.
          </p>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-navy py-3 text-xs font-semibold uppercase tracking-widest text-ivory transition hover:bg-navy-deep disabled:opacity-50"
          >
            {status === "loading" ? "Confirmation en cours..." : "Confirmer ma réservation"}
          </button>

          {message && <p className="text-xs text-red-600">{message}</p>}
        </form>
      )}
    </div>
  );
}

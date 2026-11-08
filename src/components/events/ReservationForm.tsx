"use client";

import { useState } from "react";

export function ReservationForm({ eventId, maxSeats = 4, copy }: { eventId: string; maxSeats?: number; copy: Record<string, string> }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [code, setCode] = useState("");
  const [seatNumbers, setSeatNumbers] = useState<number[]>([]);
  const [emailSent, setEmailSent] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
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
          location,
          seats,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la réservation");
      }

      setStatus("success");
      setCode(data.confirmationCode || "CONFIRMÉ");
      setSeatNumbers(data.seatNumbers || []);
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
          <h3 className="font-display text-2xl text-navy">{copy.eventBookingTitle}</h3>
          <p className="mt-2 text-sm text-slate">
            {copy.eventBookingBody}
          </p>
          <div className="mt-4 rounded border border-emerald-300 bg-white p-3 text-center">
            <span className="block text-xs uppercase tracking-wider text-slate">{copy.codeLabel}</span>
            <span className="font-mono text-lg font-bold tracking-widest text-navy">{code}</span>
          </div>
          {seatNumbers.length > 0 && (
            <p className="mt-3 text-center text-sm text-navy">{copy.assignedSeatsLabel} : <strong>{seatNumbers.join(", ")}</strong></p>
          )}
          {emailSent ? (
            <p className="mt-3 text-xs text-emerald-800">
              ✉️ {copy.emailSentText} <strong>{email}</strong>.
            </p>
          ) : (
            <p className="mt-3 text-xs text-slate">
              ℹ️ {copy.emailPendingText}
            </p>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-navy mb-1">
              {copy.fullNameLabel}
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder={copy.fullNamePlaceholder}
              className="w-full rounded border border-border bg-white px-3.5 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-navy focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-navy mb-1">
              {copy.emailLabel}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={copy.emailPlaceholder}
              className="w-full rounded border border-border bg-white px-3.5 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-navy focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-navy mb-1">
              {copy.phoneLabel}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={copy.phonePlaceholder}
              className="w-full rounded border border-border bg-white px-3.5 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-navy focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-navy mb-1">
              {copy.locationLabel}
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              maxLength={120}
              placeholder={copy.locationPlaceholder}
              className="w-full rounded border border-border bg-white px-3.5 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-navy focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-navy mb-1">
              {copy.seatsLabel}
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
            {copy.privacyText}
          </p>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-navy py-3 text-xs font-semibold uppercase tracking-widest text-ivory transition hover:bg-navy-deep disabled:opacity-50"
          >
            {status === "loading" ? copy.loadingText : copy.eventBookingSubmit}
          </button>

          {message && <p className="text-xs text-red-600">{message}</p>}
        </form>
      )}
    </div>
  );
}

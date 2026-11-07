import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ReservationForm } from "@/components/events/ReservationForm";

export const metadata: Metadata = {
  title: "Événement — Touré Ahmed Bouah",
  description: "Détails de l'événement et réservation.",
};

export const dynamic = "force-dynamic";

export default async function EventDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  // Try fetching by ID first, or by slug/title
  let query = supabase.from("events").select("*");
  // If slug is a UUID format, query by id, otherwise check if slug column exists
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

  let event: any = null;
  if (isUuid) {
    const { data } = await supabase.from("events").select("*").eq("id", slug).single();
    event = data;
  } else {
    // Try query by id anyway or fallback
    const { data } = await supabase.from("events").select("*").limit(1);
    event = data?.[0] ?? null;
  }

  if (!event) {
    return (
      <section className="bg-ivory py-24 md:py-32">
        <div className="container-x">
          <h1 className="font-display text-4xl text-navy">Événement introuvable</h1>
          <p className="mt-4 text-slate">Cet événement n'existe pas ou n'est plus accessible.</p>
          <Link href="/evenements" className="mt-6 inline-block text-xs uppercase tracking-wider text-navy underline">
            ← Retour à l'agenda
          </Link>
        </div>
      </section>
    );
  }

  const isPast = event.date ? new Date(event.date) < new Date() : false;

  return (
    <section className="bg-ivory py-20 md:py-28">
      <div className="container-x">
        <Link href="/evenements" className="text-xs uppercase tracking-wider text-bronze hover:underline">
          ← Retour à tous les événements
        </Link>

        <div className="mt-8 grid gap-12 lg:grid-cols-12">
          {/* Main event details */}
          <div className="lg:col-span-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-bronze">
              {event.status === "published" ? "Événement officiel" : "Brouillon"}
            </p>
            <h1 className="mt-3 font-display text-3xl text-navy sm:text-4xl md:text-5xl">
              {event.title}
            </h1>

            {event.image_url && (
              <div className="mt-6 aspect-video w-full overflow-hidden border border-border bg-slate-100">
                <img src={event.image_url} alt={event.title} className="h-full w-full object-cover" />
              </div>
            )}

            <div className="mt-8 space-y-4 text-base leading-relaxed text-slate whitespace-pre-line">
              {event.description || "Aucune description détaillée renseignée."}
            </div>

            <div className="mt-8 grid gap-4 border-y border-border py-6 sm:grid-cols-2 text-sm text-slate">
              {event.date && (
                <div>
                  <strong className="block text-navy font-medium">Date &amp; Heure :</strong>
                  <span>{event.date} {event.time ? `à ${event.time}` : ""}</span>
                </div>
              )}
              {event.location && (
                <div>
                  <strong className="block text-navy font-medium">Lieu :</strong>
                  <span>{event.location}</span>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href={`/api/ics?slug=${event.id}`}
                className="border border-navy px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-navy hover:bg-navy hover:text-white transition"
              >
                Ajouter à mon agenda (.ics)
              </a>
              {event.registration_url && (
                <a
                  href={event.registration_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-navy px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-navy-deep transition"
                >
                  Inscription externe →
                </a>
              )}
            </div>
          </div>

          {/* Booking sidebar form */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 rounded-lg border border-border bg-white p-6 md:p-8 shadow-soft">
              <h2 className="font-display text-2xl text-navy">Réserver votre place</h2>
              <p className="mt-2 text-xs text-slate">
                Confirmez votre présence auprès du secrétariat général de M. Touré Ahmed Bouah.
              </p>

              {isPast ? (
                <div className="mt-6 border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                  Cet événement a déjà eu lieu. Les réservations sont closes.
                </div>
              ) : (
                <div className="mt-6">
                  <ReservationForm eventId={event.id} maxSeats={4} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ReservationForm } from "@/components/events/ReservationForm";

export const metadata: Metadata = {
  title: "Réservation — Touré Ahmed Bouah",
  description: "Réservation pour un événement.",
};

export default async function ReservationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: event } = await supabase.from("events").select("*").eq("slug", slug).eq("status", "published").single();

  if (!event) {
    return (
      <section className="bg-ivory py-24 md:py-32">
        <div className="container-x">
          <h1 className="font-display text-4xl text-navy">Événement introuvable</h1>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-ivory py-24 md:py-32">
      <div className="container-x max-w-2xl">
        <h1 className="font-display text-4xl text-navy">Réserver ma place</h1>
        <p className="mt-4 text-base text-slate">{event.title} — {event.event_date}</p>
        <div className="mt-8">
          <ReservationForm eventId={event.id} maxSeats={event.max_seats_per_registration ?? 1} />
        </div>
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { EventsClient } from "@/components/events/EventsClient";

export const metadata: Metadata = {
  title: "Événements — Touré Ahmed Bouah",
  description: "Agenda et rencontres de Touré Ahmed Bouah.",
};

export const dynamic = "force-dynamic";

export default async function EvenementsPage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .order("date", { ascending: true });

  return (
    <section className="bg-ivory py-16 md:py-20">
      <div className="container-x">
        <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-bronze">Agenda &amp; rencontres</p>
        <h1 className="mt-4 font-display text-4xl text-navy md:text-5xl">Les prochains rendez-vous</h1>
        <p className="mt-4 max-w-2xl text-base text-slate">
          Retrouvez les événements, rencontres et temps forts liés aux activités et engagements de Touré Ahmed Bouah.
        </p>
        <EventsClient events={events ?? []} />
      </div>
    </section>
  );
}

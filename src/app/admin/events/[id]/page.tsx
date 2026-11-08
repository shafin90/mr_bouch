"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, CalendarDays, Clock3, MapPin, Users } from "lucide-react";

type EventRecord = {
  id: string;
  title: string;
  description: string | null;
  date: string | null;
  time: string | null;
  location: string | null;
  image_url: string | null;
  status: string;
  capacity: number | null;
};

type Registration = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  location: string | null;
  number_of_seats: number | null;
  seat_numbers: number[] | null;
  confirmation_code: string | null;
  status: string | null;
  created_at: string;
};

export default function AdminEventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadDetails() {
      setLoading(true);
      setError("");
      const supabase = createClient();
      const [eventResult, registrationResult] = await Promise.all([
        supabase.from("events").select("id,title,description,date,time,location,image_url,status,capacity").eq("id", id).single(),
        supabase.from("event_registrations").select("id,full_name,email,phone,location,number_of_seats,seat_numbers,confirmation_code,status,created_at").eq("event_id", id).order("created_at", { ascending: false }),
      ]);
      if (!active) return;
      if (eventResult.error) setError(`Impossible de charger l’événement : ${eventResult.error.message}`);
      else setEvent(eventResult.data as EventRecord);
      if (registrationResult.error) setError(`Impossible de charger les réservations : ${registrationResult.error.message}`);
      else setRegistrations((registrationResult.data ?? []) as Registration[]);
      setLoading(false);
    }
    void loadDetails();
    return () => { active = false; };
  }, [id]);

  const confirmed = useMemo(() => registrations.filter((item) => item.status === "confirmed"), [registrations]);
  const bookedSeats = useMemo(() => {
    const seats = new Map<number, Registration>();
    confirmed.forEach((registration) => (registration.seat_numbers ?? []).forEach((seat) => seats.set(seat, registration)));
    return seats;
  }, [confirmed]);
  const bookedCount = useMemo(
    () => confirmed.reduce((total, item) => total + (item.seat_numbers?.length || item.number_of_seats || 0), 0),
    [confirmed],
  );
  const capacity = Math.max(0, Number(event?.capacity || 0));
  const gridSeatCount = Math.max(capacity, ...Array.from(bookedSeats.keys(), (seat) => seat));
  const openCount = Math.max(0, capacity - bookedCount);

  if (loading) return <div className="grid min-h-[40vh] place-items-center text-sm text-slate">Chargement des détails…</div>;
  if (!event) return <div className="space-y-4"><p className="text-sm text-red-700">{error || "Événement introuvable."}</p><Link href="/admin/events" className="text-sm font-medium text-bronze hover:underline">Retour aux événements</Link></div>;

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-12">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <Link href="/admin/events" className="inline-flex items-center gap-2 text-xs font-medium text-bronze hover:underline"><ArrowLeft size={14} /> Retour à la liste</Link>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[.2em] text-bronze">Dossier événement</p>
          <h1 className="mt-1 font-display text-3xl text-navy">{event.title}</h1>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate">
            {event.date && <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} />{event.date}</span>}
            {event.time && <span className="inline-flex items-center gap-1.5"><Clock3 size={14} />{event.time}</span>}
            {event.location && <span className="inline-flex items-center gap-1.5"><MapPin size={14} />{event.location}</span>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${event.status === "published" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>
            {event.status === "published" ? "Publié" : "Brouillon"}
          </span>
          <Link href={`/admin/events/new?edit=${encodeURIComponent(event.id)}`} className="rounded-md bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-deep">Modifier</Link>
        </div>
      </header>

      {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(260px,.7fr)]">
        <article className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
          {event.image_url && <img src={event.image_url} alt={event.title} className="max-h-[360px] w-full object-cover" />}
          <div className="p-5 sm:p-6">
            <h2 className="font-display text-xl text-navy">À propos de l’événement</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate">{event.description || "Aucune description ajoutée."}</p>
          </div>
        </article>

        <section className="rounded-xl border border-border bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-display text-xl text-navy">Réservations</h2>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border bg-paper p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-slate">Capacité</p><p className="mt-2 font-display text-3xl text-navy">{capacity || "—"}</p></div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-amber-900">Réservées</p><p className="mt-2 font-display text-3xl text-amber-950">{bookedCount}</p></div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-emerald-900">Ouvertes</p><p className="mt-2 font-display text-3xl text-emerald-950">{capacity ? openCount : "—"}</p></div>
            <div className="rounded-lg border border-border bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-slate">Participants</p><p className="mt-2 inline-flex items-center gap-2 font-display text-3xl text-navy"><Users size={20} />{confirmed.length}</p></div>
          </div>
          <p className="mt-4 text-xs leading-5 text-slate">La capacité définit le nombre total de sièges numérotés. Les nouvelles places sont attribuées automatiquement. Les réservations historiques sont numérotées dans l’ordre d’arrivée; leur ville / pays peut ne pas avoir été recueillie.</p>
          {capacity > 0 && bookedCount > capacity && <p className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-800">Le nombre de places déjà réservées dépasse la capacité définie. Augmentez la capacité de l’événement.</p>}
        </section>
      </section>

      <section className="rounded-xl border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><h2 className="font-display text-2xl text-navy">Plan des places</h2><p className="mt-1 text-xs text-slate">Chaque siège réservé est lié à son participant.</p></div>
          <div className="flex gap-4 text-xs"><span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded bg-red-700" />Réservée</span><span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded border border-emerald-500 bg-emerald-50" />Ouverte</span></div>
        </div>
        {!capacity ? (
          <p className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">Ajoutez une capacité dans la modification de l’événement pour afficher le plan des places.</p>
        ) : (
          <div className="mt-6 grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12">
            {Array.from({ length: gridSeatCount }, (_, index) => {
              const seatNumber = index + 1;
              const registration = bookedSeats.get(seatNumber);
              return (
                <div key={seatNumber} title={registration ? `Réservée par ${registration.full_name}` : `Place ${seatNumber} disponible`} className={`flex aspect-square flex-col items-center justify-center rounded-md border text-xs font-semibold ${registration ? "border-red-800 bg-red-700 text-white" : "border-emerald-300 bg-emerald-50 text-emerald-900"}`}>
                  <span>{seatNumber}</span>
                  {registration && <span className="max-w-full truncate px-1 text-[8px] font-normal">{registration.full_name}</span>}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <div className="border-b border-border px-5 py-4 sm:px-6"><h2 className="font-display text-2xl text-navy">Participants</h2><p className="mt-1 text-xs text-slate">Coordonnées et places attribuées à chaque réservation.</p></div>
        {registrations.length === 0 ? <p className="p-8 text-center text-sm text-slate">Aucune réservation pour le moment.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-paper text-[10px] uppercase tracking-wide text-slate"><tr><th className="px-5 py-3">Participant</th><th className="px-5 py-3">Ville / pays</th><th className="px-5 py-3">Places</th><th className="px-5 py-3">Code</th><th className="px-5 py-3">Date de réservation</th><th className="px-5 py-3">Statut</th></tr></thead>
              <tbody className="divide-y divide-border">
                {registrations.map((item) => <tr key={item.id} className="align-top">
                  <td className="px-5 py-4"><p className="font-semibold text-navy">{item.full_name}</p><p className="mt-1 text-xs text-slate">{item.email}</p>{item.phone && <p className="mt-1 text-xs text-slate">{item.phone}</p>}</td>
                  <td className="px-5 py-4 text-slate">{item.location || "Non renseignée"}</td>
                  <td className="px-5 py-4"><p className="font-semibold text-navy">{item.seat_numbers?.length || item.number_of_seats || 0} siège(s)</p><p className="mt-1 text-xs text-slate">{item.seat_numbers?.length ? item.seat_numbers.join(", ") : "Places historiques non numérotées"}</p></td>
                  <td className="px-5 py-4 font-mono text-xs text-navy">{item.confirmation_code || "—"}</td>
                  <td className="px-5 py-4 text-xs text-slate">{new Date(item.created_at).toLocaleString("en-GB")}</td>
                  <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${item.status === "confirmed" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>{item.status || "confirmed"}</span></td>
                </tr>)}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

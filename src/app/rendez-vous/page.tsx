import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Clock3, MapPin, ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Reveal } from "@/components/ui/Reveal";
import { MeetingRequestForm } from "@/components/forms/MeetingRequestForm";
import { getPublishedPageContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Événements & réservation — Touré Ahmed Bouah",
  description: "Réservez une place à un événement ou choisissez un créneau pour un échange individuel en visioconférence.",
};

export const dynamic = "force-dynamic";

function formatEventDate(date: string) {
  const parsed = new Date(`${date.slice(0, 10)}T12:00:00`);
  return {
    day: new Intl.DateTimeFormat("en-GB", { day: "2-digit" }).format(parsed),
    month: new Intl.DateTimeFormat("en-GB", { month: "short" }).format(parsed).replace(".", ""),
    full: new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(parsed),
  };
}

export default async function RendezVousPage() {
  const content = await getPublishedPageContent("appointments");
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("id,title,description,date,time,location,image_url,status")
    .eq("status", "published")
    .order("date", { ascending: true });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const events = (data ?? []).filter((event) => event.date && new Date(`${event.date.slice(0, 10)}T23:59:59`) >= today);

  return (
    <main style={{ background: "var(--paper)", minHeight: "100vh" }}>
      <section style={{ background: "var(--navy)", color: "#fff", padding: "clamp(64px, 9vw, 108px) 0 112px" }}>
        <div className="container-x">
          <Reveal>
            <p className="eyebrow"><span>✦</span> {content.eyebrow}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 style={{ color: "#fff", maxWidth: 760, margin: "18px 0 20px" }}>
              {content.title}
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p style={{ color: "rgba(220,228,235,.82)", maxWidth: 560, fontSize: 16 }}>
              {content.intro}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-x" style={{ padding: "0 clamp(1.25rem, 5vw, 3.5rem) 96px", marginTop: -48 }}>
        {events.length === 0 ? (
          <div style={{ background: "#fff", border: "1px solid var(--border)", borderTop: "3px solid var(--gold)", padding: "clamp(28px, 5vw, 56px)", textAlign: "center" }}>
            <CalendarDays size={30} strokeWidth={1.4} color="var(--gold)" style={{ margin: "0 auto 16px" }} />
            <h2 style={{ fontSize: 28, marginBottom: 10 }}>{content.emptyTitle}</h2>
            <p style={{ margin: "0 auto", maxWidth: 480 }}>{content.emptyBody}</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 22 }}>
            {events.map((event, index) => {
              const date = formatEventDate(event.date!);
              const bookingHref = `/evenements/${event.id}`;
              return (
                <Reveal key={event.id} delay={Math.min(index * 0.06, 0.24)}>
                  <article style={{ display: "grid", gridTemplateColumns: "150px minmax(0,1fr) auto", gap: "clamp(20px, 4vw, 42px)", alignItems: "center", background: "#fff", border: "1px solid var(--border-light)", borderLeft: "3px solid var(--gold)", padding: "clamp(22px, 4vw, 36px)" }} className="event-listing-card">
                    <div style={{ textAlign: "center", borderRight: "1px solid var(--border-light)", paddingRight: 24 }}>
                      <span style={{ display: "block", color: "var(--gold)", fontSize: 12, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase" }}>{date.month}</span>
                      <span style={{ display: "block", color: "var(--navy)", font: "400 52px/.98 Georgia,serif" }}>{date.day}</span>
                      <span style={{ display: "block", marginTop: 8, color: "var(--muted)", fontSize: 11 }}>{new Date(`${event.date!.slice(0, 10)}T12:00:00`).getFullYear()}</span>
                    </div>
                    <div>
                      <p style={{ margin: "0 0 8px", color: "var(--gold)", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" }}>{content.eventEyebrow}</p>
                      <h2 style={{ fontSize: "clamp(23px, 3vw, 32px)", marginBottom: 10 }}>{event.title}</h2>
                      {event.description && <p style={{ margin: "0 0 16px", fontSize: 14 }}>{event.description}</p>}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 22px", color: "var(--muted)", fontSize: 13 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><CalendarDays size={15} />{date.full}</span>
                        {event.time && <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><Clock3 size={15} />{event.time}</span>}
                        {event.location && <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><MapPin size={15} />{event.location}</span>}
                      </div>
                    </div>
                    <Link href={bookingHref} className="btn-primary event-book-button">{content.eventCta} <ArrowUpRight size={15} /></Link>
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>

      <section id="session-individuelle" style={{ background: "var(--cream)", padding: "clamp(64px, 8vw, 100px) 0" }}>
        <div className="container-x">
          <div style={{ maxWidth: 720, marginBottom: 34 }}>
            <Reveal>
              <p className="eyebrow-dark">{content.meetingEyebrow}</p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 style={{ margin: "14px 0 12px" }}>{content.meetingTitle}</h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p>{content.meetingIntro}</p>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <MeetingRequestForm copy={content} />
          </Reveal>
        </div>
      </section>
      <style>{`
        @media (max-width: 760px) {
          .event-listing-card { grid-template-columns: 72px minmax(0,1fr) !important; }
          .event-listing-card > div:first-child { padding-right: 12px !important; }
          .event-listing-card > div:first-child span:nth-child(2) { font-size: 38px !important; }
          .event-book-button { grid-column: 1 / -1; justify-content: center; }
        }
      `}</style>
    </main>
  );
}

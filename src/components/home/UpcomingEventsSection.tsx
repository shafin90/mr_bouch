import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock3, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Reveal } from "@/components/ui/Reveal";
import { getPublishedPageContent } from "@/lib/site-content";

export async function UpcomingEventsSection() {
  const content = await getPublishedPageContent("home");
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("id,title,description,date,time,location,status")
    .eq("status", "published")
    .order("date", { ascending: true });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const events = (data ?? [])
    .filter((event) => event.date && new Date(`${event.date.slice(0, 10)}T23:59:59`) >= today)
    .slice(0, 3);

  return (
    <section style={{ background: "var(--navy)", color: "#fff", padding: "clamp(70px, 9vw, 110px) 0" }}>
      <div className="container-x">
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap", marginBottom: 40 }}>
          <div>
            <Reveal><p className="eyebrow"><span>✦</span> {content.eventsEyebrow}</p></Reveal>
            <Reveal delay={0.1}>
              <h2 style={{ color: "#fff", maxWidth: 640, marginTop: 12 }}>{content.eventsTitle}</h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p style={{ color: "rgba(220,228,235,.78)", marginTop: 14, maxWidth: 540 }}>
                {content.eventsBody}
              </p>
            </Reveal>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center" }}>
            <Link href="/rendez-vous#session-individuelle" className="text-link-light">Réserver une session individuelle ↗</Link>
            <Link href="/rendez-vous" className="text-link-light">Tous les événements ↗</Link>
          </div>
        </div>

        {events.length === 0 ? (
          <div style={{ border: "1px solid rgba(255,255,255,.16)", background: "rgba(255,255,255,.04)", padding: "28px clamp(22px,4vw,40px)" }}>
            <p style={{ color: "rgba(220,228,235,.8)", margin: 0 }}>{content.eventsEmpty}</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))", gap: 18 }}>
            {events.map((event, index) => {
              const parsedDate = new Date(`${event.date!.slice(0, 10)}T12:00:00`);
              const day = new Intl.DateTimeFormat("en-GB", { day: "2-digit" }).format(parsedDate);
              const month = new Intl.DateTimeFormat("en-GB", { month: "short" }).format(parsedDate).replace(".", "");
              const fullDate = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(parsedDate);
              return (
                <Reveal key={event.id} delay={index * 0.08}>
                  <article style={{ display: "grid", gridTemplateColumns: "72px minmax(0,1fr)", gap: 20, height: "100%", background: "#fff", color: "var(--ink)", borderTop: "2px solid var(--gold)", padding: "26px 24px" }}>
                    <div style={{ textAlign: "center", borderRight: "1px solid var(--border-light)", paddingRight: 14 }}>
                      <span style={{ display: "block", color: "var(--gold)", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" }}>{month}</span>
                      <span style={{ display: "block", color: "var(--navy)", font: "400 38px/.98 Georgia,serif" }}>{day}</span>
                      <span style={{ display: "block", color: "var(--muted)", fontSize: 10, marginTop: 7 }}>{parsedDate.getFullYear()}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                      <h3 style={{ color: "var(--navy)", fontSize: 21, marginBottom: 10 }}>{event.title}</h3>
                      {event.description && <p style={{ fontSize: 13, lineHeight: 1.6, margin: "0 0 14px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{event.description}</p>}
                      <div style={{ display: "grid", gap: 7, color: "var(--muted)", fontSize: 12, marginBottom: 20 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><CalendarDays size={14} />{fullDate}</span>
                        {event.time && <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><Clock3 size={14} />{event.time}</span>}
                        {event.location && <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><MapPin size={14} />{event.location}</span>}
                      </div>
                      <Link href={`/evenements/${event.id}`} className="btn-primary" style={{ marginTop: "auto" }}>Réserver une place <ArrowUpRight size={15} /></Link>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

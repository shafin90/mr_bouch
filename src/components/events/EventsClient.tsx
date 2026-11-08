"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

export type EventItem = {
  id: string;
  title: string;
  description: string | null;
  date: string | null;
  time: string | null;
  location: string | null;
  image_url: string | null;
  status: string;
  created_at?: string;
};

export function EventsClient({ events, content }: { events: EventItem[]; content: Record<string, string> }) {
  const [view, setView] = useState<"calendar" | "list">("list");
  const [filter, setFilter] = useState("all");
  const today = new Date();

  const filtered = useMemo(() => {
    const now = new Date();
    return events.filter((e) => {
      const d = e.date ? new Date(e.date) : null;
      if (filter === "upcoming") return d ? d >= now : true;
      if (filter === "past") return d ? d < now : false;
      return true;
    });
  }, [events, filter]);

  // Calendar
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const eventsByDate = useMemo(() => {
    const map: Record<string, EventItem[]> = {};
    filtered.forEach((e) => {
      if (e.date) {
        map[e.date] = map[e.date] || [];
        map[e.date].push(e);
      }
    });
    return map;
  }, [filtered]);

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {["all", "upcoming", "past"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs uppercase tracking-widest ${
                filter === f ? "bg-navy text-ivory" : "border border-border text-navy"
              }`}
            >
              {f === "all" ? content.filterAll : f === "upcoming" ? content.filterUpcoming : content.filterPast}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView("calendar")}
            className={`px-3 py-1.5 text-xs ${
              view === "calendar" ? "bg-navy text-ivory" : "border border-border"
            }`}
          >
            {content.calendarView}
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-3 py-1.5 text-xs ${
              view === "list" ? "bg-navy text-ivory" : "border border-border"
            }`}
          >
            {content.listView}
          </button>
        </div>
      </div>

      {view === "list" && (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.length === 0 ? (
            <div className="col-span-full border border-border bg-white p-8 text-center text-sm text-slate">
              {content.empty}
            </div>
          ) : (
            filtered.map((e) => (
              <div key={e.id} className="flex flex-col justify-between border border-border bg-white p-6 shadow-2xs">
                <div>
                  {e.image_url && (
                    <div className="mb-4 aspect-video w-full overflow-hidden border border-border bg-slate-100">
                      <img src={e.image_url} alt={e.title} className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-bronze">
                    {e.date && <span>📅 {e.date} {e.time ? `à ${e.time}` : ""}</span>}
                  </div>
                  <h3 className="mt-2 font-display text-xl text-navy">{e.title}</h3>
                  {e.description && (
                    <p className="mt-2 line-clamp-3 text-sm text-slate">{e.description}</p>
                  )}
                  {e.location && (
                    <p className="mt-3 text-xs text-slate">📍 {e.location}</p>
                  )}
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-4">
                  <Link
                    href={`/evenements/${e.id}`}
                    className="text-xs font-semibold uppercase tracking-wider text-navy underline hover:text-bronze"
                  >
                    {content.detailsCta} →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {view === "calendar" && (
        <div className="mt-8 bg-white border border-border p-6 shadow-2xs">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (month === 0) {
                  setMonth(11);
                  setYear(year - 1);
                } else setMonth(month - 1);
              }}
              className="px-3 py-1 text-navy border border-border"
            >
              ←
            </button>
            <p className="font-display text-xl text-navy capitalize">
              {new Date(year, month).toLocaleString("en-GB", {
                month: "long",
                year: "numeric",
              })}
            </p>
            <button
              onClick={() => {
                if (month === 11) {
                  setMonth(0);
                  setYear(year + 1);
                } else setMonth(month + 1);
              }}
              className="px-3 py-1 text-navy border border-border"
            >
              →
            </button>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-1">
            {[content.weekdaySun, content.weekdayMon, content.weekdayTue, content.weekdayWed, content.weekdayThu, content.weekdayFri, content.weekdaySat].map((d) => (
              <div key={d} className="text-center text-xs font-semibold uppercase text-slate py-2">
                {d}
              </div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[80px] bg-slate-50 border border-slate-100" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayEvents = eventsByDate[dateStr] || [];
              const isToday = dateStr === today.toISOString().slice(0, 10);
              return (
                <div
                  key={day}
                  className={`min-h-[80px] border border-border p-1.5 ${
                    isToday ? "bg-amber-50/60" : "bg-white"
                  }`}
                >
                  <p className={`text-xs font-semibold ${isToday ? "text-bronze" : "text-navy"}`}>{day}</p>
                  {dayEvents.map((e) => (
                    <Link
                      key={e.id}
                      href={`/evenements/${e.id}`}
                      className="mt-1 block rounded bg-slate-100 p-1 text-[11px] text-navy font-medium truncate hover:bg-navy hover:text-white"
                    >
                      {e.title}
                    </Link>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

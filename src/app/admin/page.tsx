/* eslint-disable */
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, Calendar, Users, FileText, Plus, ArrowUpRight, Clock3 } from "lucide-react";

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [counts, setCounts] = useState({ news: 0, events: 0, meetings: 0, totalViews: 0 });
  const [news, setNews] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function load() {
    const supabase = createClient();
    const [{ data: n }, { data: e }, { data: m }, { count: nc }, { count: ec }, { count: mc }] = await Promise.all([
      supabase.from("news").select("*").order("created_at", { ascending: false }).limit(6),
      supabase.from("events").select("*").order("created_at", { ascending: false }).limit(6),
      supabase.from("meeting_requests").select("*").order("created_at", { ascending: false }).limit(6),
      supabase.from("news").select("id", { count: "exact", head: true }),
      supabase.from("events").select("id", { count: "exact", head: true }),
      supabase.from("meeting_requests").select("id", { count: "exact", head: true }),
    ]);
    setNews(n ?? []);
    setEvents(e ?? []);
    setMeetings(m ?? []);

    let views = 0;
    try {
      const vRes = await fetch("/api/news/view");
      const vData = await vRes.json();
      views = vData.totalViews || 0;
    } catch {}

    setCounts({ news: nc ?? 0, events: ec ?? 0, meetings: mc ?? 0, totalViews: views });
  }

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push("/admin/login");
        return;
      }
      setUser(data.user);
      await load();
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-slate">Chargement des données du tableau de bord...</p>
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="mx-auto max-w-[1500px] space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-bronze">
            ESPACE DE TRAVAIL / VUE D&apos;ENSEMBLE
          </p>
          <h1 className="mt-1 font-display text-3xl font-light text-navy md:text-4xl">
            Bonjour, bienvenue dans votre espace
          </h1>
          <p className="mt-1.5 text-xs text-slate">
            Connecté en tant que <span className="font-medium text-navy">{user.email}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/"
            target="_blank"
            className="rounded border border-border bg-white px-3.5 py-2 text-xs font-medium text-navy hover:bg-slate-50"
          >
            <ArrowUpRight className="mr-1 inline h-3.5 w-3.5" /> Voir le site
          </Link>
          <button
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              router.push("/admin/login");
            }}
            className="rounded border border-red-200 bg-red-50/50 px-3.5 py-2 text-xs font-medium text-red-700 hover:bg-red-100"
          >
            Déconnexion
          </button>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-xl text-navy">Actions rapides</h2>
            <p className="mt-1 text-sm text-slate">Créez du contenu ou gérez vos prochaines rencontres.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/events/new" className="inline-flex items-center gap-2 rounded-md bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-deep">
              <Plus className="h-4 w-4" /> Créer un événement
            </Link>
            <Link href="/admin/news/new" className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-semibold text-navy transition hover:bg-slate-50">
              <Plus className="h-4 w-4" /> Rédiger une actualité
            </Link>
            <Link href="/admin/meetings" className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-semibold text-navy transition hover:bg-slate-50">
              <Clock3 className="h-4 w-4" /> Demandes reçues
            </Link>
          </div>
        </div>
      </section>

      {/* KPI Cards Strip */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Actualités */}
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate">Actualités &amp; Blog</span>
            <FileText className="h-5 w-5 text-bronze" />
          </div>
          <p className="mt-3 font-display text-3xl font-light text-navy">{counts.news}</p>
          <p className="mt-1 text-xs text-slate">Articles enregistrés</p>
          <Link href="/admin/news" className="mt-3 inline-block text-[11px] font-medium text-bronze hover:underline">
            Gérer les actualités →
          </Link>
        </div>

        {/* Lectures Totales */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900">Lectures Totales</span>
            <Eye className="h-5 w-5 text-blue-600" />
          </div>
          <p className="mt-3 font-display text-3xl font-light text-navy">{counts.totalViews.toLocaleString()}</p>
          <p className="mt-1 text-xs text-slate">Vues cumulées sur les articles</p>
          <span className="mt-3 inline-block text-[11px] text-blue-700 font-medium">Total cumulé</span>
        </div>

        {/* Événements */}
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate">Événements</span>
            <Calendar className="h-5 w-5 text-bronze" />
          </div>
          <p className="mt-3 font-display text-3xl font-light text-navy">{counts.events}</p>
          <p className="mt-1 text-xs text-slate">Rencontres au programme</p>
          <Link href="/admin/events" className="mt-3 inline-block text-[11px] font-medium text-bronze hover:underline">
            Gérer les événements →
          </Link>
        </div>

        {/* Demandes & Rendez-vous */}
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate">Rendez-vous</span>
            <Users className="h-5 w-5 text-bronze" />
          </div>
          <p className="mt-3 font-display text-3xl font-light text-navy">{counts.meetings}</p>
          <p className="mt-1 text-xs text-slate">Demandes reçues</p>
          <Link href="/admin/meetings" className="mt-3 inline-block text-[11px] font-medium text-bronze hover:underline">
            Traiter les demandes →
          </Link>
        </div>
      </div>

      {/* Two Column Grid: News & Events */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent News */}
        <div className="rounded-xl border border-border bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="font-display text-lg text-navy">Derniers articles publiés</h2>
            <Link href="/admin/news" className="text-xs text-bronze hover:underline">Voir tout</Link>
          </div>
          <div className="mt-4 divide-y divide-border">
            {news.length === 0 ? (
              <p className="py-4 text-xs text-slate">Aucun article enregistré.</p>
            ) : (
              news.map((n) => (
                <div key={n.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0 pr-3">
                    <p className="font-medium text-sm text-navy truncate">{n.title}</p>
                    <p className="text-xs text-slate">{n.category || "Actualité"} • {n.date || n.created_at?.split("T")[0]}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    n.published ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {n.published ? "Publié" : "Brouillon"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Events */}
        <div className="rounded-xl border border-border bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="font-display text-lg text-navy">Événements récents</h2>
            <Link href="/admin/events" className="text-xs text-bronze hover:underline">Voir tout</Link>
          </div>
          <div className="mt-4 divide-y divide-border">
            {events.length === 0 ? (
              <p className="py-4 text-xs text-slate">Aucun événement programmé.</p>
            ) : (
              events.map((e) => (
                <div key={e.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0 pr-3">
                    <p className="font-medium text-sm text-navy truncate">{e.title}</p>
                    <p className="text-xs text-slate">
                      {e.date ? `📅 ${e.date}` : "Date non fixée"} {e.location ? `• 📍 ${e.location}` : ""}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    e.status === "published" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
                  }`}>
                    {e.status === "published" ? "En ligne" : "Brouillon"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Meeting Requests */}
      <div className="rounded-xl border border-border bg-white p-6 shadow-2xs">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="font-display text-lg text-navy">Demandes de rendez-vous récentes</h2>
            <p className="text-xs text-slate">Sollicitations d'investisseurs, partenaires et personnalités publiques.</p>
          </div>
          <Link
            href="/admin/meetings"
            className="rounded bg-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-deep"
          >
            Espace Validation &amp; Réponse →
          </Link>
        </div>
        <div className="mt-4 divide-y divide-border">
          {meetings.length === 0 ? (
            <p className="py-4 text-xs text-slate">Aucune demande reçue pour le moment.</p>
          ) : (
            meetings.map((m) => {
              const isAccepted = m.message?.includes("[Statut: accepted]");
              const isDeclined = m.message?.includes("[Statut: rejected]");

              return (
                <div key={m.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-navy">{m.name}</span>
                      {m.organization && (
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700">
                          {m.organization}
                        </span>
                      )}
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        isAccepted
                          ? "bg-emerald-100 text-emerald-800"
                          : isDeclined
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {isAccepted ? "✓ Confirmé" : isDeclined ? "✕ Décliné" : "○ En attente"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate">{m.email}</p>
                    {m.message && (
                      <p className="mt-1 line-clamp-1 text-xs text-slate-500 max-w-xl">
                        {m.message}
                      </p>
                    )}
                  </div>
                  <Link
                    href="/admin/meetings"
                    className="shrink-0 rounded border border-border px-3 py-1 text-xs text-navy hover:border-navy"
                  >
                    Examiner &amp; Répondre
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

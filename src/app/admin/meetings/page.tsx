/* eslint-disable */
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { parseMeetingRequest, withMeetingStatus } from "@/lib/meeting-request";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Mail,
  User,
  Building,
  Calendar,
  Send,
  AlertCircle,
  ExternalLink,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const MEETING_TIMESLOTS = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

function localDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function AdminMeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "declined">("all");
  const [activeTab, setActiveTab] = useState<"slots" | "requests">("slots");
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedCalendarTime, setSelectedCalendarTime] = useState<string | null>(null);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(() => {
    const now = new Date();
    return localDateKey(now.getFullYear(), now.getMonth(), now.getDate());
  });

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  async function loadMeetings() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("meeting_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMeetings(data ?? []);
    } catch (err: any) {
      console.error("Error loading meetings:", err);
      showToast("Erreur lors du chargement des rendez-vous", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadMeetings();
  }, []);

  async function handleConfirm(meeting: any) {
    setProcessingId(meeting.id);
    try {
      // 1. Call server API to approve & send confirmation email
      const res = await fetch("/api/meetings/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: meeting.id }),
      });

      const result = await res.json();
      if (!res.ok) {
        const diagnostic = typeof result.diagnostic === "string" ? ` — ${result.diagnostic}` : "";
        throw new Error(`${result.error || "Échec de l'envoi de l'email"}${diagnostic}`);
      }

      showToast(`Créneau réservé et email de confirmation envoyé à ${meeting.email}`, "success");
      await loadMeetings();
    } catch (err: any) {
      console.error("Confirm error:", err);
      showToast(err.message || "Erreur lors de la confirmation", "error");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(id: string) {
    setProcessingId(id);
    try {
      const supabase = createClient();
      const meeting = meetings.find((item) => item.id === id);
      const { error } = await supabase
        .from("meeting_requests")
        .update({
          message: withMeetingStatus(meeting?.message, "rejected"),
        })
        .eq("id", id);
      if (error) throw error;

      showToast("Demande marquée comme déclinée.", "success");
      await loadMeetings();
    } catch (err: any) {
      showToast("Erreur lors du refus de la demande", "error");
    } finally {
      setProcessingId(null);
    }
  }

  const filtered = meetings.filter((m) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      (m.name || "").toLowerCase().includes(q) ||
      (m.email || "").toLowerCase().includes(q) ||
      (m.organization || "").toLowerCase().includes(q) ||
      (m.message || "").toLowerCase().includes(q);

    const details = parseMeetingRequest(m.message);
    const status = details.status === "accepted" || m.status === "accepted"
      ? "approved"
      : details.status === "rejected" || m.status === "rejected"
        ? "declined"
        : "pending";
    const matchStatus = filterStatus === "all" || status === filterStatus;
    return matchSearch && matchStatus;
  });

  const calendarSlots = new Map<string, { booked: any[]; pending: any[] }>();
  meetings.forEach((meeting) => {
    const details = parseMeetingRequest(meeting.message);
    if (!details.date || !details.time) return;
    const key = `${details.date}|${details.time}`;
    const slot = calendarSlots.get(key) ?? { booked: [], pending: [] };
    if (details.status === "accepted" || meeting.status === "accepted") slot.booked.push(meeting);
    else if (details.status !== "rejected" && meeting.status !== "rejected") slot.pending.push(meeting);
    calendarSlots.set(key, slot);
  });

  const daysInCalendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const calendarStartOffset = (new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay() + 6) % 7;
  const now = new Date();
  const todayKey = localDateKey(now.getFullYear(), now.getMonth(), now.getDate());
  const selectedDayLabel = new Date(`${selectedCalendarDay}T12:00:00`).toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  function changeCalendarMonth(offset: number) {
    const nextMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + offset, 1);
    setCalendarMonth(nextMonth);
    setSelectedCalendarDay(localDateKey(nextMonth.getFullYear(), nextMonth.getMonth(), 1));
    setSelectedCalendarTime(null);
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 24,
            right: 24,
            zIndex: 9999,
            background: toast.type === "success" ? "#065f46" : "#991b1b",
            color: "#fff",
            padding: "14px 22px",
            borderRadius: 6,
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: "13px",
            fontWeight: 500,
          }}
        >
          {toast.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)" }}>
            Gestion des Audiences
          </span>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "32px", color: "var(--navy)", margin: "4px 0 0" }}>
            Demandes de Rendez-vous &amp; Meetups
          </h1>
          <p style={{ fontSize: "14px", color: "var(--muted)", margin: "4px 0 0" }}>
            Consultez les créneaux horaires demandés par les investisseurs, validez les audiences et expédiez les confirmations officielles par email.
          </p>
        </div>
        <button
          onClick={loadMeetings}
          style={{
            background: "#fff",
            border: "1px solid var(--border)",
            padding: "10px 18px",
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--ink)",
            cursor: "pointer",
            borderRadius: 4,
          }}
        >
          Actualiser la liste
        </button>
      </div>

      <div role="tablist" aria-label="Vue des rendez-vous" style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--border)" }}>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "slots"}
          onClick={() => setActiveTab("slots")}
          style={{ padding: "12px 18px", border: "none", borderBottom: activeTab === "slots" ? "3px solid var(--gold)" : "3px solid transparent", background: "transparent", color: activeTab === "slots" ? "var(--navy)" : "var(--muted)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
        >
          Créneaux horaires
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "requests"}
          onClick={() => setActiveTab("requests")}
          style={{ padding: "12px 18px", border: "none", borderBottom: activeTab === "requests" ? "3px solid var(--gold)" : "3px solid transparent", background: "transparent", color: activeTab === "requests" ? "var(--navy)" : "var(--muted)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
        >
          Liste des demandes
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <div style={{ background: "#fff", border: "1px solid var(--border)", padding: "20px 24px" }}>
          <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--gold)", margin: 0 }}>
            Total Demandes
          </p>
          <p style={{ fontFamily: "Georgia, serif", fontSize: "28px", color: "var(--navy)", margin: "6px 0 0" }}>
            {meetings.length}
          </p>
        </div>
        <div style={{ background: "#fff", border: "1px solid var(--border)", padding: "20px 24px" }}>
          <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#10b981", margin: 0 }}>
            Confirmées
          </p>
          <p style={{ fontFamily: "Georgia, serif", fontSize: "28px", color: "var(--navy)", margin: "6px 0 0" }}>
            {meetings.filter((m) => (m.message || "").includes("accepted") || m.status === "accepted").length}
          </p>
        </div>
        <div style={{ background: "#fff", border: "1px solid var(--border)", padding: "20px 24px" }}>
          <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#d97706", margin: 0 }}>
            En attente de validation
          </p>
          <p style={{ fontFamily: "Georgia, serif", fontSize: "28px", color: "var(--navy)", margin: "6px 0 0" }}>
            {meetings.filter((m) => parseMeetingRequest(m.message).status === "pending").length}
          </p>
        </div>
      </div>

      {/* Day-by-day availability calendar */}
      {activeTab === "slots" && <section style={{ background: "#fff", border: "1px solid var(--border)" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--gold)" }}>Disponibilités</span>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "25px", color: "var(--navy)", margin: "4px 0 0" }}>Calendrier des créneaux</h2>
          <p style={{ fontSize: "12px", color: "var(--muted)", margin: "5px 0 0" }}>Heure d’Abidjan. Les créneaux approuvés sont réservés; les demandes en attente restent à valider.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))" }}>
          <div style={{ padding: 22, borderRight: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <button type="button" aria-label="Mois précédent" onClick={() => changeCalendarMonth(-1)} style={{ display: "grid", placeItems: "center", width: 34, height: 34, border: "1px solid var(--border)", background: "#fff", color: "var(--navy)", cursor: "pointer" }}><ChevronLeft size={17} /></button>
              <h3 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 19, color: "var(--navy)", textTransform: "capitalize" }}>{calendarMonth.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</h3>
              <button type="button" aria-label="Mois suivant" onClick={() => changeCalendarMonth(1)} style={{ display: "grid", placeItems: "center", width: 34, height: 34, border: "1px solid var(--border)", background: "#fff", color: "var(--navy)", cursor: "pointer" }}><ChevronRight size={17} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 5, textAlign: "center" }}>
              {["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"].map((day) => <span key={day} style={{ padding: "6px 0", color: "var(--muted)", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>{day}</span>)}
              {Array.from({ length: calendarStartOffset }, (_, index) => <span key={`empty-${index}`} />)}
              {Array.from({ length: daysInCalendarMonth }, (_, index) => {
                const day = index + 1;
                const dateKey = localDateKey(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                const daySlots = MEETING_TIMESLOTS.map((time) => calendarSlots.get(`${dateKey}|${time}`) ?? { booked: [], pending: [] });
                const bookedCount = daySlots.filter((slot) => slot.booked.length > 0).length;
                const pendingCount = daySlots.filter((slot) => !slot.booked.length && slot.pending.length > 0).length;
                const isPastDate = dateKey < todayKey;
                const selected = selectedCalendarDay === dateKey;
                const background = bookedCount ? "#fee2e2" : pendingCount ? "#fef3c7" : isPastDate ? "#f1f5f9" : "#f0fdf4";
                const color = bookedCount ? "#991b1b" : pendingCount ? "#92400e" : isPastDate ? "#94a3b8" : "#166534";
                return <button key={dateKey} type="button" onClick={() => { setSelectedCalendarDay(dateKey); setSelectedCalendarTime(null); }} aria-pressed={selected} style={{ minHeight: 48, padding: "4px 2px", border: selected ? "2px solid var(--navy)" : "1px solid transparent", borderRadius: 5, background, color, cursor: "pointer", fontWeight: selected ? 800 : 600, fontSize: 12 }}>
                  <span>{day}</span>
                  {(bookedCount > 0 || pendingCount > 0) && <span style={{ display: "block", marginTop: 2, fontSize: 8, fontWeight: 700 }}>{bookedCount ? `${bookedCount} rés.` : `${pendingCount} en att.`}</span>}
                </button>;
              })}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 18, fontSize: 10, color: "var(--muted)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><i style={{ width: 10, height: 10, borderRadius: 2, background: "#f0fdf4", border: "1px solid #86efac" }} />Disponible</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><i style={{ width: 10, height: 10, borderRadius: 2, background: "#fef3c7", border: "1px solid #fcd34d" }} />En attente</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><i style={{ width: 10, height: 10, borderRadius: 2, background: "#fee2e2", border: "1px solid #fca5a5" }} />Réservé</span>
            </div>
          </div>

          <div style={{ padding: 22 }}>
            <div style={{ marginBottom: 15 }}>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gold)" }}>Créneaux du jour</p>
              <h3 style={{ margin: "4px 0 0", fontFamily: "Georgia, serif", fontSize: 20, color: "var(--navy)", textTransform: "capitalize" }}>{selectedDayLabel}</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))", gap: 9 }}>
              {MEETING_TIMESLOTS.map((time) => {
                const slot = calendarSlots.get(`${selectedCalendarDay}|${time}`) ?? { booked: [], pending: [] };
                const booking = slot.booked[0];
                const request = slot.pending[0];
                const state = booking ? "booked" : request ? "pending" : selectedCalendarDay < todayKey ? "past" : "available";
                const colors = state === "booked"
                  ? { background: "#fef2f2", border: "#fecaca", color: "#991b1b", label: "Réservé", person: booking.name }
                  : state === "pending"
                    ? { background: "#fffbeb", border: "#fde68a", color: "#92400e", label: "Demande en attente", person: request.name }
                    : state === "past"
                      ? { background: "#f1f5f9", border: "#e2e8f0", color: "#64748b", label: "Passé", person: "" }
                      : { background: "#f0fdf4", border: "#bbf7d0", color: "#166534", label: "Disponible", person: "" };
                const selected = selectedCalendarTime === time;
                return <button key={time} type="button" onClick={() => setSelectedCalendarTime(time)} aria-pressed={selected} style={{ textAlign: "left", padding: "12px 13px", border: selected ? "2px solid var(--navy)" : `1px solid ${colors.border}`, borderRadius: 6, background: colors.background, color: colors.color, cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 5 }}><strong style={{ fontSize: 15 }}>{time}</strong><span style={{ fontSize: 9, fontWeight: 700 }}>{colors.label}</span></div>
                  {colors.person && <p style={{ margin: "5px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 10 }}>{colors.person}</p>}
                </button>;
              })}
            </div>
            {selectedCalendarTime && (() => {
              const slot = calendarSlots.get(`${selectedCalendarDay}|${selectedCalendarTime}`) ?? { booked: [], pending: [] };
              const people = [
                ...slot.booked.map((meeting: any) => ({ meeting, status: "Réservé" })),
                ...slot.pending.map((meeting: any) => ({ meeting, status: "En attente" })),
              ];
              return <div style={{ marginTop: 18, padding: 16, border: "1px solid var(--border)", borderLeft: `4px solid ${slot.booked.length ? "#b91c1c" : slot.pending.length ? "#d97706" : "#15803d"}`, background: "#fafaf9" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--gold)" }}>Détails du créneau</p>
                    <h4 style={{ margin: "4px 0 0", fontFamily: "Georgia, serif", fontSize: 18, color: "var(--navy)", textTransform: "capitalize" }}>{selectedDayLabel} · {selectedCalendarTime}</h4>
                  </div>
                  <button type="button" onClick={() => setSelectedCalendarTime(null)} aria-label="Fermer les détails" style={{ border: "none", background: "transparent", color: "var(--muted)", fontSize: 18, cursor: "pointer" }}>×</button>
                </div>
                {people.length === 0 ? <p style={{ margin: 0, fontSize: 12, color: "#166534" }}>Aucune personne associée : ce créneau est disponible.</p> : <div style={{ display: "grid", gap: 10 }}>
                  {people.map(({ meeting, status }: { meeting: any; status: string }) => {
                    const details = parseMeetingRequest(meeting.message);
                    const requestMessage = meeting.message?.split(/Objet \/ Message\s*:\s*/i).slice(1).join("").trim();
                    return <div key={meeting.id} style={{ padding: 12, border: "1px solid var(--border)", background: "#fff" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8 }}>
                        <strong style={{ color: "var(--navy)", fontSize: 14 }}>{meeting.name || "Nom non renseigné"}</strong>
                        <span style={{ padding: "3px 8px", borderRadius: 12, background: status === "Réservé" ? "#fee2e2" : "#fef3c7", color: status === "Réservé" ? "#991b1b" : "#92400e", fontSize: 10, fontWeight: 700 }}>{status}</span>
                      </div>
                      <a href={`mailto:${meeting.email}`} style={{ display: "inline-block", marginTop: 5, color: "var(--ink)", fontSize: 12 }}>{meeting.email}</a>
                      {meeting.organization && <p style={{ margin: "5px 0 0", color: "var(--muted)", fontSize: 11 }}>Organisation : {meeting.organization}</p>}
                      <p style={{ margin: "5px 0 0", color: "var(--muted)", fontSize: 11 }}>Format: Video conference</p>
                      {requestMessage && <p style={{ margin: "9px 0 0", paddingTop: 8, borderTop: "1px solid var(--border)", color: "var(--ink)", fontSize: 12, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{requestMessage}</p>}
                    </div>;
                  })}
                </div>}
              </div>;
            })()}
          </div>
        </div>
      </section>}

      {/* Search & Filter Bar */}
      {activeTab === "requests" && <>
      <div
        style={{
          background: "#fff",
          border: "1px solid var(--border)",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 240 }}>
          <Search style={{ width: 16, height: 16, color: "var(--muted)" }} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, email, entreprise ou mot-clé..."
            style={{ width: "100%", border: "none", outline: "none", fontSize: "13px", color: "var(--ink)" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Filter style={{ width: 14, height: 14, color: "var(--muted)" }} />
          <select
            aria-label="Filtrer par statut"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            style={{ border: "1px solid var(--border)", padding: "6px 12px", fontSize: "12px", background: "#fff", outline: "none" }}
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuvées</option>
            <option value="declined">Déclinées</option>
          </select>
        </div>
      </div>

      {/* Meetings List */}
      <div style={{ background: "#fff", border: "1px solid var(--border)" }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--muted)", fontSize: "13px" }}>
            Chargement des demandes...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center", color: "var(--muted)" }}>
            <Clock style={{ width: 36, height: 36, margin: "0 auto 12px", opacity: 0.4 }} />
            <p style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>Aucune demande de rendez-vous enregistrée.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {filtered.map((m, idx) => {
              const details = parseMeetingRequest(m.message);
              const isAccepted = details.status === "accepted" || m.status === "accepted";
              const isRejected = details.status === "rejected" || m.status === "rejected";
              const isPending = !isAccepted && !isRejected;

              return (
                <div
                  key={m.id}
                  style={{
                    padding: "24px 28px",
                    borderBottom: idx < filtered.length - 1 ? "1px solid var(--border)" : "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <span style={{ fontSize: "16px", fontWeight: 600, color: "var(--navy)" }}>
                          {m.name}
                        </span>
                        {m.organization && (
                          <span
                            style={{
                              fontSize: "11px",
                              padding: "2px 8px",
                              background: "var(--cream)",
                              border: "1px solid var(--border)",
                              fontWeight: 600,
                              color: "var(--ink)",
                            }}
                          >
                            {m.organization}
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            padding: "3px 8px",
                            borderRadius: 2,
                            background: isAccepted ? "#dcfce7" : isRejected ? "#fee2e2" : "#fef3c7",
                            color: isAccepted ? "#15803d" : isRejected ? "#b91c1c" : "#b45309",
                          }}
                        >
                          {isAccepted ? "Confirmé & Email envoyé" : isRejected ? "Décliné" : "En attente"}
                        </span>
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: "12px", color: "var(--muted)" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Mail style={{ width: 13, height: 13, color: "var(--gold)" }} />
                          <a href={`mailto:${m.email}`} style={{ color: "var(--ink)", textDecoration: "none" }}>
                            {m.email}
                          </a>
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Clock style={{ width: 13, height: 13, color: "var(--gold)" }} />
                          Format: One-to-one video conference
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Calendar style={{ width: 13, height: 13, color: "var(--gold)" }} />
                          Date demandée : {details.date || m.preferred_date || "Non précisée"} {details.time || m.preferred_time ? `à ${details.time || m.preferred_time}` : ""}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <button
                        onClick={() => handleConfirm(m)}
                        disabled={processingId === m.id || isAccepted}
                        style={{
                          background: isAccepted ? "#e5e7eb" : "var(--gold)",
                          color: isAccepted ? "#6b7280" : "var(--navy)",
                          border: "none",
                          padding: "9px 18px",
                          fontSize: "11px",
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          cursor: isAccepted ? "not-allowed" : "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          transition: "all 0.15s ease",
                        }}
                      >
                        <CheckCircle2 style={{ width: 14, height: 14 }} />
                        <span>{processingId === m.id ? "Envoi email..." : isAccepted ? "Confirmé" : "Approuver & Confirmer"}</span>
                      </button>

                      {!isRejected && !isAccepted && (
                        <button
                          onClick={() => handleReject(m.id)}
                          disabled={processingId === m.id}
                          style={{
                            background: "transparent",
                            border: "1px solid var(--border)",
                            color: "#b91c1c",
                            padding: "8px 14px",
                            fontSize: "11px",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <XCircle style={{ width: 13, height: 13 }} />
                          <span>Décliner</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Message body */}
                  {m.message && (
                    <div
                      style={{
                        background: "var(--paper)",
                        padding: "14px 18px",
                        borderLeft: "2px solid var(--border)",
                        fontSize: "13px",
                        lineHeight: 1.65,
                        color: "var(--ink)",
                      }}
                    >
                      <strong style={{ display: "block", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", marginBottom: 4 }}>
                        Message / Objet de l&apos;audience
                      </strong>
                      {m.message}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      </>}
    </div>
  );
}

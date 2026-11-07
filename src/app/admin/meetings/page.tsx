/* eslint-disable */
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
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
  Filter
} from "lucide-react";

export default function AdminMeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "in_person" | "online">("all");

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
        body: JSON.stringify({
          id: meeting.id,
          name: meeting.name,
          email: meeting.email,
          organization: meeting.organization,
          preferred_date: meeting.preferred_date || new Date().toISOString().split("T")[0],
          preferred_time: meeting.preferred_time || "10:30",
          meeting_type: meeting.meeting_type || "in_person",
          status: "accepted",
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Échec de l'envoi de l'email");

      showToast(`Rendez-vous confirmé ! Email de confirmation envoyé à ${meeting.email}`, "success");
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
      await supabase
        .from("meeting_requests")
        .update({
          message: `[Statut: refusé] Décliné le ${new Date().toLocaleDateString("fr-FR")}`,
        })
        .eq("id", id);

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

    if (filterType === "all") return matchSearch;
    return matchSearch && m.meeting_type === filterType;
  });

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
            {meetings.filter((m) => !(m.message || "").includes("accepted") && !(m.message || "").includes("refusé")).length}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
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
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            style={{ border: "1px solid var(--border)", padding: "6px 12px", fontSize: "12px", background: "#fff", outline: "none" }}
          >
            <option value="all">Tous les formats</option>
            <option value="in_person">En personne (Cocody)</option>
            <option value="online">Visioconférence</option>
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
              const isAccepted = (m.message || "").includes("accepted") || m.status === "accepted";
              const isRejected = (m.message || "").includes("refusé") || m.status === "rejected";
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
                          Format : {m.meeting_type === "in_person" ? "En personne (Siège SOPHIA)" : "Visioconférence"}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Calendar style={{ width: 13, height: 13, color: "var(--gold)" }} />
                          Date souhaitée : {m.preferred_date || "Selon agenda"} {m.preferred_time ? `à ${m.preferred_time}` : ""}
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

                      {!isRejected && (
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
    </div>
  );
}

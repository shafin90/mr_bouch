/* eslint-disable */
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function AdminEventsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form state — mapped to actual DB columns
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState(""); // DB column: date
  const [eventTime, setEventTime] = useState(""); // DB column: time
  const [location, setLocation] = useState(""); // DB column: location
  const [imageUrl, setImageUrl] = useState(""); // DB column: image_url
  const [registrationUrl, setRegistrationUrl] = useState(""); // DB column: registration_url

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  async function load() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setItems(data ?? []);
  }

  useEffect(() => { void load(); }, []);

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setEventDate("");
    setEventTime("");
    setLocation("");
    setImageUrl("");
    setRegistrationUrl("");
  }

  function startEdit(item: any) {
    setEditingId(item.id);
    setTitle(item.title || "");
    setDescription(item.description || "");
    setEventDate(item.date || "");
    setEventTime(item.time || "");
    setLocation(item.location || "");
    setImageUrl(item.image_url || "");
    setRegistrationUrl(item.registration_url || "");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const supabase = createClient();

    const payload = {
      title: title.trim(),
      description: description.trim(),
      date: eventDate || null,
      time: eventTime || null,
      location: location.trim() || null,
      image_url: imageUrl.trim() || null,
      registration_url: registrationUrl.trim() || null,
      status: "draft",
    };

    if (editingId) {
      const { error } = await supabase.from("events").update(payload).eq("id", editingId);
      if (error) { showToast("Erreur lors de la mise à jour : " + error.message, "error"); return; }
      showToast("Événement mis à jour !");
    } else {
      const { error } = await supabase.from("events").insert(payload);
      if (error) { showToast("Erreur lors de la création : " + error.message, "error"); return; }
      showToast("Événement créé !");
    }
    resetForm();
    load();
  }

  async function remove(id: string) {
    if (!window.confirm("Supprimer cet événement ?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) { showToast("Erreur suppression : " + error.message, "error"); return; }
    showToast("Événement supprimé");
    if (editingId === id) resetForm();
    load();
  }

  async function togglePublish(id: string, currentStatus: string) {
    const supabase = createClient();
    const newStatus = currentStatus === "published" ? "draft" : "published";
    const { error } = await supabase.from("events").update({ status: newStatus }).eq("id", id);
    if (error) { showToast("Erreur : " + error.message, "error"); return; }
    showToast(newStatus === "published" ? "Événement publié en ligne" : "Événement repassé en brouillon");
    load();
  }

  const publishedCount = items.filter((i) => i.status === "published").length;

  return (
    <div className="space-y-10 pb-16">
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 18px",
            borderRadius: 8,
            boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
            background: toast.type === "success" ? "#f0fdf4" : "#fef2f2",
            border: `1px solid ${toast.type === "success" ? "#bbf7d0" : "#fecaca"}`,
            color: toast.type === "success" ? "#14532d" : "#7f1d1d",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid var(--border)",
          paddingBottom: 24,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "var(--gold)",
            }}
          >
            Agenda &amp; Rencontres
          </p>
          <h1
            style={{
              marginTop: 4,
              fontFamily: "Georgia, serif",
              fontSize: 32,
              fontWeight: 300,
              color: "var(--navy)",
            }}
          >
            Gestion des Événements
          </h1>
          <p style={{ marginTop: 6, fontSize: 13, color: "var(--muted)" }}>
            Créez et gérez les conférences, tables rondes et rencontres.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span
            style={{
              padding: "6px 14px",
              border: "1px solid var(--border)",
              background: "white",
              fontSize: 12,
              color: "var(--navy)",
              borderRadius: 6,
            }}
          >
            <strong>{items.length}</strong> événements total
          </span>
          <span
            style={{
              padding: "6px 14px",
              border: "1px solid #bbf7d0",
              background: "#f0fdf4",
              fontSize: 12,
              color: "#14532d",
              borderRadius: 6,
            }}
          >
            <strong>{publishedCount}</strong> publiés
          </span>
          <span
            style={{
              padding: "6px 14px",
              border: "1px solid #fde68a",
              background: "#fffbeb",
              fontSize: 12,
              color: "#78350f",
              borderRadius: 6,
            }}
          >
            <strong>{items.length - publishedCount}</strong> brouillons
          </span>
        </div>
      </div>

      {/* Form */}
      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: 10,
          background: "white",
          overflow: "hidden",
        }}
      >
        {/* Card header */}
        <div
          style={{
            borderBottom: "1px solid var(--border)",
            background: "#FBF9F3",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "Georgia, serif",
                fontSize: 20,
                fontWeight: 400,
                color: "var(--navy)",
              }}
            >
              {editingId ? "Modifier l'événement" : "Créer un nouvel événement"}
            </h2>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              {editingId
                ? "Modifiez les informations et enregistrez."
                : "Remplissez les détails et publiez-le quand vous êtes prêt."}
            </p>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              style={{
                padding: "6px 14px",
                border: "1px solid var(--border)",
                background: "white",
                fontSize: 12,
                color: "var(--muted)",
                cursor: "pointer",
                borderRadius: 6,
              }}
            >
              ✕ Annuler
            </button>
          )}
        </div>

        {/* Form body */}
        <form onSubmit={save} style={{ padding: 24, display: "grid", gap: 18 }}>
          {/* Title */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--navy)",
                marginBottom: 6,
              }}
            >
              Titre de l'événement *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex : Conférence internationale sur l'entrepreneuriat africain"
              required
              style={{
                width: "100%",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "10px 14px",
                fontSize: 15,
                color: "var(--navy)",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--navy)",
                marginBottom: 6,
              }}
            >
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez l'événement, ses objectifs, le programme..."
              rows={4}
              style={{
                width: "100%",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "10px 14px",
                fontSize: 14,
                color: "var(--navy)",
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Date & Time */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--navy)",
                  marginBottom: 6,
                }}
              >
                Date de l'événement
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                style={{
                  width: "100%",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: "10px 14px",
                  fontSize: 14,
                  color: "var(--navy)",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--navy)",
                  marginBottom: 6,
                }}
              >
                Horaire
              </label>
              <input
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                style={{
                  width: "100%",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: "10px 14px",
                  fontSize: 14,
                  color: "var(--navy)",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--navy)",
                marginBottom: 6,
              }}
            >
              Lieu / Adresse
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex : Centre de Conférences, Abidjan, Côte d'Ivoire"
              style={{
                width: "100%",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "10px 14px",
                fontSize: 14,
                color: "var(--navy)",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Image URL & Registration URL */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--navy)",
                  marginBottom: 6,
                }}
              >
                URL Image de couverture
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                style={{
                  width: "100%",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: "10px 14px",
                  fontSize: 14,
                  color: "var(--navy)",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--navy)",
                  marginBottom: 6,
                }}
              >
                URL d'inscription externe (optionnel)
              </label>
              <input
                type="url"
                value={registrationUrl}
                onChange={(e) => setRegistrationUrl(e.target.value)}
                placeholder="https://evenement.com/inscription"
                style={{
                  width: "100%",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: "10px 14px",
                  fontSize: 14,
                  color: "var(--navy)",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Submit */}
          <div
            style={{
              borderTop: "1px solid var(--border)",
              paddingTop: 16,
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
            }}
          >
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: "10px 20px",
                  border: "1px solid var(--border)",
                  background: "white",
                  color: "var(--muted)",
                  fontSize: 13,
                  cursor: "pointer",
                  borderRadius: 6,
                }}
              >
                Annuler
              </button>
            )}
            <button
              type="submit"
              style={{
                padding: "10px 24px",
                background: "var(--navy)",
                color: "white",
                border: "none",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                borderRadius: 6,
              }}
            >
              {editingId ? "Mettre à jour l'événement" : "Enregistrer l'événement"}
            </button>
          </div>
        </form>
      </div>

      {/* Events List */}
      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: 10,
          background: "white",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            borderBottom: "1px solid var(--border)",
            background: "#FBF9F3",
            padding: "16px 24px",
          }}
        >
          <h2
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 20,
              fontWeight: 400,
              color: "var(--navy)",
            }}
          >
            Événements créés
          </h2>
          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
            Publiez ou dépubliez, modifiez ou supprimez vos événements.
          </p>
        </div>

        <div>
          {items.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
              Aucun événement créé pour le moment.
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: "16px 24px",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                  gap: 16,
                  justifyContent: "space-between",
                  background: editingId === item.id ? "#fffbeb" : "white",
                }}
              >
                {/* Left: Info */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: 20,
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        background: item.status === "published" ? "#dcfce7" : "#fef9c3",
                        color: item.status === "published" ? "#14532d" : "#78350f",
                        border: item.status === "published" ? "1px solid #bbf7d0" : "1px solid #fde68a",
                      }}
                    >
                      {item.status === "published" ? "● Publié" : "○ Brouillon"}
                    </span>
                    {item.date && (
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>
                        📅 {item.date} {item.time ? `à ${item.time}` : ""}
                      </span>
                    )}
                    {item.location && (
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>
                        📍 {item.location}
                      </span>
                    )}
                  </div>
                  <h3
                    style={{
                      marginTop: 6,
                      fontFamily: "Georgia, serif",
                      fontSize: 17,
                      fontWeight: 400,
                      color: "var(--navy)",
                    }}
                  >
                    {item.title}
                  </h3>
                  {item.description && (
                    <p
                      style={{
                        marginTop: 4,
                        fontSize: 12,
                        color: "var(--muted)",
                        maxWidth: 500,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Right: Actions */}
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                  <button
                    onClick={() => togglePublish(item.id, item.status)}
                    style={{
                      padding: "7px 14px",
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: "pointer",
                      borderRadius: 6,
                      border:
                        item.status === "published"
                          ? "1px solid #fde68a"
                          : "1px solid #bbf7d0",
                      background:
                        item.status === "published" ? "#fffbeb" : "#f0fdf4",
                      color:
                        item.status === "published" ? "#78350f" : "#14532d",
                    }}
                  >
                    {item.status === "published" ? "Dépublier" : "Publier"}
                  </button>

                  <button
                    onClick={() => startEdit(item)}
                    style={{
                      padding: "7px 14px",
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: "pointer",
                      borderRadius: 6,
                      border: "1px solid var(--navy)",
                      background: "var(--navy)",
                      color: "white",
                    }}
                  >
                    Modifier
                  </button>

                  <button
                    onClick={() => remove(item.id)}
                    style={{
                      padding: "7px 10px",
                      fontSize: 12,
                      cursor: "pointer",
                      borderRadius: 6,
                      border: "1px solid #fecaca",
                      background: "white",
                      color: "#dc2626",
                    }}
                    title="Supprimer"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

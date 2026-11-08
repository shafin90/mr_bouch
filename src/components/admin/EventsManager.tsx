/* eslint-disable */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminEventsPage() {
  const pathname = usePathname();
  const router = useRouter();
  const isCreateRoute = pathname.endsWith("/new");
  const [items, setItems] = useState<any[]>([]);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form state — mapped to actual DB columns
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState(""); // DB column: date
  const [eventTime, setEventTime] = useState(""); // DB column: time
  const [capacity, setCapacity] = useState("");
  const [location, setLocation] = useState(""); // DB column: location
  const [imageUrl, setImageUrl] = useState(""); // DB column: image_url
  const [uploadingImage, setUploadingImage] = useState(false);

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

  useEffect(() => {
    if (!isCreateRoute) return;
    const editId = new URLSearchParams(window.location.search).get("edit");
    if (!editId) {
      setEditingId(null);
      setTitle("");
      setDescription("");
      setEventDate("");
      setEventTime("");
      setCapacity("");
      setLocation("");
      setImageUrl("");
      return;
    }

    let active = true;
    createClient().from("events").select("*").eq("id", editId).single().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        showToast("Impossible de charger cet événement pour modification.", "error");
        return;
      }
      setEditingId(data.id);
      setTitle(data.title || "");
      setDescription(data.description || "");
      setEventDate(data.date || "");
      setEventTime(data.time || "");
      setCapacity(data.capacity ? String(data.capacity) : "");
      setLocation(data.location || "");
      setImageUrl(data.image_url || "");
    });
    return () => { active = false; };
  }, [isCreateRoute]);

  async function uploadCoverImage(file?: File) {
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      showToast("Choisissez une image JPEG, PNG ou WebP.", "error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast("L’image doit faire 10 Mo maximum.", "error");
      return;
    }

    setUploadingImage(true);
    try {
      const supabase = createClient();
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const path = `events/${Date.now()}-${safeName}`;
      const { error } = await supabase.storage.from("media").upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (error) throw error;

      const { data } = supabase.storage.from("media").getPublicUrl(path);
      setImageUrl(data.publicUrl);
      showToast("Image de couverture téléversée.");
    } catch (error: any) {
      console.error("Event cover upload failed:", error);
      showToast(`Échec du téléversement : ${error.message || "réessayez."}`, "error");
    } finally {
      setUploadingImage(false);
    }
  }

  function resetForm() {
    if (uploadingImage) {
      showToast("Attendez la fin du téléversement de l’image.", "error");
      return;
    }
    setEditingId(null);
    setTitle("");
    setDescription("");
    setEventDate("");
    setEventTime("");
    setCapacity("");
    setLocation("");
    setImageUrl("");
    if (isCreateRoute && new URLSearchParams(window.location.search).has("edit")) {
      router.replace("/admin/events/new");
    }
  }

  function startEdit(item: any) {
    router.push(`/admin/events/new?edit=${encodeURIComponent(item.id)}`);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (uploadingImage) {
      showToast("Attendez la fin du téléversement de l’image.", "error");
      return;
    }
    if (!title.trim()) return;
    if (!capacity || Number(capacity) < 1) {
      showToast("Indiquez le nombre total de places pour activer la carte des sièges.", "error");
      return;
    }
    const supabase = createClient();

    const payload = {
      title: title.trim(),
      description: description.trim(),
      date: eventDate || null,
      event_date: eventDate || null,
      time: eventTime || null,
      capacity: Number(capacity),
      location: location.trim() || null,
      image_url: imageUrl.trim() || null,
      // New events are intended for public seat booking as soon as they are saved.
      // Keep an existing event's publication state when editing it.
      status: editingId
        ? items.find((item) => item.id === editingId)?.status ?? "published"
        : "published",
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
    await load();
    router.push("/admin/events");
    router.refresh();
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

      {isCreateRoute && (
        <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 24 }}>
          <Link href="/admin/events" className="text-xs font-medium text-bronze hover:underline">← Retour à la liste des événements</Link>
          <h1 style={{ marginTop: 8, fontFamily: "Georgia, serif", fontSize: 32, fontWeight: 300, color: "var(--navy)" }}>
            {editingId ? "Modifier l’événement" : "Créer un événement"}
          </h1>
          <p style={{ marginTop: 6, fontSize: 13, color: "var(--muted)" }}>Définissez la date, le lieu et les informations de réservation.</p>
        </div>
      )}

      {/* Header */}
      {!isCreateRoute && (
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
          <Link href="/admin/events/new" className="inline-flex items-center rounded-md bg-navy px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-navy-deep">
            + Créer un événement
          </Link>
        </div>
      </div>
      )}

      {/* Form */}
      {isCreateRoute && (
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
          <div className="grid gap-4 md:grid-cols-3">
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
                Capacité totale (places) *
              </label>
              <input
                type="number"
                min={1}
                step={1}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                required
                placeholder="Ex : 100"
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

          {/* Cover image */}
          <div>
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
                Image de couverture
              </label>
              {imageUrl && (
                <div style={{ marginBottom: 10, border: "1px solid var(--border)", borderRadius: 6, overflow: "hidden", aspectRatio: "16 / 9", background: "var(--paper)" }}>
                  <img src={imageUrl} alt="Aperçu de la couverture de l’événement" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
              <label style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", boxSizing: "border-box", border: "1px dashed var(--border)", borderRadius: 6, padding: "12px 14px", color: "var(--navy)", background: "#FBF9F3", cursor: uploadingImage ? "wait" : "pointer", fontSize: 13, fontWeight: 600, opacity: uploadingImage ? 0.65 : 1 }}>
                {uploadingImage ? "Téléversement…" : imageUrl ? "Remplacer l’image" : "Téléverser une image"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploadingImage}
                  onChange={(e) => {
                    void uploadCoverImage(e.target.files?.[0]);
                    e.currentTarget.value = "";
                  }}
                  className="sr-only"
                />
              </label>
              <p style={{ margin: "6px 0 0", fontSize: 11, color: "var(--muted)" }}>JPEG, PNG ou WebP · 10 Mo maximum</p>
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
              disabled={uploadingImage}
              style={{
                padding: "10px 24px",
                background: "var(--navy)",
                color: "white",
                border: "none",
                fontSize: 13,
                fontWeight: 600,
                cursor: uploadingImage ? "wait" : "pointer",
                borderRadius: 6,
                opacity: uploadingImage ? 0.65 : 1,
              }}
            >
              {uploadingImage ? "Téléversement de l’image…" : editingId ? "Mettre à jour l'événement" : "Enregistrer l'événement"}
            </button>
          </div>
        </form>
      </div>
      )}

      {/* Events List */}
      {!isCreateRoute && (
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
                    {item.capacity && (
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>
                        {item.capacity} places
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
                  <Link
                    href={`/admin/events/${item.id}`}
                    style={{ padding: "7px 12px", fontSize: 12, fontWeight: 500, borderRadius: 6, border: "1px solid var(--border)", background: "white", color: "var(--navy)", textDecoration: "none" }}
                  >
                    Détails
                  </Link>
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
      )}
    </div>
  );
}

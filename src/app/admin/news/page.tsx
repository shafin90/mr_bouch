/* eslint-disable */
"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import {
  FileText,
  PlusCircle,
  Pencil,
  Trash2,
  ExternalLink,
  Eye,
  CheckCircle2,
  AlertCircle,
  Search,
  Sparkles,
  UploadCloud,
  X,
  Calendar,
  Tag,
  BookmarkCheck,
  RotateCcw
} from "lucide-react";

export default function AdminNewsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Actualité");
  const [imageUrl, setImageUrl] = useState("");
  const [published, setPublished] = useState(false);
  const [articleDate, setArticleDate] = useState(new Date().toISOString().split("T")[0]);
  const [uploading, setUploading] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [viewsMap, setViewsMap] = useState<Record<string, number>>({});
  const [totalViews, setTotalViews] = useState(0);

  const formRef = useRef<HTMLFormElement>(null);

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }

  async function load() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data ?? []);

      // Load views statistics
      try {
        const vRes = await fetch("/api/news/view");
        const vData = await vRes.json();
        if (vData.views) {
          setViewsMap(vData.views);
          setTotalViews(vData.totalViews || 0);
        }
      } catch (e) {
        // views stats fallback
      }
    } catch (err: any) {
      console.error("Error loading news:", err);
      showToast("Erreur lors du chargement des actualités", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  // Helper to generate clean slug from title
  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }

  function handleAutoSlug() {
    if (!title.trim()) return;
    setSlug(generateSlug(title));
  }

  // Helper to extract excerpt from HTML content
  function handleAutoExcerpt() {
    if (!content.trim()) return;
    const tempEl = document.createElement("div");
    tempEl.innerHTML = content;
    const text = tempEl.textContent || tempEl.innerText || "";
    const clean = text.replace(/\s+/g, " ").trim();
    if (clean) {
      const truncated = clean.length > 200 ? clean.slice(0, 197) + "..." : clean;
      setExcerpt(truncated);
      showToast("Extrait généré à partir du texte");
    }
  }

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const supabase = createClient();
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const path = `news/${Date.now()}-${cleanFileName}`;
      const { error } = await supabase.storage.from("media").upload(path, file);
      if (error) throw error;

      const { data } = supabase.storage.from("media").getPublicUrl(path);
      setImageUrl(data.publicUrl);
      showToast("Image de couverture téléversée avec succès");
      return data.publicUrl;
    } catch (err: any) {
      console.error("Upload error:", err);
      showToast("Échec du téléversement de l'image", "error");
      return null;
    } finally {
      setUploading(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setExcerpt("");
    setContent("");
    setCategory("Actualité");
    setImageUrl("");
    setPublished(false);
    setArticleDate(new Date().toISOString().split("T")[0]);
  }

  function startEdit(item: any) {
    setEditingId(item.id);
    setTitle(item.title || "");
    setSlug(item.slug || "");
    setExcerpt(item.excerpt || "");
    setContent(item.content || "");
    setCategory(item.category || "Actualité");
    setImageUrl(item.image_url || "");
    setPublished(!!item.published);
    setArticleDate(item.date || item.created_at?.split("T")[0] || new Date().toISOString().split("T")[0]);

    // Scroll to form
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    showToast(`Édition de l'article : ${item.title}`);
  }

  async function saveArticle(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      showToast("Veuillez saisir un titre", "error");
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const finalSlug = slug.trim() ? generateSlug(slug) : generateSlug(title);

      const payload: Record<string, unknown> = {
        title: title.trim(),
        slug: finalSlug,
        excerpt: excerpt.trim(),
        category: category || "Actualité",
        date: articleDate || new Date().toISOString().split("T")[0],
        image_url: imageUrl,
        published,
      };
      // Include content only if the column exists (added via migration)
      // Remove this guard once you've run supabase/migration.sql in the dashboard
      if (content) {
        try { (payload as any).content = content; } catch {}
      }

      if (editingId) {
        const { error } = await supabase
          .from("news")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
        showToast("Article mis à jour avec succès !");
      } else {
        const { error } = await supabase
          .from("news")
          .insert(payload);
        if (error) throw error;
        showToast("Nouvel article créé avec succès !");
      }

      resetForm();
      await load();
    } catch (err: any) {
      console.error("Save error:", err);
      showToast(err.message || "Erreur lors de l'enregistrement de l'article", "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string, itemTitle: string) {
    if (!window.confirm(`Confirmez-vous la suppression définitive de l'article "${itemTitle}" ?`)) {
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.from("news").delete().eq("id", id);
      if (error) throw error;

      showToast(`Article "${itemTitle}" supprimé`);
      if (editingId === id) resetForm();
      await load();
    } catch (err: any) {
      console.error("Delete error:", err);
      showToast("Erreur lors de la suppression", "error");
    }
  }

  async function togglePublish(id: string, pub: boolean) {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("news").update({ published: pub }).eq("id", id);
      if (error) throw error;

      showToast(pub ? "Article publié en ligne" : "Article repassé en brouillon");
      await load();
    } catch (err: any) {
      console.error("Toggle publish error:", err);
      showToast("Erreur de mise à jour du statut", "error");
    }
  }

  // Filtered items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      (item.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.excerpt || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "published" && item.published) ||
      (filterStatus === "draft" && !item.published);

    const matchesCategory =
      filterCategory === "all" || item.category === filterCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const publishedCount = items.filter((i) => i.published).length;
  const draftCount = items.length - publishedCount;

  return (
    <div className="space-y-10 pb-16">
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-lg border px-4 py-3 shadow-xl transition-all ${
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header & Overview Stats */}
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-bronze">
            Espace Édition & Médias
          </p>
          <h1 className="mt-1 font-display text-3xl font-light text-navy md:text-4xl">
            Gestion des Actualités & Blog
          </h1>
          <p className="mt-1.5 text-sm text-slate">
            Rédigez, mettez en forme et publiez vos articles personnels, tribunes et communiqués de presse.
          </p>
        </div>

        {/* Stats chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 shadow-2xs">
            <span className="font-semibold text-navy">{items.length}</span>
            <span className="text-slate">Articles</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50/50 px-3 py-2 text-emerald-900 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-semibold">{publishedCount}</span>
            <span>Publiés</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50/50 px-3 py-2 text-amber-900 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="font-semibold">{draftCount}</span>
            <span>Brouillons</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50/60 px-3 py-2 text-blue-900 shadow-2xs font-medium">
            <Eye className="h-3.5 w-3.5 text-blue-600" />
            <span className="font-bold">{totalViews.toLocaleString()}</span>
            <span>Lectures totales</span>
          </div>
        </div>
      </div>

      {/* Main Editing Card */}
      <div className="rounded-xl border border-border bg-white shadow-soft" ref={formRef as any}>
        {/* Card Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-[#FBF9F3] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy text-white">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-xl text-navy">
                {editingId ? "Modifier l'article existant" : "Rédiger un nouvel article / blog"}
              </h2>
              <p className="text-xs text-slate">
                {editingId
                  ? "Vous modifiez un article déjà enregistré. Les changements seront sauvegardés dès validation."
                  : "Complétez les informations ci-dessous et profitez de l'éditeur tout confort pour rédiger."}
              </p>
            </div>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-xs font-medium text-slate hover:border-navy hover:text-navy"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Annuler et créer un nouveau
            </button>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={saveArticle} className="space-y-6 p-6">
          {/* Row 1: Title & Slug */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-navy mb-1.5">
                Titre de l'article <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!slug && !editingId) {
                    setSlug(generateSlug(e.target.value));
                  }
                }}
                placeholder="Ex : Réflexions sur l'essor économique et le développement durable en Côte d'Ivoire"
                className="w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-base font-medium text-navy placeholder:text-slate-400 focus:border-navy focus:outline-none"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate">
                  Identifiant URL (Slug)
                </label>
                <button
                  type="button"
                  onClick={handleAutoSlug}
                  title="Générer automatiquement depuis le titre"
                  className="flex items-center gap-1 text-[11px] font-medium text-bronze hover:underline"
                >
                  <Sparkles className="h-3 w-3" /> Auto
                </button>
              </div>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="slug-de-l-article"
                className="w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-sm font-mono text-slate-700 placeholder:text-slate-400 focus:border-navy focus:outline-none"
              />
            </div>
          </div>

          {/* Row 2: Category & Date */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-navy mb-1.5">
                Catégorie éditoriale
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-sm text-navy focus:border-navy focus:outline-none"
                >
                  <option value="Actualité">Actualité</option>
                  <option value="Blog personnel">Blog personnel</option>
                  <option value="Tribune & Idées">Tribune & Idées</option>
                  <option value="Entrepreneuriat">Entrepreneuriat</option>
                  <option value="Rencontre">Rencontre</option>
                  <option value="Fondation">Fondation & Philanthropie</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-navy mb-1.5">
                Date de parution
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={articleDate}
                  onChange={(e) => setArticleDate(e.target.value)}
                  className="w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-sm text-navy focus:border-navy focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Excerpt / Chapeau */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-navy">
                Extrait / Chapeau introductif (résumé pour les aperçus et réseaux)
              </label>
              <button
                type="button"
                onClick={handleAutoExcerpt}
                className="flex items-center gap-1 text-[11px] font-medium text-bronze hover:underline"
              >
                <Sparkles className="h-3 w-3" /> Extraire du texte
              </button>
            </div>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Courte introduction accrocheuse qui résume l'essentiel de l'article (1 à 2 phrases)..."
              className="w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-sm leading-relaxed text-navy placeholder:text-slate-400 focus:border-navy focus:outline-none"
              rows={2}
            />
          </div>

          {/* Row 4: Cover Image */}
          <div className="rounded-lg border border-border bg-[#F8FAFC] p-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-navy mb-2">
              Image de couverture principale
            </label>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadImage(file);
                  }}
                  className="block w-full text-xs text-slate file:mr-4 file:rounded-md file:border-0 file:bg-navy file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-navy-deep cursor-pointer"
                />
                {uploading && <p className="mt-1 text-xs text-bronze animate-pulse">Téléversement de l'image en cours...</p>}
              </div>

              {imageUrl && (
                <div className="relative flex items-center gap-3 rounded-md border border-border bg-white p-2">
                  <img
                    src={imageUrl}
                    alt="Aperçu couverture"
                    className="h-16 w-24 rounded object-cover border border-border"
                  />
                  <div className="text-xs">
                    <p className="font-medium text-navy">Image sélectionnée</p>
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="mt-1 flex items-center gap-1 text-red-600 hover:underline"
                    >
                      <Trash2 className="h-3 w-3" /> Supprimer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Row 5: Rich Text Editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-navy">
                Corps de l'article / Contenu complet <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-slate">
                Titres, gras, citations, tableaux, listes, images & vidéos intégrées
              </span>
            </div>

            {/* Rich Text Editor Component */}
            <RichTextEditor
              value={content}
              onChange={setContent}
              articleTitle={title}
              category={category}
              onUploadImage={async (file) => {
                return await uploadImage(file);
              }}
            />
          </div>

          {/* Row 6: Publication options & Submit */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="h-4 w-4 rounded accent-bronze"
              />
              <div>
                <span className="text-sm font-medium text-navy">
                  Publier immédiatement cet article
                </span>
                <p className="text-xs text-slate">
                  {published
                    ? "L'article sera instantanément visible sur le site public."
                    : "L'article sera enregistré comme brouillon privé (non visible du public)."}
                </p>
              </div>
            </label>

            <div className="flex items-center gap-3">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-md border border-border px-4 py-2.5 text-sm font-medium text-slate hover:border-navy hover:text-navy"
                >
                  Annuler
                </button>
              )}

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-md bg-navy px-6 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-navy-deep disabled:opacity-50 transition"
              >
                {saving ? (
                  "Enregistrement..."
                ) : editingId ? (
                  <>
                    <BookmarkCheck className="h-4 w-4 text-bronze" />
                    Mettre à jour l'article
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4 text-bronze" />
                    Enregistrer l'article
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Existing Articles List Section */}
      <div className="rounded-xl border border-border bg-white shadow-soft">
        {/* Card Header with Filters */}
        <div className="flex flex-col gap-4 border-b border-border bg-[#FBF9F3] p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl text-navy">Articles et Billets Rédigés</h2>
            <p className="text-xs text-slate">Consultez, modifiez, dépubliez ou supprimez vos publications existantes.</p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par titre..."
                className="rounded-md border border-border bg-white pl-8 pr-3 py-1.5 text-xs text-navy focus:border-navy focus:outline-none w-48 sm:w-56"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="rounded-md border border-border bg-white px-2.5 py-1.5 text-xs text-navy focus:border-navy focus:outline-none"
            >
              <option value="all">Tous les statuts</option>
              <option value="published">Publiés</option>
              <option value="draft">Brouillons</option>
            </select>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-md border border-border bg-white px-2.5 py-1.5 text-xs text-navy focus:border-navy focus:outline-none"
            >
              <option value="all">Toutes les catégories</option>
              <option value="Actualité">Actualité</option>
              <option value="Blog personnel">Blog personnel</option>
              <option value="Tribune & Idées">Tribune & Idées</option>
              <option value="Entrepreneuriat">Entrepreneuriat</option>
              <option value="Rencontre">Rencontre</option>
              <option value="Fondation">Fondation</option>
            </select>
          </div>
        </div>

        {/* List Body */}
        <div className="divide-y divide-border">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate">Chargement des articles...</div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-navy">Aucun article ne correspond à votre recherche.</p>
              <p className="mt-1 text-xs text-slate">Commencez à rédiger votre premier billet ci-dessus.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className={`flex flex-col gap-4 p-5 transition-colors sm:flex-row sm:items-center sm:justify-between ${
                  editingId === item.id ? "bg-amber-50/40" : "hover:bg-slate-50/60"
                }`}
              >
                {/* Left: Info & Thumbnail */}
                <div className="flex items-start gap-4 flex-1">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="h-16 w-24 shrink-0 rounded object-cover border border-border"
                    />
                  ) : (
                    <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded border border-border bg-slate-100 text-slate-400">
                      <FileText className="h-6 w-6" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          item.published
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${item.published ? "bg-emerald-600" : "bg-amber-600"}`} />
                        {item.published ? "Publié" : "Brouillon"}
                      </span>

                      {item.category && (
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                          {item.category}
                        </span>
                      )}

                      <span className="text-[11px] text-slate">
                        {item.date || item.created_at?.split("T")[0]}
                      </span>

                      {/* View Count Badge */}
                      <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-800 border border-blue-200">
                        <Eye className="h-3 w-3 text-blue-600" />
                        {(viewsMap[item.slug || item.id] || 0).toLocaleString()} vues
                      </span>
                    </div>

                    <h3 className="font-display text-lg font-normal text-navy">
                      {item.title}
                    </h3>

                    {item.excerpt && (
                      <p className="line-clamp-1 text-xs text-slate max-w-xl">
                        {item.excerpt}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {/* Public link if published */}
                  {item.slug && item.published && (
                    <a
                      href={`/actualites/${item.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Voir sur le site public"
                      className="flex items-center gap-1 rounded border border-border bg-white px-2.5 py-1.5 text-xs text-slate hover:border-navy hover:text-navy"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Voir</span>
                    </a>
                  )}

                  {/* Toggle publish */}
                  <button
                    type="button"
                    onClick={() => togglePublish(item.id, !item.published)}
                    className={`rounded px-2.5 py-1.5 text-xs font-medium transition ${
                      item.published
                        ? "border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                        : "border border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                    }`}
                  >
                    {item.published ? "Dépublier" : "Publier"}
                  </button>

                  {/* Edit button */}
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    className="flex items-center gap-1 rounded border border-navy bg-navy px-3 py-1.5 text-xs font-medium text-white hover:bg-navy-deep"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Modifier</span>
                  </button>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => remove(item.id, item.title)}
                    title="Supprimer"
                    className="rounded border border-border bg-white p-1.5 text-red-600 hover:border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
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

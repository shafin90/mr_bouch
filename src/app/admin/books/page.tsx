"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BookOpen, ImagePlus, Pencil, Plus, Trash2, X } from "lucide-react";

type Book = { id: string; title: string; brief: string; category: string; image_url: string | null; status: "draft" | "published"; created_at: string };

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("published");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState("");

  async function loadBooks() {
    setLoading(true);
    const { data, error } = await createClient().from("books").select("*").order("created_at", { ascending: false });
    if (error) setNotice(`Impossible de charger le catalogue : ${error.message}`);
    else setBooks((data ?? []) as Book[]);
    setLoading(false);
  }

  useEffect(() => { void loadBooks(); }, []);

  function resetForm() {
    setEditingId(null); setTitle(""); setBrief(""); setCategory(""); setImageUrl(""); setStatus("published");
  }

  async function uploadCover(file?: File) {
    if (!file) return;
    setUploading(true); setNotice("");
    const client = createClient();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const path = `books/${Date.now()}-${safeName}`;
    const { error } = await client.storage.from("media").upload(path, file, { contentType: file.type, upsert: false });
    if (error) setNotice(`Échec du téléversement : ${error.message}`);
    else setImageUrl(client.storage.from("media").getPublicUrl(path).data.publicUrl);
    setUploading(false);
  }

  async function saveBook(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !category.trim()) { setNotice("Le titre et la catégorie sont requis."); return; }
    setSaving(true); setNotice("");
    const client = createClient();
    const values = { title: title.trim(), brief: brief.trim(), category: category.trim(), image_url: imageUrl.trim() || null, status, updated_at: new Date().toISOString() };
    const result = editingId
      ? await client.from("books").update(values).eq("id", editingId)
      : await client.from("books").insert(values);
    if (result.error) setNotice(`Enregistrement impossible : ${result.error.message}`);
    else { setNotice(editingId ? "Livre mis à jour." : "Livre ajouté au catalogue."); resetForm(); await loadBooks(); }
    setSaving(false);
  }

  function editBook(book: Book) {
    setEditingId(book.id); setTitle(book.title); setBrief(book.brief); setCategory(book.category); setImageUrl(book.image_url ?? ""); setStatus(book.status);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteBook(book: Book) {
    if (!window.confirm(`Supprimer « ${book.title} » du catalogue ?`)) return;
    const { error } = await createClient().from("books").delete().eq("id", book.id);
    if (error) setNotice(`Suppression impossible : ${error.message}`);
    else { setNotice("Livre supprimé."); await loadBooks(); }
  }

  async function toggleStatus(book: Book) {
    const next = book.status === "published" ? "draft" : "published";
    const { error } = await createClient().from("books").update({ status: next, updated_at: new Date().toISOString() }).eq("id", book.id);
    if (error) setNotice(`Modification impossible : ${error.message}`);
    else await loadBooks();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-7 pb-12">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-bronze">Catalogue éditorial</p>
          <h1 className="mt-2 font-display text-3xl text-navy">Livres &amp; essais</h1>
          <p className="mt-2 text-sm text-slate">Ajoutez une couverture, un titre, un bref résumé et une catégorie.</p>
        </div>
        <span className="rounded-full border border-border bg-white px-3 py-1.5 text-xs text-slate">{books.filter((book) => book.status === "published").length} en ligne</span>
      </header>

      {notice && <div role="status" className="rounded-md border border-border bg-white px-4 py-3 text-sm text-navy">{notice}</div>}

      <form onSubmit={saveBook} className="grid gap-6 rounded-xl border border-border bg-white p-5 shadow-sm md:grid-cols-[minmax(0,1fr)_280px] md:p-7">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-navy">{editingId ? "Modifier le livre" : "Ajouter un livre"}</h2>
            {editingId && <button type="button" onClick={resetForm} className="inline-flex items-center gap-1 text-xs text-slate"><X size={14} /> Annuler</button>}
          </div>
          <label className="block text-xs font-semibold text-navy">Titre du livre *
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5 w-full rounded-md border border-border px-3 py-2.5 text-sm font-normal outline-none focus:border-gold" placeholder="Titre de l'ouvrage" />
          </label>
          <label className="block text-xs font-semibold text-navy">Catégorie *
            <input required value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1.5 w-full rounded-md border border-border px-3 py-2.5 text-sm font-normal outline-none focus:border-gold" placeholder="Essai, urbanisme, économie…" />
          </label>
          <label className="block text-xs font-semibold text-navy">Bref résumé
            <textarea value={brief} onChange={(e) => setBrief(e.target.value)} rows={4} maxLength={500} className="mt-1.5 w-full resize-y rounded-md border border-border px-3 py-2.5 text-sm font-normal outline-none focus:border-gold" placeholder="Présentez l'ouvrage en quelques phrases." />
            <span className="mt-1 block text-right text-[10px] font-normal text-slate">{brief.length}/500</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-navy"><input type="checkbox" checked={status === "published"} onChange={(e) => setStatus(e.target.checked ? "published" : "draft")} /> Publier sur le site</label>
          <button disabled={saving || uploading} className="inline-flex items-center gap-2 rounded-md bg-navy px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Plus size={16} />{saving ? "Enregistrement…" : editingId ? "Enregistrer les modifications" : "Ajouter au catalogue"}</button>
        </div>

        <div>
          <span className="block text-xs font-semibold text-navy">Image de couverture</span>
          <div className="mt-1.5 flex aspect-[4/5] items-center justify-center overflow-hidden rounded-md border border-dashed border-border bg-paper">
            {imageUrl ? <img src={imageUrl} alt="Aperçu de la couverture" className="h-full w-full object-cover" /> : <div className="text-center text-slate"><BookOpen size={32} className="mx-auto mb-2 opacity-60" /><span className="text-xs">Aucune couverture choisie</span></div>}
          </div>
          <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-border px-3 py-2.5 text-xs font-semibold text-navy hover:bg-slate-50">
            <ImagePlus size={15} /> {uploading ? "Téléversement…" : "Choisir une image"}
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => void uploadCover(e.target.files?.[0])} />
          </label>
          <label className="mt-3 block text-[11px] text-slate">ou coller l&apos;URL de l&apos;image
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-xs text-ink" placeholder="https://…" />
          </label>
        </div>
      </form>

      <section className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4"><div><h2 className="font-display text-xl text-navy">Catalogue</h2><p className="mt-1 text-xs text-slate">Les ouvrages publiés apparaissent sur le site public.</p></div></div>
        {loading ? <p className="p-8 text-sm text-slate">Chargement du catalogue…</p> : books.length === 0 ? <p className="p-10 text-center text-sm text-slate">Aucun livre ajouté. Utilisez le formulaire ci-dessus pour commencer.</p> : (
          <div className="divide-y divide-border">
            {books.map((book) => <article key={book.id} className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
              <div className="h-20 w-16 shrink-0 overflow-hidden rounded bg-paper">{book.image_url ? <img src={book.image_url} alt="" className="h-full w-full object-cover" /> : <BookOpen className="m-auto mt-7 h-6 w-6 text-slate" />}</div>
              <div className="min-w-[180px] flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-navy">{book.title}</h3><span className="rounded-full bg-paper px-2 py-0.5 text-[10px] text-slate">{book.category}</span></div><p className="mt-1 line-clamp-2 text-xs text-slate">{book.brief || "Pas de résumé."}</p></div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => void toggleStatus(book)} className="rounded-full border border-border px-3 py-1.5 text-[11px] font-semibold text-navy">{book.status === "published" ? "En ligne" : "Brouillon"}</button>
                <button type="button" aria-label="Modifier" onClick={() => editBook(book)} className="rounded border border-border p-2 text-navy hover:bg-paper"><Pencil size={15} /></button>
                <button type="button" aria-label="Supprimer" onClick={() => void deleteBook(book)} className="rounded border border-red-200 p-2 text-red-700 hover:bg-red-50"><Trash2 size={15} /></button>
              </div>
            </article>)}
          </div>
        )}
      </section>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SITE_CONTENT_PAGES } from "@/lib/site-content-definitions";
import { CheckCircle2, Eye, FileText, ImagePlus, Save, Send, TriangleAlert } from "lucide-react";

type StoredPageContent = {
  draft_content: Record<string, string> | null;
  published_content: Record<string, string> | null;
  published: boolean;
  updated_at: string | null;
};

export default function AdminPageContent() {
  const [pageKey, setPageKey] = useState(SITE_CONTENT_PAGES[0].key);
  const page = useMemo(() => SITE_CONTENT_PAGES.find((item) => item.key === pageKey) ?? SITE_CONTENT_PAGES[0], [pageKey]);
  const publicPaths: Record<string, string> = {
    shared: "/", home: "/", biography: "/biographie", entrepreneurship: "/entrepreneuriat",
    engagements: "/engagements", news: "/actualites", publications: "/publications",
    events: "/evenements", appointments: "/rendez-vous",
  };
  const [values, setValues] = useState<Record<string, string>>({});
  const [stored, setStored] = useState<StoredPageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    async function loadPage() {
      setLoading(true);
      setError("");
      setNotice("");
      const defaults = Object.fromEntries(page.fields.map((field) => [field.key, field.value]));
      const { data, error: loadError } = await createClient().from("site_page_content")
        .select("draft_content,published_content,published,updated_at")
        .eq("page_key", page.key)
        .maybeSingle();
      if (!active) return;
      if (loadError) {
        setError(loadError.code === "42P01" || loadError.code === "PGRST205"
          ? "La table site_page_content n’existe pas encore dans ce projet Supabase."
          : loadError.message);
      }
      const record = data as StoredPageContent | null;
      setStored(record);
      setValues({ ...defaults, ...(record?.draft_content ?? record?.published_content ?? {}) });
      setLoading(false);
    }
    void loadPage();
    return () => { active = false; };
  }, [page]);

  async function saveDraft() {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const client = createClient();
      const payload = {
        page_key: page.key,
        draft_content: values,
        published_content: stored?.published_content ?? null,
        published: stored?.published ?? false,
        updated_at: new Date().toISOString(),
      };
      const result = stored
        ? await client.from("site_page_content").update(payload).eq("page_key", page.key)
        : await client.from("site_page_content").insert(payload);
      if (result.error) throw result.error;
      setStored({ ...payload, updated_at: payload.updated_at });
      setNotice("Brouillon enregistré. Le contenu public n'a pas changé.");
    } catch (saveError: any) {
      setError(saveError.message || "Impossible d'enregistrer le brouillon.");
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const client = createClient();
      const now = new Date().toISOString();
      const payload = {
        page_key: page.key,
        draft_content: values,
        published_content: values,
        published: true,
        published_at: now,
        updated_at: now,
      };
      const result = stored
        ? await client.from("site_page_content").update(payload).eq("page_key", page.key)
        : await client.from("site_page_content").insert(payload);
      if (result.error) throw result.error;
      setStored({ ...payload, updated_at: now });
      setNotice("Contenu publié sur le site.");
    } catch (publishError: any) {
      setError(publishError.message || "Impossible de publier le contenu.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadImage(fieldKey: string, file?: File) {
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Choisissez une image JPEG, PNG ou WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("L’image doit faire 5 Mo maximum.");
      return;
    }
    setUploading(true);
    setError("");
    setNotice("");
    try {
      const extension = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
      const path = `pages/${page.key}/${crypto.randomUUID()}.${extension}`;
      const client = createClient();
      const { data, error: uploadError } = await client.storage.from("media").upload(path, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });
      if (uploadError) throw uploadError;
      const { data: publicImage } = client.storage.from("media").getPublicUrl(data.path);
      setValues((current) => ({ ...current, [fieldKey]: publicImage.publicUrl }));
      setNotice("Image téléversée. Enregistrez le brouillon ou publiez pour l’afficher sur le site.");
    } catch (uploadError: any) {
      setError(uploadError.message || "Impossible de téléverser cette image.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-bronze">Gestion du site public</p>
          <h1 className="mt-1 font-display text-3xl text-navy">Contenu des pages</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate">Modifiez les textes et images fixes par page. Enregistrez un brouillon pour garder la version en ligne, ou publiez pour appliquer vos changements.</p>
        </div>
        <a href={publicPaths[page.key] ?? "/"} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-xs font-semibold text-navy hover:bg-paper"><Eye size={15} />Voir la version en ligne</a>
      </header>

      <section className="rounded-xl border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 sm:grid-cols-[minmax(220px,1fr)_auto] sm:items-end">
          <label className="block text-xs font-semibold text-navy">
            Page à modifier
            <select value={pageKey} onChange={(event) => setPageKey(event.target.value)} className="mt-1.5 block w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-gold">
              {SITE_CONTENT_PAGES.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
            </select>
          </label>
          <div className="text-xs text-slate">{stored?.published ? <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-800"><CheckCircle2 size={13} />Version publiée</span> : <span className="rounded-full bg-amber-50 px-3 py-1.5 font-semibold text-amber-900">Version par défaut</span>}</div>
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-2.5 text-xs leading-5 text-blue-950"><FileText size={14} className="mt-0.5 shrink-0" /><p className="m-0">Edit the English page text below. News, events and books are managed in their dedicated sections.</p></div>
      </section>

      {error && <div role="alert" className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800"><TriangleAlert size={17} className="mt-0.5 shrink-0" /><div><p className="m-0 font-semibold">Impossible de charger ou d’enregistrer le contenu</p><p className="mb-0 mt-1">{error}</p>{(error.includes("site_page_content") || error.includes("schema cache")) && <p className="mb-0 mt-2">Exécutez le bloc « Contenu des pages » de <code>supabase/migration.sql</code> dans le SQL Editor du projet Supabase.</p>}</div></div>}
      {notice && <p role="status" className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}

      <section className="rounded-xl border border-border bg-white shadow-sm">
        {loading ? <p className="p-10 text-center text-sm text-slate">Chargement du contenu…</p> : (
          <div className="divide-y divide-border">
            {page.fields.map((field) => <div key={field.key} className="block px-5 py-4 sm:px-6">
              <span className="mb-1.5 block text-xs font-semibold text-navy">{field.label}</span>
              {field.type === "image" ? <div className="flex flex-wrap items-center gap-4">
                <div className="h-28 w-40 overflow-hidden rounded-md border border-border bg-paper">
                  {values[field.key] ? <img src={values[field.key]} alt={`Aperçu : ${field.label}`} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-xs text-slate">Aucune image</div>}
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-navy hover:bg-paper">
                  <ImagePlus size={16} />{uploading ? "Téléversement…" : "Choisir une image"}
                  <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} className="sr-only" onChange={(event) => { void uploadImage(field.key, event.target.files?.[0]); event.currentTarget.value = ""; }} />
                </label>
                <span className="text-xs text-slate">JPEG, PNG ou WebP · 5 Mo maximum</span>
              </div> : <textarea value={values[field.key] ?? field.value} onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))} rows={field.value.length > 190 ? 4 : field.value.includes("\n") ? 2 : 3} className="block w-full resize-y rounded-md border border-border bg-white px-3 py-2.5 text-sm leading-6 text-slate outline-none focus:border-gold" />}
              {field.type !== "image" && field.value.includes("\n") && <span className="mt-1 block text-[10px] text-slate">Les retours à la ligne sont conservés.</span>}
            </div>)}
          </div>
        )}
      </section>

      <div className="sticky bottom-4 flex flex-wrap items-center justify-end gap-3 rounded-xl border border-border bg-white/95 p-3 shadow-lg backdrop-blur">
        <span className="mr-auto hidden text-xs text-slate sm:inline">{stored?.updated_at ? `Dernière sauvegarde : ${new Date(stored.updated_at).toLocaleString("en-GB")}` : "Aucune sauvegarde CMS pour cette page"}</span>
        <button type="button" disabled={loading || saving || uploading} onClick={() => void saveDraft()} className="inline-flex items-center gap-2 rounded-md border border-border bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:bg-paper disabled:opacity-50"><Save size={15} />{saving ? "Enregistrement…" : "Enregistrer le brouillon"}</button>
        <button type="button" disabled={loading || saving || uploading} onClick={() => void publish()} className="inline-flex items-center gap-2 rounded-md bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-deep disabled:opacity-50"><Send size={15} />{saving ? "Publication…" : "Publier"}</button>
      </div>
    </div>
  );
}

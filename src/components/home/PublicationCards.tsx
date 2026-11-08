"use client";

import { useEffect, useState } from "react";
import { BookOpen, CalendarDays, X } from "lucide-react";

type Publication = {
  id: string;
  title: string;
  brief: string | null;
  category: string | null;
  image_url: string | null;
  created_at: string;
};

export function PublicationCards({ books }: { books: Publication[] }) {
  const [selected, setSelected] = useState<Publication | null>(null);

  useEffect(() => {
    if (!selected) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selected]);

  return (
    <>
      <div className="home-publication-grid">
        {books.map((book) => (
          <button
            type="button"
            key={book.id}
            className="home-publication-card"
            onClick={() => setSelected(book)}
            aria-haspopup="dialog"
            aria-label={`Voir les détails de ${book.title}`}
          >
            <span className="home-publication-thumb">
              {book.image_url ? <img src={book.image_url} alt={`Couverture de ${book.title}`} /> : <BookOpen size={42} color="var(--gold)" strokeWidth={1.2} />}
            </span>
            <span className="home-publication-copy">
              <span className="home-publication-category">{book.category || "Publication"}</span>
              <span className="home-publication-title">{book.title}</span>
              {book.brief && <span className="home-publication-brief">{book.brief}</span>}
            </span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="publication-modal-backdrop" onClick={() => setSelected(null)}>
          <section className="publication-modal" role="dialog" aria-modal="true" aria-labelledby="publication-modal-title" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="publication-modal-close" onClick={() => setSelected(null)} aria-label="Fermer les détails">
              <X size={19} />
            </button>
            <div className="publication-modal-cover">
              {selected.image_url ? <img src={selected.image_url} alt={`Couverture de ${selected.title}`} /> : <BookOpen size={58} color="var(--gold)" strokeWidth={1.2} />}
            </div>
            <div className="publication-modal-details">
              <span className="home-publication-category">{selected.category || "Publication"}</span>
              <h2 id="publication-modal-title">{selected.title}</h2>
              <div className="publication-modal-date"><CalendarDays size={15} /> Publié le {new Date(selected.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}</div>
              <p>{selected.brief || "Aucun résumé n’a été ajouté pour cette publication."}</p>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

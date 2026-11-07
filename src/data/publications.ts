// FUTURE DYNAMIC INTEGRATION:
// Publications will be fetched from Supabase (table: publications) instead of this static array.

import type { Publication } from "./types";

export const publications: Publication[] = [
  {
    id: "pub-1",
    title: "Titre de publication (placeholder)",
    description: "Ouvrage illustratif portant sur le développement, le leadership et les enjeux de société.",
    cover: { src: "https://picsum.photos/seed/pub1/400/600", alt: "Couverture 1", width: 400, height: 600 },
    date: "2026",
    language: "Français",
    placeholder: true,
  },
  {
    id: "pub-2",
    title: "Titre de publication (placeholder)",
    description: "Réflexions sur l'entrepreneuriat et la création de valeur durable.",
    cover: { src: "https://picsum.photos/seed/pub2/400/600", alt: "Couverture 2", width: 400, height: 600 },
    date: "2026",
    language: "Français",
    placeholder: true,
  },
  {
    id: "pub-3",
    title: "Titre de publication (placeholder)",
    description: "Contributions au dialogue autour du développement et de la transformation.",
    cover: { src: "https://picsum.photos/seed/pub3/400/600", alt: "Couverture 3", width: 400, height: 600 },
    date: "2026",
    language: "Français",
    placeholder: true,
  },
];

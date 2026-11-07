// FUTURE DYNAMIC INTEGRATION:
// News articles will be fetched from Supabase (table: articles) instead of this static array.

import type { Article } from "./types";

export const newsArticles: Article[] = [
  {
    id: "news-1",
    title: "Vers une nouvelle dynamique entrepreneuriale en Côte d'Ivoire",
    excerpt:
      "Réflexions sur les leviers du développement économique et le réle des initiatives privées dans la transformation du territoire.",
    category: "Entrepreneuriat",
    date: "2026",
    image: { src: "https://picsum.photos/seed/news1/800/500", alt: "Actualité 1", width: 800, height: 500 },
    slug: "dynamique-entrepreneuriale",
    placeholder: true,
  },
  {
    id: "news-2",
    title: "Engagement social et développement communautaire",
    excerpt:
      "Les actions menées sur le terrain au service de l'éducation, de la solidarité et de l'inclusion.",
    category: "Engagement",
    date: "2026",
    image: { src: "https://picsum.photos/seed/news2/800/500", alt: "Actualité 2", width: 800, height: 500 },
    slug: "engagement-social",
    placeholder: true,
  },
  {
    id: "news-3",
    title: "Dialogue stratégique entre acteurs publics et privés",
    excerpt:
      "Les transformations durables reposent sur la coopération et la convergence des compétences.",
    category: "Institutionnel",
    date: "2026",
    image: { src: "https://picsum.photos/seed/news3/800/500", alt: "Actualité 3", width: 800, height: 500 },
    slug: "dialogue-strategique",
    placeholder: true,
  },
];

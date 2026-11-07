// FUTURE DYNAMIC INTEGRATION:
// Projects will be fetched from Supabase (table: projects) instead of this static array.

import type { Project } from "./types";

export const projects: Project[] = [
  {
    id: "project-1",
    name: "Projet de développement urbain",
    overview:
      "Initiative illustrative visant l'amélioration et la structuration d'un environnement urbain.",
    location: "Côte d'Ivoire",
    scope: "Développement urbain",
    role: "Porteur de vision",
    status: "En cours d'étude",
    image: { src: "https://picsum.photos/seed/project1/800/600", alt: "Projet 1", width: 800, height: 600 },
    outcomes: [],
    placeholder: true,
  },
  {
    id: "project-2",
    name: "Initiative immobiliére",
    overview:
      "Projet immobilier illustratif orienté vers la création de valeur durable.",
    location: "Côte d'Ivoire",
    scope: "Immobilier",
    role: "Porteur de vision",
    status: "Phase exploratoire",
    image: { src: "https://picsum.photos/seed/project2/800/600", alt: "Projet 2", width: 800, height: 600 },
    outcomes: [],
    placeholder: true,
  },
  {
    id: "project-3",
    name: "Projet de développement territorial",
    overview:
      "Initiative illustrative de développement territorial et d'aménagement.",
    location: "Côte d'Ivoire",
    scope: "Développement territorial",
    role: "Porteur de vision",
    status: "é l'étude",
    image: { src: "https://picsum.photos/seed/project3/800/600", alt: "Projet 3", width: 800, height: 600 },
    outcomes: [],
    placeholder: true,
  },
];

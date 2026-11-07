// FUTURE DYNAMIC INTEGRATION:
// Profile content will eventually be managed through the CMS/backend.

import type { Profile } from "./types";

export const profile: Profile = {
  name: "Touré Ahmed Bouah",
  title: "Entrepreneur, auteur & philanthrope",
  location: "Abidjan, Côte d'Ivoire",
  portrait: {
    src: "/images/portrait.jpg",
    alt: "Portrait professionnel de Touré Ahmed Bouah",
    width: 800,
    height: 1000,
  },
  positioning:
    "Bétir aujourd'hui les fondations des transformations de demain.",
  designations: ["Entrepreneur", "Auteur", "Philanthrope"],
};

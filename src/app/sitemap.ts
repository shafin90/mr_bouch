import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://toure-ahmed-bouah.example";
  const routes = [
    "",
    "/biographie",
    "/entrepreneuriat",
    "/engagements",
    "/actualites",
    "/rendez-vous",
  ];
  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}

// FUTURE DYNAMIC INTEGRATION:
// These types describe frontend content models. They will eventually
// map to CMS/backend entities. Keep them stable when connecting APIs.

export type Locale = "fr" | "en" | "es" | "pt";

export interface MediaAsset {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface Profile {
  name: string;
  title: string;
  location: string;
  portrait: MediaAsset;
  positioning: string;
  designations: string[];
}

export interface BiographySection {
  id: string;
  heading: string;
  body: string[];
}

export interface CareerMilestone {
  id: string;
  year: string;
  title: string;
  organization?: string;
  description: string;
  placeholder?: boolean;
}

export interface Organization {
  id: string;
  name: string;
  tagline: string;
  description: string;
  role: string;
  focus: string[];
  url?: string;
}

export interface Project {
  id: string;
  name: string;
  overview: string;
  location: string;
  scope: string;
  role: string;
  status: string;
  image: MediaAsset;
  outcomes: string[];
  placeholder?: boolean;
}

export interface FoundationInitiative {
  id: string;
  title: string;
  description: string;
  focusArea: string;
  image?: MediaAsset;
  placeholder?: boolean;
}

export interface ImpactStory {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  image: MediaAsset;
  placeholder?: boolean;
}

export interface Publication {
  id: string;
  title: string;
  description: string;
  cover: MediaAsset;
  date: string;
  publisher?: string;
  language: string;
  url?: string;
  featured?: boolean;
  placeholder?: boolean;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  image: MediaAsset;
  slug: string;
  placeholder?: boolean;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  audience: string;
  expectations: string[];
  image: MediaAsset;
  registrationUrl?: string;
  status: "upcoming" | "past";
  placeholder?: boolean;
}

export interface Reference {
  id: string;
  name: string;
  type: "media" | "institution" | "recognition" | "publication";
  description: string;
  url?: string;
  placeholder?: boolean;
}

export interface ContactInquiry {
  type: "business" | "institutional" | "general";
  name: string;
  email: string;
  organization?: string;
  message: string;
}

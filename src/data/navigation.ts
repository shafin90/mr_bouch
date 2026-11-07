// FUTURE DYNAMIC INTEGRATION:
// Navigation labels and links may eventually be managed for localization.

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export const mainNav: NavItem[] = [
  { label: "Accueil", href: "/" },
  { label: "Biographie", href: "/biographie" },
  { label: "Entrepreneuriat", href: "/entrepreneuriat" },
  { label: "Engagements", href: "/engagements" },
  { label: "Actualités", href: "/actualites" },
];

export const socialLinks = [
  { label: "Facebook", href: "https://web.facebook.com/profile.php?id=100068990936782" },
  { label: "Instagram", href: "https://www.instagram.com/toureahmedbouah/" },
  { label: "TikTok", href: "https://www.tiktok.com/@toureahmedbouah" },
  { label: "YouTube", href: "https://www.youtube.com/@toureahmedbouah" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/tour%C3%A9-ahmed-bouah-officiel-6a2a24235/" },
];

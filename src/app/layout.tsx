import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { getPublishedPageContent } from "@/lib/site-content";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Touré Ahmed Bouah | Entrepreneur, author & philanthropist",
  description:
    "Public profile, projects and news about Touré Ahmed Bouah, CEO of SOPHIA S.A.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const sharedContent = await getPublishedPageContent("shared");
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" style={{ background: "var(--paper)", color: "var(--ink)" }}>
        <SiteChrome sharedContent={sharedContent}>{children}</SiteChrome>
      </body>
    </html>
  );
}

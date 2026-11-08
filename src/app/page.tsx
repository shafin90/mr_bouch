import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { BusinessProjectsSection } from "@/components/home/BusinessProjectsSection";
import { EngagementsSection } from "@/components/home/EngagementsSection";
import { PublicationsSection } from "@/components/home/PublicationsSection";
import { NewsSection } from "@/components/home/NewsSection";
import { MeetingCtaSection } from "@/components/home/MeetingCtaSection";
import { UpcomingEventsSection } from "@/components/home/UpcomingEventsSection";

export const metadata: Metadata = {
  title: "Touré Ahmed Bouah — Entrepreneur, auteur & philanthrope",
  description:
    "Site officiel de Touré Ahmed Bouah : entrepreneur, auteur et philanthrope basé en Côte d'Ivoire.",
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <BusinessProjectsSection />
      <UpcomingEventsSection />
      <EngagementsSection />
      <NewsSection />
      <PublicationsSection />
      <MeetingCtaSection />
    </>
  );
}

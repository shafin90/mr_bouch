"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export function SiteChrome({ children, sharedContent }: { children: React.ReactNode; sharedContent: Record<string, string> }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  return (
    <>
      {!isAdmin && <Header />}
      <main className={isAdmin ? "" : ""}>{children}</main>
      {!isAdmin && <Footer content={sharedContent} />}
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export function AdminLayoutGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(!isLoginPage);

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false);
      return;
    }

    let active = true;
    createClient().auth.getUser().then(({ data, error }) => {
      if (!active) return;
      if (error || !data.user) {
        router.replace("/admin/login");
        return;
      }
      setAuthorized(true);
      setChecking(false);
    });

    return () => { active = false; };
  }, [isLoginPage, router]);

  if (isLoginPage) return <>{children}</>;
  if (checking || !authorized) {
    return (
      <div role="status" style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--paper)", color: "var(--muted)", fontSize: 14 }}>
        Checking your session…
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--paper)" }}>
      <AdminSidebar />
      <div style={{ display: "flex", flex: 1, flexDirection: "column", minWidth: 0 }}>
        <header style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", background: "#fff", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".14em", color: "var(--gold)" }}>SOPHIA S.A.</span>
            <span style={{ color: "var(--border)" }}>|</span>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>Site administration</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>Admin console</span>
          </div>
        </header>
        <main style={{ flex: 1, padding: "clamp(24px, 4vw, 40px)", overflowY: "auto" }}>{children}</main>
      </div>
    </div>
  );
}

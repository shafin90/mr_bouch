"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Newspaper,
  Calendar,
  Clock,
  Home,
  LogOut,
  ExternalLink,
  BarChart3,
  BookOpen,
  PlusCircle,
  FileText,
} from "lucide-react";

const items = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "News", href: "/admin/news", icon: Newspaper },
  { label: "Events", href: "/admin/events", icon: Calendar },
  { label: "Meetings", href: "/admin/meetings", icon: Clock },
  { label: "Books & essays", href: "/admin/books", icon: BookOpen },
  { label: "Page content", href: "/admin/content", icon: FileText },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside
      style={{
        width: "260px",
        flexShrink: 0,
        background: "var(--navy)",
        borderRight: "1px solid rgba(255, 255, 255, 0.1)",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        alignSelf: "flex-start",
        height: "100vh",
        overflowY: "auto",
      }}
    >
      {/* Brand Header */}
      <div style={{ padding: "28px 24px 24px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              border: "1px solid var(--gold)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--gold)",
              fontWeight: 700,
              fontSize: 13,
              fontFamily: "Georgia, serif",
            }}
          >
            TAB
          </div>
          <div>
            <p style={{ color: "#ffffff", fontWeight: 700, fontSize: "14px", letterSpacing: "0.06em", margin: 0 }}>
              Administration
            </p>
            <p style={{ color: "var(--gold)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", margin: 0, fontWeight: 600 }}>
              Touré Ahmed Bouah
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav style={{ padding: "20px 14px", display: "flex", flexDirection: "column", gap: 6, flexGrow: 1 }}>
        <p style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", fontWeight: 700, padding: "0 10px 6px" }}>
          Main menu
        </p>
        {items.map((item) => {
          const active = pathname === item.href
            || (item.href === "/admin/news" && pathname.startsWith("/admin/news/") && pathname !== "/admin/news/new")
            || (item.href === "/admin/events" && pathname.startsWith("/admin/events/"));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 14px",
                fontSize: "13px",
                fontWeight: active ? 600 : 500,
                color: active ? "var(--gold)" : "rgba(255, 255, 255, 0.85)",
                background: active ? "rgba(179, 137, 56, 0.14)" : "transparent",
                borderLeft: active ? "3px solid var(--gold)" : "3px solid transparent",
                textDecoration: "none",
                transition: "all 0.15s ease",
              }}
              className="hover:bg-white/5 hover:text-white"
            >
              <Icon style={{ width: 16, height: 16, color: active ? "var(--gold)" : "rgba(255, 255, 255, 0.7)" }} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div style={{ margin: "20px 0 10px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: 16 }}>
          <p style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", fontWeight: 700, padding: "0 10px 6px" }}>
            Public site
          </p>
          <Link
            href="/"
            target="_blank"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              fontSize: "12px",
              color: "rgba(255, 255, 255, 0.75)",
              textDecoration: "none",
              transition: "all 0.15s ease",
            }}
            className="hover:bg-white/5 hover:text-white"
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Home style={{ width: 15, height: 15 }} />
              <span>Voir le site</span>
            </div>
            <ExternalLink style={{ width: 12, height: 12, opacity: 0.6 }} />
          </Link>
        </div>
      </nav>

      {/* Footer / Logout */}
      <div style={{ padding: "16px 14px 24px", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
        <button
          onClick={async () => {
            const { createClient } = await import("@/lib/supabase/client");
            const supabase = createClient();
            await supabase.auth.signOut();
            router.push("/admin/login");
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            padding: "10px 14px",
            fontSize: "13px",
            color: "rgba(255, 255, 255, 0.7)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
            transition: "all 0.15s ease",
          }}
          className="hover:bg-white/5 hover:text-red-300"
        >
          <LogOut style={{ width: 15, height: 15 }} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}

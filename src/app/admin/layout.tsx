import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--paper)" }}>
      <AdminSidebar />
      <div style={{ display: "flex", flex: 1, flexDirection: "column", minWidth: 0 }}>
        <header
          style={{
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 32px",
            background: "#ffffff",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--gold)" }}>
              PORTAIL GOUVERNANCE
            </span>
            <span style={{ color: "var(--border)" }}>|</span>
            <span style={{ fontSize: "13px", color: "var(--muted)" }}>
              Cabinet de Touré Ahmed Bouah
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "12px", color: "var(--muted)" }}>
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
            <span>Système actif</span>
          </div>
        </header>
        <main style={{ flex: 1, padding: "clamp(24px, 4vw, 40px)", overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const navigationItems = [
    { label: "Biography", href: "/biographie" },
    { label: "Entrepreneurship", href: "/entrepreneuriat" },
    { label: "Commitments", href: "/engagements" },
    { label: "News", href: "/actualites" },
    { label: "Publications", href: "/publications" },
  ];

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <>
      {/* Fixed Header */}
      <header className="site-header">
        {/* Wordmark */}
        <Link href="/" className="wordmark" aria-label="Touré Ahmed Bouah — Home">
          TOURÉ <span>AHMED BOUAH</span>
        </Link>

        {/* Desktop Nav */}
        <nav
          aria-label="Main navigation"
          className="hidden lg:flex items-center gap-8 mx-auto"
          style={{ letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "12px" }}
        >
          {navigationItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  color: active ? "var(--gold)" : "rgba(255,255,255,0.75)",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontSize: "12px",
                  transition: "color 0.2s",
                  textDecoration: "none",
                }}
                className="hover:text-white"
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA */}
        <div className="ml-auto flex items-center gap-4">
          <Link
            href="/rendez-vous"
            className="btn-primary hidden lg:inline-flex"
            style={{ marginLeft: "auto" }}
          >
            Book a meeting <span aria-hidden="true" style={{ marginLeft: 8 }}>↗</span>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Open menu"
          className="lg:hidden flex flex-col gap-[5px] p-2 w-10"
          onClick={() => setOpen(true)}
          style={{ cursor: "pointer" }}
        >
          <span style={{ background: "#fff", width: "22px", height: "1.5px", display: "block" }} />
          <span style={{ background: "#fff", width: "22px", height: "1.5px", display: "block" }} />
          <span style={{ background: "#fff", width: "22px", height: "1.5px", display: "block" }} />
        </button>
      </header>

      {/* Mobile Menu Drawer */}
      {open && (
        <div
          style={{
            position: "fixed",
            inset: "0 0 0 auto",
            width: "min(88vw, 390px)",
            background: "var(--navy)",
            color: "#fff",
            zIndex: 100,
            padding: "34px 28px",
            boxShadow: "-20px 0 50px rgba(0,0,0,0.4)",
            borderLeft: "1px solid rgba(255,255,255,0.14)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 48 }}>
            <span className="wordmark" style={{ fontSize: 18 }}>TOURÉ <span>AHMED BOUAH</span></span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              style={{ color: "#fff", cursor: "pointer", background: "none", border: "none", fontSize: 24 }}
            >
              ✕
            </button>
          </div>

          <nav aria-label="Mobile navigation" style={{ borderTop: "1px solid rgba(255,255,255,0.15)", display: "flex", flexDirection: "column" }}>
            {[{ label: "Home", href: "/" }, ...navigationItems].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.15)",
                  padding: "20px 0",
                  font: "400 26px/1.2 Georgia, serif",
                  color: "#fff",
                  textDecoration: "none",
                  letterSpacing: "-0.02em",
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/rendez-vous"
            onClick={() => setOpen(false)}
            className="btn-primary"
            style={{ width: "100%", marginTop: 28, justifyContent: "center" }}
          >
            Book a meeting ↗
          </Link>
        </div>
      )}

      {/* Overlay */}
      {open && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 99 }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Spacer for fixed header */}
      <div style={{ height: "80px" }} />
    </>
  );
}

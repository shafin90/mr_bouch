import Link from "next/link";

export function Footer() {
  return (
    <footer style={{ background: "var(--navy)", color: "#fff", paddingTop: "60px" }}>
      <div className="container-x" style={{ paddingBottom: "40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "48px" }}>
          {/* Identity */}
          <div>
            <div className="wordmark" style={{ marginBottom: 20, display: "block" }}>
              TOURÉ <span>AHMED BOUAH</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "13px", lineHeight: 1.75, maxWidth: 280, margin: 0 }}>
              Entrepreneur, auteur et philanthrope. Président-Directeur Général de SOPHIA S.A. et promoteur de la Ville Nouvelle Akwaba City en Côte d&apos;Ivoire.
            </p>
          </div>

          {/* Nav */}
          <div>
            <p style={{ letterSpacing: "0.16em", textTransform: "uppercase", fontSize: "9px", fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>
              Navigation
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "À propos", href: "/biographie" },
                { label: "Entrepreneuriat", href: "/entrepreneuriat" },
                { label: "Engagements", href: "/engagements" },
                { label: "Actualités", href: "/actualites" },
                { label: "Rendez-vous", href: "/rendez-vous" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    style={{ color: "rgba(255,255,255,0.65)", fontSize: "13px", textDecoration: "none", transition: "color 0.2s" }}
                    className="hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p style={{ letterSpacing: "0.16em", textTransform: "uppercase", fontSize: "9px", fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>
              Cabinet &amp; Siège
            </p>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "13px", lineHeight: 1.8, marginBottom: 20 }}>
              <strong style={{ color: "#fff", display: "block", fontWeight: 600 }}>SOPHIA S.A.</strong>
              <span>Cocody 2 Plateaux, Abidjan, Côte d&apos;Ivoire</span>
            </div>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "13px", lineHeight: 1.8 }}>
              <span style={{ display: "block" }}>(+225) 27 22 41 15 68</span>
              <a href="mailto:presidence@sophiasa.net" style={{ color: "var(--gold)", textDecoration: "none" }}>
                presidence@sophiasa.net
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", padding: "20px clamp(1.25rem, 5vw, 3.5rem)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ margin: 0, letterSpacing: "0.13em", textTransform: "uppercase", fontSize: "9px", color: "rgba(255,255,255,0.35)" }}>
            © 2026 Touré Ahmed Bouah. Bâtir pour l&apos;Afrique.
          </p>
          <Link
            href="/admin/login"
            style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)", textDecoration: "none", letterSpacing: "0.1em", textTransform: "uppercase" }}
          >
            Administration
          </Link>
        </div>
      </div>
    </footer>
  );
}

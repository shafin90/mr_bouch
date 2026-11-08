import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { getPublishedPageContent } from "@/lib/site-content";

export async function BackgroundSection() {
  const content = await getPublishedPageContent("home");
  const roles = [
    { num: "01", tag: content.role1Tag, title: content.role1Title, desc: content.role1Desc, href: "/entrepreneuriat", linkText: content.role1Cta },
    { num: "02", tag: content.role2Tag, title: content.role2Title, desc: content.role2Desc, href: "/biographie", linkText: content.role2Cta },
    { num: "03", tag: content.role3Tag, title: content.role3Title, desc: content.role3Desc, href: "/engagements", linkText: content.role3Cta },
  ];
  return (
    <section style={{ background: "var(--paper)", padding: "clamp(70px, 9vw, 110px) 0" }}>
      <div className="container-x">
        {/* Section Header with Clear Scanning Anchor */}
        <div style={{ marginBottom: 52 }}>
          <Reveal>
            <p className="eyebrow-dark">
              <span className="section-marker">01</span> {content.backgroundEyebrow.replace(/^01\s*/, "")}
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 style={{ maxWidth: 640 }}>
              <span style={{ whiteSpace: "pre-line" }}>{content.backgroundTitle}</span>
            </h2>
          </Reveal>
        </div>

        {/* 3-Column Numbered Grid with Balanced Eye-Level Alignment */}
        <div className="path-grid">
          {roles.map((item, idx) => (
            <Reveal key={item.title} delay={idx * 0.1}>
              <article
                style={{
                  paddingRight: idx < 2 ? "32px" : "0",
                  paddingLeft: idx > 0 ? "32px" : "0",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 28 }}>
                  <span className="path-num">{item.num}</span>
                  <span
                    style={{
                      textTransform: "uppercase",
                      letterSpacing: "0.14em",
                      fontSize: "9px",
                      fontWeight: 700,
                      color: "var(--gold)",
                    }}
                  >
                    {item.tag}
                  </span>
                </div>

                <h3 style={{ margin: "0 0 16px", minHeight: "64px" }}>
                  {item.title}
                </h3>

                <p style={{ margin: "0 0 24px", flexGrow: 1, fontSize: "14px", lineHeight: 1.75 }}>
                  {item.desc}
                </p>

                <div style={{ paddingTop: 16, borderTop: "1px solid var(--border-light)" }}>
                  <Link href={item.href} className="text-link">
                    {item.linkText} ↗
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

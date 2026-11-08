/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, BookOpen, BriefcaseBusiness, CalendarDays, PenLine } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { getPublishedPageContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Biographie — Touré Ahmed Bouah",
  description: "Repères biographiques sourcés sur Touré Ahmed Bouah, dirigeant de SOPHIA S.A., promoteur d’Akwaba City et auteur.",
};

const sourceLinks = {
  "2020": "https://www.fratmat.info/article/202333/regions/anyama/akoupe-zeudjiakwaba-city-letat-soutient-toure-ahmed-bouah",
  "2022": "https://www.pressecotedivoire.fr/14073-diplomatie-toure-ahmed-bouah-nomme-consul-de-la-guinee-bissau-en-cote-divoire",
  "2026a": "https://www.fratmat.info/article/2640620/culture/association-des-ecrivains-de-cote-divoire-toure-ahmed-bouah-eleve-au-rang-de-membre-dhonneur",
  "2026b": "https://www.fratmat.info/article/2645492/economie/immobilier-toure-ahmed-bouah-met-fin-au-programme-midd-et-annonce-le-remboursement-de-pres-de-3-milliards-de-fcfa-aux-enseignants",
  "2026c": "https://www.koaci.com/article/2026/11/05/cote-divoire/societe/cote-divoire-toure-ahmed-bouah-appelle-a-repenser-la-gouvernance-des-territoires-et-denonce-un-sabotage-du-projet-akwaba-city_202322.html",
};

export default async function BiographiePage() {
  const content = await getPublishedPageContent("biography");
  const milestones = [
    { period: "29 FÉVRIER 2020", title: content.profileMilestone2020Title, body: content.profileMilestone2020Body, href: sourceLinks["2020"], source: "Fraternité Matin" },
    { period: "JUILLET 2022", title: content.profileMilestone2022Title, body: content.profileMilestone2022Body, href: sourceLinks["2022"], source: "Presse Côte d’Ivoire" },
    { period: "13 MARS 2026", title: content.profileMilestone2026aTitle, body: content.profileMilestone2026aBody, href: sourceLinks["2026a"], source: "Fraternité Matin" },
    { period: "28 OCTOBRE 2026", title: content.profileMilestone2026bTitle, body: content.profileMilestone2026bBody, href: sourceLinks["2026b"], source: "Fraternité Matin" },
    { period: "5 NOVEMBRE 2026", title: content.profileMilestone2026cTitle, body: content.profileMilestone2026cBody, href: sourceLinks["2026c"], source: "KOACI" },
  ];
  const themes = [content.writingTheme1, content.writingTheme2, content.writingTheme3];

  return (
    <main className="biography-page">
      <section className="bio-hero">
        <div className="container-x bio-hero-grid">
          <Reveal>
            <div className="bio-portrait-frame">
              <div className="bio-portrait-outline" />
              {content.portraitImage ? <img src={content.portraitImage} alt="Portrait de Touré Ahmed Bouah" /> : <div className="bio-portrait-fallback" aria-label="Portrait non renseigné">TAB</div>}
              <span className="bio-portrait-caption">Portrait utilisé sur ce site</span>
            </div>
          </Reveal>

          <div className="bio-hero-copy">
            <Reveal><p className="eyebrow">{content.profileEyebrow}</p></Reveal>
            <Reveal delay={0.08}>
              <h1>Touré Ahmed<br /><em>Bouah</em></h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="bio-role"><BriefcaseBusiness size={16} /> {content.profileRole}</p>
            </Reveal>
            <Reveal delay={0.22}>
              <p className="bio-hero-intro">{content.profileIntro}</p>
            </Reveal>
            <Reveal delay={0.28}>
              <div className="bio-hero-actions">
                <a href="#parcours" className="btn-primary">Parcourir les repères <ArrowDown size={15} /></a>
                <Link href="/publications" className="text-link-light">Voir les publications <ArrowUpRight size={15} /></Link>
              </div>
            </Reveal>
          </div>
        </div>
        <div className="container-x bio-fact-strip">
          <div><span>Fonction rapportée</span><strong>Direction de SOPHIA S.A.</strong></div>
          <div><span>Projet associé</span><strong>Akwaba City · Abidjan–Anyama</strong></div>
          <div><span>Distinction culturelle</span><strong>Membre d’honneur de l’AECI · 2026</strong></div>
        </div>
      </section>

      <section id="parcours" className="bio-timeline-section">
        <div className="container-x">
          <div className="bio-section-heading">
            <div>
              <Reveal><p className="eyebrow-dark">Parcours public</p></Reveal>
              <Reveal delay={0.06}><h2>{content.profileTimelineTitle}</h2></Reveal>
            </div>
            <Reveal delay={0.12}><p>{content.profileTimelineIntro}</p></Reveal>
          </div>
          <div className="bio-timeline-grid">
            {milestones.map((milestone, index) => (
              <Reveal key={milestone.period} delay={index * 0.045}>
                <article className="bio-milestone-card">
                  <div className="bio-milestone-date"><CalendarDays size={14} />{milestone.period}</div>
                  <h3>{milestone.title}</h3>
                  <p>{milestone.body}</p>
                  <a href={milestone.href} target="_blank" rel="noreferrer" className="bio-source-link">Source : {milestone.source} <ArrowUpRight size={13} /></a>
                </article>
              </Reveal>
            ))}
          </div>
          <p className="bio-editorial-note">Ces jalons rapportent ce que les sources indiquent à leurs dates de publication. Les annonces de projets, titres et fonctions historiques ne sont pas présentés comme des preuves d’exécution ni comme une confirmation de fonction actuelle.</p>
        </div>
      </section>

      <section className="bio-writing-section">
        <div className="container-x bio-writing-grid">
          <div>
            <Reveal><p className="eyebrow">Écriture & idées</p></Reveal>
            <Reveal delay={0.06}><h2>{content.writingTitle}</h2></Reveal>
            <Reveal delay={0.12}><p className="bio-writing-intro">{content.writingIntro}</p></Reveal>
            <Reveal delay={0.18}><p className="bio-writing-note">{content.writingNote}</p></Reveal>
              <Reveal delay={0.22}><a href={sourceLinks["2026a"]} target="_blank" rel="noreferrer" className="bio-source-link bio-source-link-light">Lire le compte rendu de l’AECI <ArrowUpRight size={13} /></a></Reveal>
          </div>
          <div className="bio-theme-list">
            {themes.map((theme, index) => (
              <Reveal key={theme} delay={index * 0.07}>
                <div className="bio-theme-item"><span>0{index + 1}</span><PenLine size={16} /><strong>{theme}</strong></div>
              </Reveal>
            ))}
            <Reveal delay={0.24}>
              <Link href="/publications" className="bio-publications-link"><BookOpen size={16} />Explorer les livres et essais <ArrowUpRight size={14} /></Link>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bio-cta-section">
        <div className="container-x bio-cta-inner">
          <div>
            <Reveal><p className="eyebrow-dark">Contact</p></Reveal>
            <Reveal delay={0.06}><h2>{content.profileCtaTitle}</h2></Reveal>
            <Reveal delay={0.12}><p>{content.profileCtaBody}</p></Reveal>
          </div>
          <Reveal delay={0.16}><Link href="/rendez-vous" className="btn-primary">{content.profileCtaButton} <ArrowUpRight size={15} /></Link></Reveal>
        </div>
      </section>
    </main>
  );
}

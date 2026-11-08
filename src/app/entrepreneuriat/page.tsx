import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Check, FileSearch, Landmark, MapPinned, Scale, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { getPublishedPageContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Projets & informations investisseurs — SOPHIA S.A.",
  description: "Consultez les projets publiquement annoncés par SOPHIA S.A., leur statut connu et les documents à examiner avant toute décision d'investissement.",
};

const sources = {
  akwaba2020: "https://www.fratmat.info/article/204906/economie/projet-akwaba-city-letat-reaffirme-son-soutien-a-toure-ahmed-bouah",
  akwaba2026: "https://www.koaci.com/article/2026/11/05/cote-divoire/societe/cote-divoire-toure-ahmed-bouah-appelle-a-repenser-la-gouvernance-des-territoires-et-denonce-un-sabotage-du-projet-akwaba-city_202322.html",
  midd2026: "https://www.fratmat.info/article/2645492/economie/immobilier-toure-ahmed-bouah-met-fin-au-programme-midd-et-annonce-le-remboursement-de-pres-de-3-milliards-de-fcfa-aux-enseignants",
};

const diligenceIcons = [MapPinned, Landmark, Scale, ShieldCheck];

export default async function EntrepreneuriatPage() {
  const content = await getPublishedPageContent("entrepreneurship");
  const projects = [1, 2, 3, 4].map((number) => ({
    number,
    title: content[`investorProject${number}Title`],
    body: content[`investorProject${number}Body`],
    status: content[`investorProject${number}Status`],
  }));
  const diligence = [1, 2, 3, 4].map((number) => ({
    title: content[`diligence${number}Title`],
    body: content[`diligence${number}Body`],
    Icon: diligenceIcons[number - 1],
  }));
  const process = [1, 2, 3].map((number) => ({
    number,
    title: content[`processStep${number}`],
    body: content[`processStep${number}Body`],
  }));
  const uploadedAkwabaImage = content.akwabaImage?.includes("/storage/v1/object/public/media/pages/entrepreneurship/")
    ? content.akwabaImage
    : "";

  return (
    <main style={{ background: "var(--paper)" }}>
      <section className="investor-hero">
        <div className="container-x investor-hero-grid">
          <div className="investor-hero-copy">
            <Reveal>
              <p className="eyebrow">{content.investorHeroEyebrow}</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1>{content.investorHeroTitle}</h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="investor-hero-intro">{content.investorHeroIntro}</p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="investor-hero-actions">
                <a href="#projets" className="btn-primary">{content.investorHeroPrimary} <ArrowDown size={15} /></a>
                <Link href="/rendez-vous" className="text-link-light">{content.investorHeroSecondary} <ArrowUpRight size={15} /></Link>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.18}>
            <aside className="investor-brief" aria-label="Résumé de la revue publique">
              <p className="investor-brief-kicker">Lecture des informations publiques</p>
              <div className="investor-brief-stat">
                <strong>4</strong><span>initiatives listées par SOPHIA</span>
              </div>
              <div className="investor-brief-stat">
                <strong>1</strong><span>avec une couverture récente et un statut rapporté</span>
              </div>
              <div className="investor-brief-stat">
                <strong>3</strong><span>sans statut récent corroboré par les sources consultées</span>
              </div>
              <p className="investor-brief-note">Une mention dans un portefeuille ne confirme ni l’approbation, ni le financement, ni l’exécution d’un projet.</p>
            </aside>
          </Reveal>
        </div>
        <div className="container-x investor-source-date"><span className="investor-live-dot" /> Sources consultées jusqu’en novembre 2026 <span aria-hidden="true">·</span> Informations publiques, non offre d’investissement</div>
      </section>

      <section id="projets" className="investor-section">
        <div className="container-x">
          <div className="investor-section-heading">
            <div>
              <Reveal><p className="eyebrow-dark">{content.investorPortfolioEyebrow}</p></Reveal>
              <Reveal delay={0.06}><h2>{content.investorPortfolioTitle}</h2></Reveal>
            </div>
            <Reveal delay={0.12}><p className="investor-section-intro">{content.investorPortfolioIntro}</p></Reveal>
          </div>

          <div className="investor-project-grid">
            {projects.map((project, index) => (
              <Reveal key={project.title} delay={index * 0.05}>
                <article className={`investor-project-card${index === 0 ? " investor-project-card-featured" : ""}`}>
                  <div className="investor-project-meta">
                    <span className="investor-project-number">0{project.number}</span>
                    <span className={`investor-status-pill${index === 0 ? " investor-status-pill-reported" : ""}`}>
                      {index === 0 ? "État rapporté · nov. 2026" : "Référencé par SOPHIA"}
                    </span>
                  </div>
                  <h3>{project.title}</h3>
                  <p className="investor-project-body">{project.body}</p>
                  <div className="investor-project-status"><span>{project.status}</span></div>
                  {index === 0 ? (
                    <a className="investor-source-link" href={sources.akwaba2026} target="_blank" rel="noreferrer">
                      Lire la couverture de KOACI <ArrowUpRight size={14} />
                    </a>
                  ) : (
                    <p className="investor-project-source">Source disponible : déclaration de portefeuille de l’entreprise. Aucun lien de détail fonctionnel ou document indépendant identifié.</p>
                  )}
                </article>
              </Reveal>
            ))}
          </div>

          <div className="investor-portfolio-note">
            <FileSearch size={18} aria-hidden="true" />
            <p>Les trois projets sans source indépendante récente restent des <strong>initiatives déclarées</strong>. Pour les présenter comme des opportunités vérifiables, il faut publier leur emplacement précis, leur dossier administratif et leur état d’exécution.</p>
          </div>
          <p className="investor-bagoue-note">À distinguer : « Structuration de la région de la Bagoué » n’est pas présenté ici comme le programme « Les Merveilles de la Bagoué », dont la revue de presse du gouvernement attribue la promotion à Yamoussa Coulibaly. <a href="https://www.gouv.ci/uploads/publications/1692694807GOUV%20Revue%20de%20Presse%20-%2022%20aout%202023.pdf" target="_blank" rel="noreferrer">Voir la revue de presse gouvernementale <ArrowUpRight size={12} /></a></p>
        </div>
      </section>

      <section id="akwaba" className="investor-evidence-section">
        <div className="container-x">
          <div className="investor-section-heading investor-evidence-heading">
            <div>
              <Reveal><p className="eyebrow">{content.evidenceEyebrow}</p></Reveal>
              <Reveal delay={0.06}><h2>{content.evidenceTitle}</h2></Reveal>
            </div>
            <Reveal delay={0.12}><p className="investor-evidence-intro">{content.evidenceIntro}</p></Reveal>
          </div>

          <div className="investor-evidence-grid">
            <article className="investor-evidence-card">
              <span className="investor-evidence-date">17 MAI 2020 · FRATERNITÉ MATIN</span>
              <h3>Accord de principe et conventions rapportés</h3>
              <p>Fraternité Matin rapporte alors la position du ministère : accord de principe pour le pôle urbain et conventions de concession et autorisations d’aménagement. Ces actes administratifs ne signifient pas, à eux seuls, que le plan détaillé a reçu son approbation finale.</p>
              <a className="investor-source-link" href={sources.akwaba2020} target="_blank" rel="noreferrer">Consulter l’article <ArrowUpRight size={14} /></a>
            </article>
            <article className="investor-evidence-card investor-evidence-card-current">
              <span className="investor-evidence-date">5 NOVEMBRE 2026 · KOACI</span>
              <h3>Le promoteur dit attendre l’approbation du plan</h3>
              <p>Dans une déclaration rapportée par KOACI, Touré Ahmed Bouah indique que le plan d’aménagement n’a pas encore reçu l’aval de l’État. C’est le statut le plus récent repéré dans notre revue publique ; l’article rapporte sa déclaration, il ne constitue pas une confirmation administrative indépendante.</p>
              <a className="investor-source-link" href={sources.akwaba2026} target="_blank" rel="noreferrer">Consulter l’article <ArrowUpRight size={14} /></a>
            </article>
          </div>

          {uploadedAkwabaImage && <figure className="investor-project-figure">
            <img src={uploadedAkwabaImage} alt="Visuel téléversé pour le dossier Akwaba City" />
            <figcaption>Visuel téléversé pour le dossier Akwaba City. Sa date et sa localisation doivent être confirmées avec l’émetteur.</figcaption>
          </figure>}

          <div className="investor-caveat">
            <div className="investor-caveat-icon"><Landmark size={19} /></div>
            <div>
              <strong>Le programme MIDD est distinct du statut global d’Akwaba City.</strong>
              <p>Le 28 octobre 2026, SOPHIA a annoncé l’arrêt du programme immobilier MIDD destiné aux enseignants et une offre de remboursement. Cette annonce concerne ce programme lié à Akwaba City ; ne la présentez pas comme la preuve que l’ensemble du projet est achevé ou annulé.</p>
              <a className="investor-source-link" href={sources.midd2026} target="_blank" rel="noreferrer">Lire le compte rendu de Fraternité Matin <ArrowUpRight size={14} /></a>
            </div>
          </div>

          <p className="investor-area-note">Les superficies publiées ne sont pas accompagnées d’un périmètre comparable dans les sources consultées. Aucun chiffre global n’est repris ici sans plan consolidé et pièce administrative correspondante.</p>
        </div>
      </section>

      <section id="diligence" className="investor-section">
        <div className="container-x">
          <div className="investor-section-heading">
            <div>
              <Reveal><p className="eyebrow-dark">{content.diligenceEyebrow}</p></Reveal>
              <Reveal delay={0.06}><h2>{content.diligenceTitle}</h2></Reveal>
            </div>
            <Reveal delay={0.12}><p className="investor-section-intro">{content.diligenceIntro}</p></Reveal>
          </div>
          <div className="investor-diligence-grid">
            {diligence.map(({ title, body, Icon }, index) => (
              <Reveal key={title} delay={index * 0.05}>
                <article className="investor-diligence-card">
                  <span className="investor-diligence-icon"><Icon size={19} strokeWidth={1.7} /></span>
                  <span className="investor-diligence-number">0{index + 1}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                  <span className="investor-diligence-check"><Check size={14} /> À vérifier pour chaque projet</span>
                </article>
              </Reveal>
            ))}
          </div>
          <p className="investor-disclaimer">Cette page présente des informations publiques et des sujets de vérification. Elle ne constitue ni une offre, ni une sollicitation d’investissement, ni une promesse de rendement. Faites examiner les pièces par vos propres conseils.</p>
        </div>
      </section>

      <section className="investor-process-section">
        <div className="container-x">
          <Reveal><p className="eyebrow">Processus proposé</p></Reveal>
          <Reveal delay={0.06}><h2>{content.processTitle}</h2></Reveal>
          <div className="investor-process-grid">
            {process.map((step, index) => (
              <Reveal key={step.number} delay={index * 0.06}>
                <article className="investor-process-step">
                  <span>0{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="investor-cta-section">
        <div className="container-x investor-cta-inner">
          <div>
            <Reveal><p className="eyebrow-dark">Échange professionnel</p></Reveal>
            <Reveal delay={0.06}><h2>{content.investorClosingTitle}</h2></Reveal>
            <Reveal delay={0.12}><p>{content.investorClosingBody}</p></Reveal>
          </div>
          <Reveal delay={0.16}><Link href="/rendez-vous" className="btn-primary">{content.investorClosingCta} <ArrowUpRight size={15} /></Link></Reveal>
        </div>
      </section>
    </main>
  );
}

import { Play } from "lucide-react";
import { Link } from "react-router-dom";

import { THEMES } from "@shared/domain/themes";
import { ButtonLink } from "@shared/ui/Button";

import { QUESTIONS } from "@modules/quiz/bank";

import { MODULES } from "./modules";

export function HubPage() {
  return (
    <div className="page">
      <section className="hub-hero">
        <p className="hub-hero__eyebrow">
          Quiz entre amis · en famille · en solo
        </p>
        <h1>
          Des questions qui ressemblent{" "}
          <span className="hub-hero__accent">à vos joueurs</span>.
        </h1>
        <p className="hub-hero__lead">
          Chacun choisit ses thèmes et son niveau ; la partie mélange les
          centres d’intérêt de tout le monde, sans jamais servir deux fois la
          même question.
        </p>
        <div className="row">
          <ButtonLink to="/quiz" variant="primary" size="lg" icon={<Play />}>
            Lancer une partie
          </ButtonLink>
          <ButtonLink to="/profils/nouveau" size="lg">
            Créer un joueur
          </ButtonLink>
        </div>
        <p className="muted">
          {QUESTIONS.length} questions · {THEMES.length} thèmes · 10 niveaux de
          difficulté
        </p>
      </section>

      <section aria-labelledby="modules-title">
        <h2 id="modules-title" className="section-title">
          Le hub
        </h2>
        <ul className="hub-modules">
          {MODULES.map((module) => {
            const content = (
              <>
                <module.icon className="hub-module__icon" aria-hidden="true" />
                <div>
                  <div className="row">
                    <strong>{module.title}</strong>
                    {module.status === "soon" ? (
                      <span className="badge">Bientôt</span>
                    ) : null}
                  </div>
                  <p className="muted">{module.tagline}</p>
                </div>
              </>
            );
            return (
              <li key={module.id}>
                {module.status === "live" && module.path ? (
                  <Link to={module.path} className="card hub-module">
                    {content}
                  </Link>
                ) : (
                  <div className="card hub-module hub-module--soon">
                    {content}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

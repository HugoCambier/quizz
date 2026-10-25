import type { LucideIcon } from "lucide-react";
import { Globe2, PenLine, Sparkles, Users } from "lucide-react";
import type { RouteObject } from "react-router-dom";

import { ContributePage } from "@modules/contributions/ui/ContributePage";
import { ProfileEditorPage } from "@modules/profiles/ui/ProfileEditorPage";
import { ProfilesPage } from "@modules/profiles/ui/ProfilesPage";
import { QuizPlayPage } from "@modules/quiz/ui/QuizPlayPage";
import { QuizResultsPage } from "@modules/quiz/ui/QuizResultsPage";
import { QuizSetupPage } from "@modules/quiz/ui/QuizSetupPage";

/**
 * The hub: every module the app offers, live or announced. Adding a module is
 * one entry here (its card on the home page, its routes, its menu item);
 * nothing else in the shell changes.
 */
export interface HubModule {
  id: string;
  title: string;
  tagline: string;
  icon: LucideIcon;
  status: "live" | "soon";
  /** Entry page, for the home card and the menu (live modules). */
  path?: string;
  /** Shown in the top menu. */
  inMenu?: boolean;
  routes?: RouteObject[];
}

export const MODULES: readonly HubModule[] = [
  {
    id: "quiz",
    title: "Quiz",
    tagline:
      "Soirée, famille ou solo : des questions taillées pour les joueurs autour de la table.",
    icon: Sparkles,
    status: "live",
    path: "/quiz",
    inMenu: true,
    routes: [
      { path: "/quiz", element: <QuizSetupPage /> },
      { path: "/quiz/partie", element: <QuizPlayPage /> },
      { path: "/quiz/resultats", element: <QuizResultsPage /> },
    ],
  },
  {
    id: "profiles",
    title: "Joueurs",
    tagline:
      "Un profil par joueur : centres d’intérêt, niveau, réussite par thème.",
    icon: Users,
    status: "live",
    path: "/profils",
    inMenu: true,
    routes: [
      { path: "/profils", element: <ProfilesPage /> },
      { path: "/profils/nouveau", element: <ProfileEditorPage /> },
      { path: "/profils/:id", element: <ProfileEditorPage /> },
    ],
  },
  {
    id: "contributions",
    title: "Contribuer",
    tagline:
      "Propose tes questions, commente, signale une erreur : la banque grandit avec vous.",
    icon: PenLine,
    status: "live",
    path: "/contribuer",
    inMenu: true,
    routes: [{ path: "/contribuer", element: <ContributePage /> }],
  },
  {
    id: "online",
    title: "Salon en ligne",
    tagline:
      "Un code, chacun sur son téléphone, et les défis contre le reste du monde.",
    icon: Globe2,
    status: "soon",
  },
];

# ADR 0001 : application web statique, domaine en TypeScript pur

Date : 2026-10-25 · Statut : acceptée

## Contexte

Le prototype (quiz-trentenaires) est un Next.js exporté en statique avec 300 questions embarquées.
L'objectif est d'en faire un hub (quiz, révision, planning, jeu en ligne) maintenable dans la durée,
avec les standards de qualité de web.data-scorecards.

## Décision

- Vite + React 18 + TypeScript strict, en SPA statique avec hash router, hébergée sur GitHub Pages.
  Pas de SSR : aucun besoin de SEO sur l'écran de jeu, et l'hébergement reste gratuit et simple.
- Le domaine (deck, session, score, stats, contributions) est écrit en TS pur sans React et testé
  exhaustivement. L'UI n'en est qu'une projection, ce qui permettra un jour une app mobile (React
  Native) ou un serveur de salons réutilisant le même code.
- Les données passent par des ports : le stockage local aujourd'hui, Supabase demain. Les tests utilisent `memoryStore`.
- L'outillage reprend web.data-scorecards : ESLint 9 strict type-checked, Prettier, Vitest et Testing Library.
- Le CSS est fait de tokens et de feuilles préfixées par module, sans framework CSS : la v1 n'a pas
  besoin de plus et le design system reste lisible.

## Conséquences

- La banque de questions est embarquée dans le bundle (environ 150 ko). Au-delà de quelques milliers de
  questions, il faudra la charger par thème à la demande, ou depuis le backend.
- Le jeu multi-appareils et les comptes demandent un backend (ADR 0002).

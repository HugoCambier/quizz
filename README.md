# Quizz

Un hub de jeux et d'apprentissage parti d'un quiz de soirée. Chaque joueur a un
profil (centres d'intérêt, niveau), et la partie compose ses questions à partir
des goûts de tous les joueurs autour de la table, sans jamais resservir deux fois
la même.

- **Soirée** : un animateur lit, il donne le point au plus rapide, la difficulté monte au fil de la partie.
- **Famille** : chacun son tour et chacun à son niveau. L'enfant joue au niveau 2, les parents au niveau 7.
- **Entraînement** : seul ou à plusieurs, chacun répond sur l'écran.
- **Équipes** : couples, parents contre enfants… Les centres d'intérêt de chaque équipe sont l'union de ceux de ses membres.
- **Contributions** : proposer une question, la commenter, la signaler. Chaque contribution est signée par son auteur.

360 questions, 12 thèmes et 10 niveaux. La banque de départ reprend les
300 questions de [quiz-trentenaires](https://mrthomaslef.github.io/quiz-trentenaires/),
plus un pack Famille (animaux, dessins animés).

## Démarrer

```bash
nvm use            # Node 22
npm install
npm run dev        # http://localhost:5173
```

| Commande        | Rôle                                                   |
| --------------- | ------------------------------------------------------ |
| `npm run dev`   | serveur de dev Vite (HMR)                              |
| `npm run check` | tout ce que fait la CI : typecheck, lint, tests, build |
| `npm run test`  | Vitest (domaine + parcours complet dans jsdom)         |
| `npm run lint`  | ESLint (règles strictes typées) + Prettier             |
| `npm run fmt`   | formate et corrige ce qui peut l'être                  |
| `npm run build` | build de production dans `dist/`                       |

## Architecture en bref

```
src/
  app/          shell : composition des adapters, routes, layout, accueil du hub, registre des modules
  shared/       transverse : thèmes et niveaux (domaine commun), RNG, port de stockage, UI kit, design tokens
  modules/
    quiz/          domain/ (deck, session, score : TS pur) · bank/ (questions JSON + schéma) · data/ · ui/
    profiles/      domain/ (profil, stats) · data/ (repository) · ui/
    contributions/ domain/ (propositions, signalements, commentaires, compte) · data/ · ui/
tests/          miroir de src/
docs/           roadmap, ADR
```

Le détail est dans [CLAUDE.md](CLAUDE.md) et [.claude/guidelines/](.claude/guidelines/).
La vision produit est dans [docs/roadmap.md](docs/roadmap.md).

## Déploiement

Chaque push sur `main` déploie sur GitHub Pages via
[.github/workflows/deploy.yml](.github/workflows/deploy.yml). À activer une fois
dans Settings › Pages › Source : « GitHub Actions ».

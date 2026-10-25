# Workflow

1. Branch from `main`: `feat/…`, `fix/…`, `docs/…`, `chore/…`, `content/…` (questions only).
2. Change one thing; small pull requests.
3. `npm run check` must be green (typecheck, ESLint + Prettier, Vitest, build). A red check is fixed,
   not skipped. Domain changes come with tests.
4. Look at it: `npm run dev`, phone width too.
5. Commit with a Conventional Commit in English (`feat(quiz): progressive difficulty`).
6. Before pushing, polish the branch's diff once (simplify, then style), re-run the checks, commit
   `refactor:` / `style:`.
7. Ask before pushing or opening a PR. CI (`.github/workflows/ci.yml`) runs the same checks; a merge on
   `main` deploys to GitHub Pages.

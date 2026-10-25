---
name: add-module
description: Scaffold a new hub module (e.g. online rooms) following the src/modules/<module>/{domain,data,ui} layout and register it in src/app/modules.tsx. Use when asked to "ajouter un module", "créer la section X".
---

# Add a hub module

1. Read `.claude/guidelines/architecture.md`.
2. Create `src/modules/<module>/domain/` first: types and pure functions, with tests under
   `tests/modules/<module>/`. Reuse `@shared/domain/themes` and `levels` rather than new catalogues.
3. Persistence: a repository in `data/` over `KeyValueStore` (async if the data is shared between users).
   Versioned keys `quizz.<module>.v1`, zod schemas for everything read back.
4. UI in `ui/`: pages, a provider if state is shared across pages, `<module>.css` with a short prefix.
5. Register it in `src/app/modules.tsx` (title, tagline, lucide icon, `status: "live"`, path, routes,
   `inMenu`). If it replaces a `soon` entry, edit that entry instead of adding one. Mount its provider in
   `src/app/App.tsx` if it has one.
6. `npm run check`, look at it in `npm run dev`, commit `feat(<module>): …`.

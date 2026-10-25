# Architecture

## Layers

```
src/app/        composition root: picks the adapters, mounts providers, builds routes from the module registry
src/shared/     used by several modules: domain/ (themes, levels), lib/ (seeded RNG, ids), storage/ (port),
                ui/ (Button, Avatar, LevelSlider, ThemePicker…), styles/ (tokens, base, components)
src/modules/<module>/
  domain/       pure TypeScript: types, rules, no React, no storage, no Vite APIs. Tested exhaustively.
  data/         repositories: the module's persistence through the `KeyValueStore` port (or a remote API)
  bank/         (quiz) the question files and their zod schema
  ui/           React pages, components, the module's provider, `<module>.css` with a prefix
```

Dependency rule: `ui → data → domain → shared`. A domain never imports React or a repository. A module
may import another module's **domain** (the quiz reads `profiles/domain/stats` types) and, in UI, its
provider hook; never its internals beyond that.

## The hub registry

`src/app/modules.tsx` lists every module: title, tagline, icon, status (`live` | `soon`), entry path,
menu flag, routes. The home page cards, the top menu and the router are all built from it. Adding a
module = one entry (see the `add-module` skill).

## Persistence

- `KeyValueStore` (`shared/storage`) is the port; `browserStore()` (localStorage) and `memoryStore()`
  (tests) the adapters. `App` receives the store as a prop: tests inject `memoryStore()`.
- Every stored value is read through a zod schema (`readJson`): corrupted or outdated data falls back
  to a default instead of crashing. Keys are versioned (`quizz.profiles.v1`); a breaking schema change
  takes a new key.
- Contributions are shared by nature: their repository is **async** so the local adapter can be swapped
  for Supabase without touching the UI (ADR 0002). Profiles will follow when accounts arrive.
- The game in progress lives in `sessionStorage` (survives a reload, not a new tab).

## The quiz engine

- `buildDeck` plans the whole game up front from a **seed**: same seed + players + bank = same
  questions. That is what will make online rooms and "same questions as your friends" challenges cheap:
  share the seed, not the questions.
- Variety rules (tested in `tests/modules/quiz/deck.test.ts`): theme drawn among the concerned
  competitors' interests, least used relative to how many share it; never the same theme twice in a row
  when avoidable; no repeat in a game; questions seen in earlier games only once the rest ran out.
- Difficulty: `range`, `per-player` (each competitor at its level), `progressive`.
- `gameReducer` is the only way a game changes; an action out of place returns the same state.
- `standings` and `answerRecords` are derived, never stored.

## Tests

`tests/` mirrors `src/`. Domain: properties, not snapshots. One end-to-end flow
(`tests/app/flow.test.tsx`) drives the real app in jsdom. Shared fixtures in `tests/factories.ts`.

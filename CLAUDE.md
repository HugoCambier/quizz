# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Guidelines (loaded every session)

@.claude/guidelines/architecture.md
@.claude/guidelines/content.md
@.claude/guidelines/design-system.md
@.claude/guidelines/workflow.md

Skills: `add-questions`, `add-module` (`.claude/skills/`).
Product vision and next steps: `docs/roadmap.md`; decisions: `docs/adr/`.

## Project overview

Quizz is a personal project (not Ornikar): a hub of games and learning tools that starts from a party
quiz. Players have profiles (interests, level); a game builds its questions from the interests of the
players at the table, at the difficulty chosen, never serving the same question twice. Anyone can
propose, comment and report questions; contributions are signed by an account (local pseudonym today,
real login later, see ADR 0002).

## Tech stack

- Vite 5 + React 18 + TypeScript (strict, `noUncheckedIndexedAccess`), react-router 6 (hash router)
- zod for every boundary (question files, stored data, forms), lucide-react icons
- Plain CSS: design tokens + shared components + one prefixed stylesheet per module
- Vitest + Testing Library (jsdom), ESLint 9 strict type-checked + Prettier (same config as web.data-scorecards)
- Static hosting on GitHub Pages; no backend yet (local storage behind ports)

## Commands

```bash
npm install
npm run dev        # http://localhost:5173
npm run check      # typecheck + lint + tests + build, what CI runs
npm run fmt        # prettier + eslint --fix
```

## Git

Personal repo `HugoCambier/quizz`, author `hugo.cambier96@gmail.com` (set in the local git config, never
the Ornikar address). Conventional Commits in English, no ticket suffix.

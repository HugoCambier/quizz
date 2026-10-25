---
name: add-questions
description: Add questions to the quiz bank — from a topic, a pasted list, or the "Exporter les questions" JSON of community proposals — into src/modules/quiz/bank/questions/<theme>.json with sequential ids, then validate. Use when asked to "ajouter des questions", "enrichir le thème X", "intégrer les propositions".
---

# Add questions

1. Read `.claude/guidelines/content.md` (format, levels, accuracy rules).
2. Pick the theme file; if the theme does not exist, add it to `src/shared/domain/themes.ts` first.
3. Find the last id of the file and continue the sequence (`<theme>-NNN`), never reuse an id.
4. Write each question: 4 distinct options, `answer` index, a one-sentence explanation, a level
   calibrated on the level titles. Spread levels and answer positions. Facts you are sure of only;
   when importing community proposals, check each answer and drop `author`/`source` keys (keep the
   credit in the commit message).
5. Keep the file sorted by difficulty then id is not required; append at the end.
6. Run `npx vitest run tests/modules/quiz/bank.test.ts` then `npm run check`.
7. Commit `content(<theme>): add N questions`.

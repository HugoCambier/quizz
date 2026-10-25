# Content: themes, levels, questions

## Themes

`src/shared/domain/themes.ts` is the catalogue shared by every module. An id (`kebab-case`, French) is
forever: profiles and histories store it. Change the label, never the id. A new theme needs: an entry
(label, emoji, hue, `kids`), a `questions/<id>.json` file (the bank test requires every theme to have
questions).

## Levels

1 to 10 (`src/shared/domain/levels.ts`). Calibrate against the level titles: 1-2 a child or anyone
knows; 5-6 a real challenge for an adult; 9-10 erudition. The family pack uses 1-4.

## Question files

`src/modules/quiz/bank/questions/<theme>.json`:

```json
{
  "theme": "cinema",
  "questions": [
    {
      "id": "cinema-031",
      "difficulty": 4,
      "question": "…?",
      "options": ["…", "…", "…", "…"],
      "answer": 2,
      "explanation": "One sentence that teaches something."
    }
  ]
}
```

- Ids `<theme>-<3 digits>`, sequential, never reused (histories point to them).
- Exactly 4 distinct options; `answer` is the 0-based index. Options are shuffled at play time, so the
  position in the file does not matter, but never write "all of the above".
- Accuracy first: only facts that are certain; avoid records and figures that vary by source.
- The schema (`bank/schema.ts`) and `tests/modules/quiz/bank.test.ts` reject malformed files, duplicate
  ids and duplicate wordings.

## Community contributions

Proposals made in the app are stored as contributions (pending → approved/rejected). "Exporter les
questions" downloads them in a near-bank format (with `author` and `source`); merge approved ones into
the theme file with the next free id (the `add-questions` skill does it).

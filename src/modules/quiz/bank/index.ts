import type { Question } from "../domain/question";

import { questionFileSchema } from "./schema";

/**
 * The question bank: every `questions/<theme>.json`, checked once at load.
 * A malformed file fails loudly (and the bank test fails in CI) rather than
 * reaching a game. Tomorrow a remote source can feed `loadQuestions` too.
 */
export function loadQuestions(files: Record<string, unknown>): Question[] {
  const questions: Question[] = [];
  const ids = new Set<string>();
  for (const [path, content] of Object.entries(files)) {
    const parsed = questionFileSchema.safeParse(content);
    if (!parsed.success) {
      throw new Error(`Invalid question file ${path}: ${parsed.error.message}`);
    }
    for (const question of parsed.data.questions) {
      if (ids.has(question.id)) {
        throw new Error(`Duplicate question id ${question.id} in ${path}`);
      }
      ids.add(question.id);
      questions.push({ ...question, theme: parsed.data.theme });
    }
  }
  return questions;
}

export const QUESTIONS: readonly Question[] = loadQuestions(
  import.meta.glob<unknown>("./questions/*.json", {
    eager: true,
    import: "default",
  }),
);

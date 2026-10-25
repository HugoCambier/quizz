import type { ScoringRule } from "./config";
import type { Question } from "./question";

/** Points a right answer earns: 1, or 1 to 5 by level (1-2 → 1 … 9-10 → 5). */
export function pointsFor(question: Question, rule: ScoringRule): number {
  return rule === "difficulty" ? Math.ceil(question.difficulty / 2) : 1;
}

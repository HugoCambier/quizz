import type { ThemeId } from "@shared/domain/themes";

import type { Competitor } from "@modules/quiz/domain/competitors";
import type { GameConfig } from "@modules/quiz/domain/config";
import type { Question } from "@modules/quiz/domain/question";

export function makeQuestion(
  theme: ThemeId,
  difficulty: number,
  n: number,
): Question {
  return {
    id: `${theme}-${String(n).padStart(3, "0")}`,
    theme,
    difficulty,
    question: `Question ${theme} ${n} ?`,
    options: ["A", "B", "C", "D"],
    answer: n % 4,
    explanation: "Parce que.",
  };
}

/** `perLevel` questions for every level 1-10 of every theme given. */
export function makeBank(themes: readonly ThemeId[], perLevel = 2): Question[] {
  return themes.flatMap((theme) =>
    Array.from({ length: 10 * perLevel }, (_, i) =>
      makeQuestion(theme, Math.floor(i / perLevel) + 1, i + 1),
    ),
  );
}

export function makeCompetitor(
  id: string,
  interests: readonly ThemeId[] = [],
  level = 5,
): Competitor {
  return {
    id,
    name: id,
    emoji: "🦊",
    color: "#6366f1",
    memberIds: [id],
    interests,
    level,
  };
}

export function makeConfig(patch: Partial<GameConfig> = {}): GameConfig {
  return {
    answerMode: "turns",
    difficulty: { kind: "range", min: 1, max: 10 },
    rounds: 5,
    scoring: "flat",
    seed: 42,
    ...patch,
  };
}

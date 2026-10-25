import { z } from "zod";

import type { ThemeId } from "@shared/domain/themes";

/** One question a player played, as the quiz reports it at the end of a game. */
export interface AnswerRecord {
  questionId: string;
  theme: ThemeId;
  correct: boolean;
}

const themeTallySchema = z.object({
  answered: z.number(),
  correct: z.number(),
});

export const profileStatsSchema = z.object({
  gamesPlayed: z.number(),
  seenQuestionIds: z.array(z.string()),
  themes: z.record(z.string(), themeTallySchema),
});

export type ProfileStats = z.infer<typeof profileStatsSchema>;
export type ThemeTally = z.infer<typeof themeTallySchema>;

/** Past this, the oldest seen questions are forgotten and can come back. */
export const SEEN_HISTORY_LIMIT = 2000;

export function emptyStats(): ProfileStats {
  return { gamesPlayed: 0, seenQuestionIds: [], themes: {} };
}

/** The stats after one more game. */
export function applyGame(
  stats: ProfileStats,
  records: readonly AnswerRecord[],
): ProfileStats {
  const themes = { ...stats.themes };
  for (const record of records) {
    const tally = themes[record.theme] ?? { answered: 0, correct: 0 };
    themes[record.theme] = {
      answered: tally.answered + 1,
      correct: tally.correct + (record.correct ? 1 : 0),
    };
  }
  const played = new Set(records.map((record) => record.questionId));
  const seenQuestionIds = [
    ...stats.seenQuestionIds.filter((id) => !played.has(id)),
    ...played,
  ].slice(-SEEN_HISTORY_LIMIT);
  return { gamesPlayed: stats.gamesPlayed + 1, seenQuestionIds, themes };
}

export function successRate(tally: ThemeTally | undefined): number | null {
  return tally && tally.answered > 0 ? tally.correct / tally.answered : null;
}

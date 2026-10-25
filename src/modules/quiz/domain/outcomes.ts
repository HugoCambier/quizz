import type { AnswerRecord } from "@modules/profiles/domain/stats";

import type { GameState } from "./session";

/**
 * What each player (profile) played in this game, for their history: a turn
 * counts for the members of the competitor it was for; a buzzer question for
 * every player, right when their competitor won it.
 */
export function answerRecords(state: GameState): Map<string, AnswerRecord[]> {
  const records = new Map<string, AnswerRecord[]>();
  state.results.forEach((result, index) => {
    const item = state.deck[index];
    if (!item) return;
    for (const competitor of state.competitors) {
      if (item.competitorId !== null && item.competitorId !== competitor.id)
        continue;
      for (const memberId of competitor.memberIds) {
        const list = records.get(memberId) ?? [];
        list.push({
          questionId: item.question.id,
          theme: item.question.theme,
          correct: result.winnerIds.includes(competitor.id),
        });
        records.set(memberId, list);
      }
    }
  });
  return records;
}

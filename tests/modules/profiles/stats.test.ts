import { memoryStore } from "@shared/storage/keyValueStore";

import { createProfilesRepository } from "@modules/profiles/data/profilesRepository";
import {
  applyGame,
  emptyStats,
  SEEN_HISTORY_LIMIT,
  successRate,
} from "@modules/profiles/domain/stats";

describe("applyGame", () => {
  it("counts games, answers per theme and seen questions", () => {
    let stats = applyGame(emptyStats(), [
      { questionId: "cinema-001", theme: "cinema", correct: true },
      { questionId: "cinema-002", theme: "cinema", correct: false },
    ]);
    stats = applyGame(stats, [
      { questionId: "cinema-001", theme: "cinema", correct: true },
    ]);
    expect(stats.gamesPlayed).toBe(2);
    expect(stats.themes.cinema).toEqual({ answered: 3, correct: 2 });
    expect(stats.seenQuestionIds).toEqual(["cinema-002", "cinema-001"]);
    expect(successRate(stats.themes.cinema)).toBeCloseTo(2 / 3);
    expect(successRate(undefined)).toBeNull();
  });

  it("forgets the oldest seen questions past the limit", () => {
    const records = Array.from({ length: SEEN_HISTORY_LIMIT + 5 }, (_, i) => ({
      questionId: `q-${i}`,
      theme: "cinema" as const,
      correct: true,
    }));
    const stats = applyGame(emptyStats(), records);
    expect(stats.seenQuestionIds).toHaveLength(SEEN_HISTORY_LIMIT);
    expect(stats.seenQuestionIds[0]).toBe("q-5");
  });
});

describe("profiles repository", () => {
  it("drops interests no longer in the catalogue", () => {
    const store = memoryStore();
    store.set(
      "quizz.profiles.v1",
      JSON.stringify([
        {
          id: "1",
          name: "Léa",
          emoji: "🦊",
          color: "#6366f1",
          interests: ["cinema", "astrologie"],
          level: 4,
          createdAt: "2026-10-25T00:00:00.000Z",
        },
      ]),
    );
    expect(
      createProfilesRepository(store).loadProfiles()[0]?.interests,
    ).toEqual(["cinema"]);
  });
});

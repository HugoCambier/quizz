import { buildDeck } from "@modules/quiz/domain/deck";

import { makeBank, makeCompetitor, makeConfig } from "../../factories";

const bank = makeBank(["cinema", "musique", "histoire", "sciences", "animaux"]);

describe("buildDeck", () => {
  it("is deterministic for a seed and varies across seeds", () => {
    const input = {
      questions: bank,
      competitors: [makeCompetitor("a"), makeCompetitor("b")],
      config: makeConfig(),
    };
    const ids = (seed: number) =>
      buildDeck({ ...input, config: makeConfig({ seed }) }).map(
        (item) => item.question.id,
      );
    expect(ids(1)).toEqual(ids(1));
    expect(ids(1)).not.toEqual(ids(2));
  });

  it("plans rounds × competitors questions, never twice the same", () => {
    const deck = buildDeck({
      questions: bank,
      competitors: [
        makeCompetitor("a"),
        makeCompetitor("b"),
        makeCompetitor("c"),
      ],
      config: makeConfig({ rounds: 10 }),
    });
    expect(deck).toHaveLength(30);
    expect(new Set(deck.map((item) => item.question.id)).size).toBe(30);
  });

  it("serves each competitor its own interests, in turn", () => {
    const deck = buildDeck({
      questions: bank,
      competitors: [
        makeCompetitor("a", ["cinema", "musique"]),
        makeCompetitor("b", ["animaux"]),
      ],
      config: makeConfig({ rounds: 6 }),
    });
    deck.forEach((item, index) => {
      expect(item.competitorId).toBe(index % 2 === 0 ? "a" : "b");
      expect(
        item.competitorId === "a" ? ["cinema", "musique"] : ["animaux"],
      ).toContain(item.question.theme);
    });
  });

  it("balances themes and avoids the same theme twice in a row", () => {
    const deck = buildDeck({
      questions: bank,
      competitors: [makeCompetitor("a", ["cinema", "musique", "histoire"])],
      config: makeConfig({ rounds: 9 }),
    });
    const counts = new Map<string, number>();
    deck.forEach((item, index) => {
      counts.set(
        item.question.theme,
        (counts.get(item.question.theme) ?? 0) + 1,
      );
      if (index > 0)
        expect(item.question.theme).not.toBe(deck[index - 1]?.question.theme);
    });
    expect([...counts.values()]).toEqual([3, 3, 3]);
  });

  it("mixes everyone's interests in buzzer mode", () => {
    const deck = buildDeck({
      questions: bank,
      competitors: [
        makeCompetitor("a", ["cinema"]),
        makeCompetitor("b", ["sciences"]),
      ],
      config: makeConfig({ answerMode: "buzzer", rounds: 4 }),
    });
    expect(deck.every((item) => item.competitorId === null)).toBe(true);
    expect(new Set(deck.map((item) => item.question.theme))).toEqual(
      new Set(["cinema", "sciences"]),
    );
  });

  it("uses every theme when a competitor has no interest", () => {
    const deck = buildDeck({
      questions: bank,
      competitors: [makeCompetitor("a")],
      config: makeConfig({ rounds: 10 }),
    });
    expect(new Set(deck.map((item) => item.question.theme)).size).toBe(5);
  });

  it("gives each player questions at their own level", () => {
    const deck = buildDeck({
      questions: bank,
      competitors: [
        makeCompetitor("kid", [], 2),
        makeCompetitor("adult", [], 8),
      ],
      config: makeConfig({ difficulty: { kind: "per-player" }, rounds: 5 }),
    });
    for (const item of deck) {
      expect(item.question.difficulty).toBe(
        item.competitorId === "kid" ? 2 : 8,
      );
    }
  });

  it("keeps a range and climbs in progressive mode", () => {
    const ranged = buildDeck({
      questions: bank,
      competitors: [makeCompetitor("a")],
      config: makeConfig({
        difficulty: { kind: "range", min: 3, max: 5 },
        rounds: 10,
      }),
    });
    expect(
      ranged.every(
        (item) =>
          item.question.difficulty >= 3 && item.question.difficulty <= 5,
      ),
    ).toBe(true);

    const progressive = buildDeck({
      questions: bank,
      competitors: [makeCompetitor("a")],
      config: makeConfig({
        difficulty: { kind: "progressive", from: 1, to: 10 },
        rounds: 10,
      }),
    });
    expect(progressive[0]?.targetLevel).toBe(1);
    expect(progressive.at(-1)?.targetLevel).toBe(10);
  });

  it("serves already seen questions last", () => {
    const small = makeBank(["cinema"], 2);
    const seen = new Set(
      small
        .filter((q) => q.difficulty === 5)
        .slice(0, 1)
        .map((q) => q.id),
    );
    const deck = buildDeck({
      questions: small,
      competitors: [makeCompetitor("a", [], 5)],
      config: makeConfig({ difficulty: { kind: "per-player" }, rounds: 1 }),
      seenQuestionIds: seen,
    });
    expect(seen.has(deck[0]?.question.id ?? "")).toBe(false);
  });

  it("stops when the bank runs out", () => {
    const tiny = makeBank(["cinema"], 1);
    const deck = buildDeck({
      questions: tiny,
      competitors: [makeCompetitor("a")],
      config: makeConfig({ rounds: 50 }),
    });
    expect(deck).toHaveLength(tiny.length);
  });

  it("shuffles options without losing the right answer", () => {
    const deck = buildDeck({
      questions: bank,
      competitors: [makeCompetitor("a")],
      config: makeConfig({ rounds: 20 }),
    });
    for (const item of deck) {
      const original = bank.find((q) => q.id === item.question.id);
      expect(item.question.options[item.question.answer]).toBe(
        original?.options[original.answer],
      );
    }
  });
});

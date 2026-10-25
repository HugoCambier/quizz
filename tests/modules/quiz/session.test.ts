import { teamCompetitors } from "@modules/quiz/domain/competitors";
import { buildDeck } from "@modules/quiz/domain/deck";
import { answerRecords } from "@modules/quiz/domain/outcomes";
import { pointsFor } from "@modules/quiz/domain/scoring";
import type { GameState } from "@modules/quiz/domain/session";
import {
  createGame,
  gameReducer,
  standings,
} from "@modules/quiz/domain/session";

import { makeBank, makeCompetitor, makeConfig } from "../../factories";

const bank = makeBank(["cinema", "musique"]);

function game(answerMode: "turns" | "buzzer", rounds = 1): GameState {
  const competitors = [makeCompetitor("a"), makeCompetitor("b")];
  const config = makeConfig({ answerMode, rounds });
  return createGame(
    config,
    competitors,
    buildDeck({ questions: bank, competitors, config }),
  );
}

function answerOf(state: GameState) {
  const item = state.deck[state.index];
  if (!item) throw new Error("no current question");
  return item.question.answer;
}

describe("turns mode", () => {
  it("scores a right answer for the competitor whose turn it is", () => {
    let state = game("turns");
    state = gameReducer(state, { type: "answer", choice: answerOf(state) });
    expect(state.phase).toBe("revealed");
    expect(state.results[0]?.winnerIds).toEqual(["a"]);

    state = gameReducer(state, { type: "next" });
    state = gameReducer(state, {
      type: "answer",
      choice: (answerOf(state) + 1) % 4,
    });
    expect(state.results[1]?.winnerIds).toEqual([]);

    state = gameReducer(state, { type: "next" });
    expect(state.phase).toBe("finished");
    expect(
      standings(state).map((row) => [row.competitor.id, row.score]),
    ).toEqual([
      ["a", 1],
      ["b", 0],
    ]);
  });

  it("ignores actions out of place", () => {
    const state = game("turns");
    expect(gameReducer(state, { type: "next" })).toBe(state);
    expect(gameReducer(state, { type: "reveal" })).toBe(state);
    const answered = gameReducer(state, { type: "answer", choice: 0 });
    expect(gameReducer(answered, { type: "answer", choice: 1 })).toBe(answered);
  });
});

describe("buzzer mode", () => {
  it("lets the host award one or several competitors after the reveal", () => {
    let state = game("buzzer");
    expect(
      gameReducer(state, { type: "toggleWinner", competitorId: "a" }),
    ).toBe(state);
    state = gameReducer(state, { type: "reveal" });
    state = gameReducer(state, { type: "toggleWinner", competitorId: "a" });
    state = gameReducer(state, { type: "toggleWinner", competitorId: "b" });
    state = gameReducer(state, { type: "toggleWinner", competitorId: "b" });
    expect(state.results[0]?.winnerIds).toEqual(["a"]);
    const rows = standings(state);
    expect(rows[0]).toMatchObject({ score: 1, played: 1, rank: 1 });
    expect(rows[1]).toMatchObject({ score: 0, played: 1, rank: 2 });
  });

  it("ranks ties together", () => {
    let state = game("buzzer");
    state = gameReducer(state, { type: "reveal" });
    state = gameReducer(state, { type: "toggleWinner", competitorId: "a" });
    state = gameReducer(state, { type: "toggleWinner", competitorId: "b" });
    expect(standings(state).map((row) => row.rank)).toEqual([1, 1]);
  });
});

describe("finish and records", () => {
  it("ends early and records only what was played", () => {
    let state = game("turns", 3);
    state = gameReducer(state, { type: "answer", choice: answerOf(state) });
    state = gameReducer(state, { type: "finish" });
    expect(state.phase).toBe("finished");
    const records = answerRecords(state);
    expect(records.get("a")).toHaveLength(1);
    expect(records.get("a")?.[0]?.correct).toBe(true);
    expect(records.has("b")).toBe(false);
  });

  it("credits every team member", () => {
    const players = [
      {
        id: "p1",
        name: "P1",
        emoji: "🦊",
        color: "#000000",
        interests: ["cinema" as const],
        level: 3,
      },
      {
        id: "p2",
        name: "P2",
        emoji: "🐼",
        color: "#000000",
        interests: ["musique" as const],
        level: 8,
      },
      {
        id: "p3",
        name: "P3",
        emoji: "🐯",
        color: "#000000",
        interests: [],
        level: 5,
      },
    ];
    const teams = teamCompetitors(players, { p1: 0, p2: 0, p3: 1 });
    expect(teams).toHaveLength(2);
    expect(teams[0]).toMatchObject({
      memberIds: ["p1", "p2"],
      interests: ["cinema", "musique"],
      level: 6,
    });

    const config = makeConfig({ answerMode: "buzzer", rounds: 1 });
    let state = createGame(
      config,
      teams,
      buildDeck({ questions: bank, competitors: teams, config }),
    );
    state = gameReducer(state, { type: "reveal" });
    state = gameReducer(state, {
      type: "toggleWinner",
      competitorId: teams[0]?.id ?? "",
    });
    const records = answerRecords(state);
    expect(records.get("p1")?.[0]?.correct).toBe(true);
    expect(records.get("p2")?.[0]?.correct).toBe(true);
    expect(records.get("p3")?.[0]?.correct).toBe(false);
  });
});

describe("pointsFor", () => {
  it("gives 1 point flat, 1 to 5 by difficulty", () => {
    const [easy, hard] = [bank[0], bank.find((q) => q.difficulty === 10)];
    if (!easy || !hard) throw new Error("fixture");
    expect(pointsFor(hard, "flat")).toBe(1);
    expect(pointsFor(easy, "difficulty")).toBe(1);
    expect(pointsFor(hard, "difficulty")).toBe(5);
  });
});

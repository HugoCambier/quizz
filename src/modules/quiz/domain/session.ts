import type { Competitor } from "./competitors";
import type { GameConfig } from "./config";
import type { DeckItem } from "./deck";
import { pointsFor } from "./scoring";

/**
 * - `question`: the question is on screen, not answered;
 * - `revealed`: the answer is shown (and, in buzzer mode, the host picks who
 *   found it);
 * - `finished`: the game is over.
 */
export type Phase = "question" | "revealed" | "finished";

export interface TurnResult {
  /** The option picked on the device (turns mode); `null` in buzzer mode. */
  choice: number | null;
  winnerIds: readonly string[];
}

export interface GameState {
  config: GameConfig;
  competitors: readonly Competitor[];
  deck: readonly DeckItem[];
  index: number;
  phase: Phase;
  /** One result per question already revealed, in deck order. */
  results: readonly TurnResult[];
}

export type GameAction =
  | { type: "answer"; choice: number }
  | { type: "reveal" }
  | { type: "toggleWinner"; competitorId: string }
  | { type: "next" }
  | { type: "finish" };

export function createGame(
  config: GameConfig,
  competitors: readonly Competitor[],
  deck: readonly DeckItem[],
): GameState {
  return {
    config,
    competitors,
    deck,
    index: 0,
    phase: deck.length > 0 ? "question" : "finished",
    results: [],
  };
}

/** Every transition of a game; an action out of place leaves it unchanged. */
export function gameReducer(state: GameState, action: GameAction): GameState {
  const item = state.deck[state.index];
  switch (action.type) {
    case "answer": {
      if (state.phase !== "question" || !item?.competitorId) return state;
      const right = action.choice === item.question.answer;
      return {
        ...state,
        phase: "revealed",
        results: [
          ...state.results,
          {
            choice: action.choice,
            winnerIds: right ? [item.competitorId] : [],
          },
        ],
      };
    }
    case "reveal": {
      if (state.phase !== "question" || item?.competitorId !== null) {
        return state;
      }
      return {
        ...state,
        phase: "revealed",
        results: [...state.results, { choice: null, winnerIds: [] }],
      };
    }
    case "toggleWinner": {
      const last = state.results.at(-1);
      if (state.phase !== "revealed" || !last || item?.competitorId !== null)
        return state;
      const winnerIds = last.winnerIds.includes(action.competitorId)
        ? last.winnerIds.filter((id) => id !== action.competitorId)
        : [...last.winnerIds, action.competitorId];
      return {
        ...state,
        results: [...state.results.slice(0, -1), { ...last, winnerIds }],
      };
    }
    case "next": {
      if (state.phase !== "revealed") return state;
      const index = state.index + 1;
      return index < state.deck.length
        ? { ...state, index, phase: "question" }
        : { ...state, phase: "finished" };
    }
    case "finish":
      return state.phase === "finished"
        ? state
        : { ...state, phase: "finished" };
  }
}

export interface Standing {
  competitor: Competitor;
  score: number;
  correct: number;
  /** Questions this competitor played: its turns, or every question in buzzer mode. */
  played: number;
  rank: number;
}

/** The scoreboard, best first; ties share a rank. */
export function standings(state: GameState): Standing[] {
  const rows = state.competitors.map((competitor) => {
    let score = 0;
    let correct = 0;
    let played = 0;
    state.results.forEach((result, index) => {
      const item = state.deck[index];
      if (
        !item ||
        (item.competitorId !== null && item.competitorId !== competitor.id)
      )
        return;
      played += 1;
      if (result.winnerIds.includes(competitor.id)) {
        correct += 1;
        score += pointsFor(item.question, state.config.scoring);
      }
    });
    return { competitor, score, correct, played, rank: 0 };
  });
  rows.sort((a, b) => b.score - a.score || b.correct - a.correct);
  return rows.map((row) => ({
    ...row,
    rank:
      rows.findIndex(
        (other) => other.score === row.score && other.correct === row.correct,
      ) + 1,
  }));
}

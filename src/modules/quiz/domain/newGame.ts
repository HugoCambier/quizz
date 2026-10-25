import type { Competitor, Player } from "./competitors";
import { soloCompetitors, teamCompetitors } from "./competitors";
import type { GameConfig } from "./config";
import { buildDeck } from "./deck";
import type { Question } from "./question";
import type { GameState } from "./session";
import { createGame } from "./session";

export interface NewGameInput {
  players: readonly Player[];
  /** Team index per player id, when playing in teams. */
  teamOf?: Readonly<Record<string, number>>;
  config: GameConfig;
  questions: readonly Question[];
  seenQuestionIds?: ReadonlySet<string>;
}

/** Players → competitors → deck → a game ready to play. */
export function newGame({
  players,
  teamOf,
  config,
  questions,
  seenQuestionIds,
}: NewGameInput): GameState {
  const competitors: Competitor[] = teamOf
    ? teamCompetitors(players, teamOf)
    : soloCompetitors(players);
  const deck = buildDeck({ questions, competitors, config, seenQuestionIds });
  return createGame(config, competitors, deck);
}

/**
 * Same competitors and rules, a fresh deck: the questions of `game` count as
 * seen so the rematch does not serve them again before the others.
 */
export function rematch(
  game: GameState,
  questions: readonly Question[],
  seed: number,
  seenQuestionIds: ReadonlySet<string> = new Set(),
): GameState {
  const seen = new Set([
    ...seenQuestionIds,
    ...game.deck.map((item) => item.question.id),
  ]);
  const config = { ...game.config, seed };
  const deck = buildDeck({
    questions,
    competitors: game.competitors,
    config,
    seenQuestionIds: seen,
  });
  return createGame(config, game.competitors, deck);
}

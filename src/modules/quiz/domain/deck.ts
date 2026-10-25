import { clampLevel } from "@shared/domain/levels";
import type { ThemeId } from "@shared/domain/themes";
import type { Random } from "@shared/lib/random";
import { createRandom, pickOne, shuffle } from "@shared/lib/random";

import type { Competitor } from "./competitors";
import type { DifficultySetting, GameConfig } from "./config";
import type { Question } from "./question";

/** One question of a game, its options shuffled, and who it is for. */
export interface DeckItem {
  question: Question;
  /** The competitor whose turn it is; `null` in buzzer mode (everyone). */
  competitorId: string | null;
  targetLevel: number;
}

export interface DeckInput {
  questions: readonly Question[];
  competitors: readonly Competitor[];
  config: GameConfig;
  /** Questions the players already saw in earlier games, served last. */
  seenQuestionIds?: ReadonlySet<string>;
}

/** Cost of an already seen question, in levels of distance. */
const SEEN_PENALTY = 3;

/**
 * Plans a whole game up front, deterministic from `config.seed`.
 *
 * Variety comes from three rules: a theme is drawn among the interests of the
 * competitor(s) concerned, the least used so far relative to how many share
 * it; the same theme never comes twice in a row when another one is
 * possible; a question is never repeated, and one seen in an earlier game
 * only comes once the others of its level ran out. The deck is shorter than
 * asked only when the whole bank is exhausted.
 */
export function buildDeck({
  questions,
  competitors,
  config,
  seenQuestionIds = new Set(),
}: DeckInput): DeckItem[] {
  const random = createRandom(config.seed);
  const remaining = groupByTheme(questions);
  const usage = new Map<ThemeId, number>();
  const total = config.rounds * competitors.length;
  const deck: DeckItem[] = [];
  let previousTheme: ThemeId | undefined;

  for (let index = 0; index < total; index++) {
    const competitor =
      config.answerMode === "turns"
        ? competitors[index % competitors.length]
        : undefined;
    const concerned = competitor ? [competitor] : competitors;
    const theme = chooseTheme(
      themeWeights(concerned, remaining),
      usage,
      previousTheme,
      random,
    );
    if (!theme) break;

    const targetLevel = targetLevelFor(
      config.difficulty,
      concerned,
      index,
      total,
      random,
    );
    const pool = remaining.get(theme) ?? [];
    const question = closestQuestion(
      pool,
      targetLevel,
      seenQuestionIds,
      random,
    );
    pool.splice(pool.indexOf(question), 1);

    usage.set(theme, (usage.get(theme) ?? 0) + 1);
    previousTheme = theme;
    deck.push({
      question: shuffleOptions(question, random),
      competitorId: competitor?.id ?? null,
      targetLevel,
    });
  }
  return deck;
}

function groupByTheme(
  questions: readonly Question[],
): Map<ThemeId, Question[]> {
  const groups = new Map<ThemeId, Question[]>();
  for (const question of questions) {
    const group = groups.get(question.theme) ?? [];
    group.push(question);
    groups.set(question.theme, group);
  }
  return groups;
}

/**
 * How many of the competitors like each theme that still has questions. When
 * none of their interests has questions left, every remaining theme weighs 1.
 */
function themeWeights(
  competitors: readonly Competitor[],
  remaining: ReadonlyMap<ThemeId, readonly Question[]>,
): Map<ThemeId, number> {
  const weights = new Map<ThemeId, number>();
  for (const competitor of competitors) {
    for (const theme of competitor.interests) {
      if (remaining.get(theme)?.length)
        weights.set(theme, (weights.get(theme) ?? 0) + 1);
    }
  }
  if (weights.size > 0) return weights;
  for (const [theme, pool] of remaining) {
    if (pool.length > 0) weights.set(theme, 1);
  }
  return weights;
}

function chooseTheme(
  weights: ReadonlyMap<ThemeId, number>,
  usage: ReadonlyMap<ThemeId, number>,
  previousTheme: ThemeId | undefined,
  random: Random,
): ThemeId | undefined {
  let candidates = [...weights.keys()];
  if (candidates.length > 1) {
    candidates = candidates.filter((theme) => theme !== previousTheme);
  }
  if (candidates.length === 0) return undefined;
  const load = (theme: ThemeId) =>
    (usage.get(theme) ?? 0) / (weights.get(theme) ?? 1);
  const lowest = Math.min(...candidates.map(load));
  return pickOne(
    random,
    candidates.filter((theme) => load(theme) === lowest),
  );
}

export function targetLevelFor(
  setting: DifficultySetting,
  competitors: readonly Competitor[],
  index: number,
  total: number,
  random: Random,
): number {
  switch (setting.kind) {
    case "range": {
      const min = Math.min(setting.min, setting.max);
      const max = Math.max(setting.min, setting.max);
      return clampLevel(min + Math.floor(random() * (max - min + 1)));
    }
    case "per-player": {
      const sum = competitors.reduce(
        (acc, competitor) => acc + competitor.level,
        0,
      );
      return clampLevel(competitors.length > 0 ? sum / competitors.length : 5);
    }
    case "progressive": {
      const progress = total > 1 ? index / (total - 1) : 0;
      return clampLevel(setting.from + (setting.to - setting.from) * progress);
    }
  }
}

function closestQuestion(
  pool: readonly Question[],
  targetLevel: number,
  seen: ReadonlySet<string>,
  random: Random,
): Question {
  const cost = (question: Question) =>
    Math.abs(question.difficulty - targetLevel) +
    (seen.has(question.id) ? SEEN_PENALTY : 0);
  const lowest = Math.min(...pool.map(cost));
  return pickOne(
    random,
    pool.filter((question) => cost(question) === lowest),
  );
}

function shuffleOptions(question: Question, random: Random): Question {
  const order = shuffle(
    random,
    question.options.map((_, index) => index),
  );
  return {
    ...question,
    options: order.map((index) => question.options[index] ?? ""),
    answer: order.indexOf(question.answer),
  };
}

/**
 * - `turns`: each competitor answers its own question in turn, on the device.
 * - `buzzer`: one question for everyone, read aloud; the host reveals the
 *   answer and gives the point to whoever found it.
 */
export type AnswerMode = "turns" | "buzzer";

/**
 * - `range`: every question between `min` and `max`;
 * - `per-player`: each competitor at its own level (family games: the child
 *   at 2, the parents at 7), the buzzer mode taking the mean level;
 * - `progressive`: from `from` up to `to` over the game.
 */
export type DifficultySetting =
  | { kind: "range"; min: number; max: number }
  | { kind: "per-player" }
  | { kind: "progressive"; from: number; to: number };

/** `flat`: one point a right answer; `difficulty`: 1 to 5 points by level. */
export type ScoringRule = "flat" | "difficulty";

export interface GameConfig {
  answerMode: AnswerMode;
  difficulty: DifficultySetting;
  /** Questions per competitor: the game has `rounds × competitors` questions. */
  rounds: number;
  scoring: ScoringRule;
  /** Seed of the deck: the same seed and players give the same questions. */
  seed: number;
}

export type GamePresetId = "soiree" | "famille" | "solo";

export interface GamePreset {
  id: GamePresetId;
  label: string;
  description: string;
  config: Omit<GameConfig, "seed">;
}

export const GAME_PRESETS: readonly GamePreset[] = [
  {
    id: "soiree",
    label: "Soirée",
    description:
      "Entre amis ou en couples, un animateur lit, le plus rapide marque.",
    config: {
      answerMode: "buzzer",
      difficulty: { kind: "progressive", from: 2, to: 8 },
      rounds: 5,
      scoring: "difficulty",
    },
  },
  {
    id: "famille",
    label: "Famille",
    description:
      "Chacun son tour, chacun à son niveau : petits et grands à égalité.",
    config: {
      answerMode: "turns",
      difficulty: { kind: "per-player" },
      rounds: 5,
      scoring: "flat",
    },
  },
  {
    id: "solo",
    label: "Entraînement",
    description:
      "Seul ou à plusieurs, chacun répond à ses questions sur l’écran.",
    config: {
      answerMode: "turns",
      difficulty: { kind: "range", min: 3, max: 6 },
      rounds: 10,
      scoring: "flat",
    },
  },
];

export const ROUND_CHOICES = [3, 5, 10, 15] as const;

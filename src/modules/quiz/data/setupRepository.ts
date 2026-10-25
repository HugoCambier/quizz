import { z } from "zod";

import type { KeyValueStore } from "@shared/storage/keyValueStore";
import { readJson, writeJson } from "@shared/storage/keyValueStore";

/** The last game's setup, so "same players, same rules" is one click away. */
const SETUP_KEY = "quizz.setup.v1";

const level = z.number().int().min(1).max(10);

const setupSchema = z.object({
  presetId: z.enum(["soiree", "famille", "solo"]),
  playerIds: z.array(z.string()),
  teams: z.boolean(),
  teamOf: z.record(z.string(), z.number().int().min(0)),
  includeCommunity: z.boolean(),
  config: z.object({
    answerMode: z.enum(["turns", "buzzer"]),
    difficulty: z.discriminatedUnion("kind", [
      z.object({ kind: z.literal("range"), min: level, max: level }),
      z.object({ kind: z.literal("per-player") }),
      z.object({ kind: z.literal("progressive"), from: level, to: level }),
    ]),
    rounds: z.number().int().min(1).max(50),
    scoring: z.enum(["flat", "difficulty"]),
  }),
});

export type GameSetup = z.infer<typeof setupSchema>;

export function loadSetup(store: KeyValueStore): GameSetup | null {
  return readJson(store, SETUP_KEY, setupSchema.nullable(), null);
}

export function saveSetup(store: KeyValueStore, setup: GameSetup) {
  writeJson(store, SETUP_KEY, setup);
}

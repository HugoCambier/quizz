import { z } from "zod";

import type { KeyValueStore } from "@shared/storage/keyValueStore";
import { readJson, writeJson } from "@shared/storage/keyValueStore";

import type { Profile } from "../domain/profile";
import { profileSchema } from "../domain/profile";
import type { ProfileStats } from "../domain/stats";
import { profileStatsSchema } from "../domain/stats";

// Versioned keys: a breaking change of a schema gets a new key (and, if the
// data is worth it, a migration reading the old one).
const PROFILES_KEY = "quizz.profiles.v1";
const STATS_KEY = "quizz.stats.v1";

const profilesSchema = z.array(profileSchema);
const statsSchema = z.record(z.string(), profileStatsSchema);

export interface ProfilesRepository {
  loadProfiles: () => Profile[];
  saveProfiles: (profiles: readonly Profile[]) => void;
  loadStats: () => Record<string, ProfileStats>;
  saveStats: (stats: Readonly<Record<string, ProfileStats>>) => void;
}

export function createProfilesRepository(
  store: KeyValueStore,
): ProfilesRepository {
  return {
    loadProfiles: () => readJson(store, PROFILES_KEY, profilesSchema, []),
    saveProfiles: (profiles) => {
      writeJson(store, PROFILES_KEY, profiles);
    },
    loadStats: () => readJson(store, STATS_KEY, statsSchema, {}),
    saveStats: (stats) => {
      writeJson(store, STATS_KEY, stats);
    },
  };
}

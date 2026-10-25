import { z } from "zod";

import { MAX_LEVEL, MIN_LEVEL } from "@shared/domain/levels";
import { isThemeId } from "@shared/domain/themes";

export const profileSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(24),
  emoji: z.string().min(1),
  color: z.string().regex(/^#[0-9a-f]{6}$/i),
  // A theme removed from the catalogue drops out instead of voiding the profile.
  interests: z.array(z.string()).transform((ids) => ids.filter(isThemeId)),
  level: z.number().int().min(MIN_LEVEL).max(MAX_LEVEL),
  createdAt: z.string(),
});

export type Profile = z.infer<typeof profileSchema>;
export type ProfileDraft = Omit<Profile, "id" | "createdAt">;

export const AVATARS = [
  "🦊",
  "🐼",
  "🐯",
  "🦁",
  "🐸",
  "🐙",
  "🦄",
  "🐲",
  "🐻",
  "🐨",
  "🐵",
  "🦉",
  "🐧",
  "🐢",
  "🦖",
  "🐝",
] as const;

export const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
] as const;

export function emptyDraft(existingCount: number): ProfileDraft {
  return {
    name: "",
    emoji: AVATARS[existingCount % AVATARS.length] ?? "🦊",
    color: COLORS[existingCount % COLORS.length] ?? "#6366f1",
    interests: [],
    level: 5,
  };
}

import { clampLevel } from "@shared/domain/levels";
import type { ThemeId } from "@shared/domain/themes";

/** What the quiz needs to know of a player (a profile satisfies it). */
export interface Player {
  id: string;
  name: string;
  emoji: string;
  color: string;
  interests: readonly ThemeId[];
  level: number;
}

/** Who scores: a player alone or a team of players. */
export interface Competitor {
  id: string;
  name: string;
  emoji: string;
  color: string;
  memberIds: readonly string[];
  interests: readonly ThemeId[];
  level: number;
}

export const TEAM_STYLES = [
  { name: "Équipe Rouge", emoji: "🔥", color: "#f43f5e" },
  { name: "Équipe Bleue", emoji: "🌊", color: "#3b82f6" },
  { name: "Équipe Verte", emoji: "🌿", color: "#10b981" },
  { name: "Équipe Jaune", emoji: "⚡", color: "#f59e0b" },
] as const;

export const MAX_TEAMS = TEAM_STYLES.length;

export function soloCompetitors(players: readonly Player[]): Competitor[] {
  return players.map((player) => ({
    id: player.id,
    name: player.name,
    emoji: player.emoji,
    color: player.color,
    memberIds: [player.id],
    interests: player.interests,
    level: player.level,
  }));
}

/**
 * One competitor per team that has members, in team order: the union of the
 * members' interests and the rounded mean of their levels.
 */
export function teamCompetitors(
  players: readonly Player[],
  teamOf: Readonly<Record<string, number>>,
): Competitor[] {
  return TEAM_STYLES.flatMap((style, team) => {
    const members = players.filter((player) => teamOf[player.id] === team);
    if (members.length === 0) return [];
    const interests = [
      ...new Set(members.flatMap((member) => member.interests)),
    ];
    const level = clampLevel(
      members.reduce((sum, member) => sum + member.level, 0) / members.length,
    );
    return [
      {
        id: `team-${team}`,
        ...style,
        memberIds: members.map((member) => member.id),
        interests,
        level,
      },
    ];
  });
}

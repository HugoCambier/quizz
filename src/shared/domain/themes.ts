/**
 * The theme catalogue shared by every module of the hub: a profile's
 * interests, a quiz question and (later) a revision deck all point to these
 * ids. An id is forever (stored in profiles and histories); change the label.
 */
export interface ThemeDefinition {
  id: string;
  label: string;
  emoji: string;
  /** Hue (0-360) of the theme's accent colour. */
  hue: number;
  /** Suitable for children: suggested first in the family mode. */
  kids: boolean;
}

export const THEMES = [
  {
    id: "pop-culture",
    label: "Pop culture",
    emoji: "📼",
    hue: 300,
    kids: false,
  },
  { id: "cinema", label: "Cinéma", emoji: "🎬", hue: 350, kids: false },
  { id: "series", label: "Séries TV", emoji: "📺", hue: 20, kids: false },
  { id: "musique", label: "Musique", emoji: "🎵", hue: 40, kids: false },
  { id: "jeux-video", label: "Jeux vidéo", emoji: "🎮", hue: 265, kids: false },
  {
    id: "gastronomie",
    label: "Gastronomie",
    emoji: "🧀",
    hue: 55,
    kids: false,
  },
  { id: "geographie", label: "Géographie", emoji: "🌍", hue: 190, kids: false },
  { id: "histoire", label: "Histoire", emoji: "🏛️", hue: 30, kids: false },
  { id: "sciences", label: "Sciences", emoji: "🔬", hue: 160, kids: false },
  { id: "societe", label: "Société", emoji: "🗞️", hue: 220, kids: false },
  {
    id: "animaux",
    label: "Animaux & nature",
    emoji: "🦊",
    hue: 120,
    kids: true,
  },
  {
    id: "dessins-animes",
    label: "Dessins animés",
    emoji: "🧸",
    hue: 330,
    kids: true,
  },
] as const satisfies readonly ThemeDefinition[];

export type Theme = (typeof THEMES)[number];
export type ThemeId = Theme["id"];

export const THEME_IDS = THEMES.map((theme) => theme.id) as [
  ThemeId,
  ...ThemeId[],
];

const BY_ID = new Map<string, Theme>(THEMES.map((theme) => [theme.id, theme]));

export function getTheme(id: ThemeId): Theme {
  const theme = BY_ID.get(id);
  if (!theme) throw new Error(`Unknown theme: ${id}`);
  return theme;
}

export function isThemeId(value: string): value is ThemeId {
  return BY_ID.has(value);
}

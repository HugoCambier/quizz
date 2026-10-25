/**
 * The difficulty scale, 1 to 10, shared by every module. A question carries
 * one level; a profile carries the level it plays at by default.
 */
export const MIN_LEVEL = 1;
export const MAX_LEVEL = 10;

export interface LevelDefinition {
  level: number;
  title: string;
  description: string;
}

export const LEVELS: readonly LevelDefinition[] = [
  {
    level: 1,
    title: "Échauffement",
    description: "Références universelles, souvenirs d’enfance évidents.",
  },
  {
    level: 2,
    title: "Échauffement +",
    description: "Classiques incontournables pour se mettre en jambe.",
  },
  {
    level: 3,
    title: "Facile",
    description: "Culture générale de base, sans piège.",
  },
  {
    level: 4,
    title: "Rythme de croisière",
    description: "Accessible, mais demande un minimum d’attention.",
  },
  {
    level: 5,
    title: "Cœur de soirée",
    description: "Un vrai défi équilibré : on réfléchit, on se concerte.",
  },
  {
    level: 6,
    title: "Cœur de soirée +",
    description: "Le débat s’anime autour de la table.",
  },
  {
    level: 7,
    title: "Costaud",
    description: "Dates clés, noms précis : élimination méthodique requise.",
  },
  {
    level: 8,
    title: "Haute voltige",
    description: "Détails exigeants et faux amis.",
  },
  {
    level: 9,
    title: "Expert",
    description: "Érudition pure, l’intuition habituelle est fausse.",
  },
  {
    level: 10,
    title: "Boss final",
    description: "Ultra-pointu, réservé aux champions.",
  },
];

export function clampLevel(value: number): number {
  return Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, Math.round(value)));
}

export function getLevel(level: number): LevelDefinition {
  const definition = LEVELS[clampLevel(level) - 1];
  if (!definition) throw new Error(`Unknown level: ${level}`);
  return definition;
}

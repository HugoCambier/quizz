import type { ThemeId } from "@shared/domain/themes";

export interface Question {
  /** `<theme>-<number>`, stable: histories point to it. */
  id: string;
  theme: ThemeId;
  /** 1 to 10, see `@shared/domain/levels`. */
  difficulty: number;
  question: string;
  options: readonly string[];
  /** Index of the right option in `options`. */
  answer: number;
  explanation: string;
}

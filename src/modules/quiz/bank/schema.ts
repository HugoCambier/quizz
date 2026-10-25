import { z } from "zod";

import { MAX_LEVEL, MIN_LEVEL } from "@shared/domain/levels";
import { THEME_IDS } from "@shared/domain/themes";

const questionSchema = z
  .object({
    id: z.string().regex(/^[a-z-]+-\d{3}$/),
    difficulty: z.number().int().min(MIN_LEVEL).max(MAX_LEVEL),
    question: z.string().min(5),
    options: z.array(z.string().min(1)).length(4),
    answer: z.number().int().min(0).max(3),
    explanation: z.string().min(5),
  })
  .refine((q) => new Set(q.options).size === q.options.length, {
    message: "options must be distinct",
  });

/** One file of `questions/`: a theme and its questions. */
export const questionFileSchema = z
  .object({
    theme: z.enum(THEME_IDS),
    questions: z.array(questionSchema).min(1),
  })
  .refine(
    (file) => file.questions.every((q) => q.id.startsWith(`${file.theme}-`)),
    {
      message: "every id starts with the file's theme",
    },
  );

export type QuestionFile = z.infer<typeof questionFileSchema>;

import { z } from "zod";

import { MAX_LEVEL, MIN_LEVEL } from "@shared/domain/levels";
import { THEME_IDS } from "@shared/domain/themes";

import type { Question } from "@modules/quiz/domain/question";

/**
 * Three kinds of contribution, all signed by an account:
 * - a question proposal, moderated before it joins the shared bank;
 * - a report on a question (wrong answer, ambiguity…), resolved by a moderator;
 * - a comment on a question, free text.
 */

export const REPORT_REASONS = [
  { id: "wrong-answer", label: "La réponse est fausse" },
  { id: "ambiguous", label: "Question ambiguë / plusieurs bonnes réponses" },
  { id: "outdated", label: "Information obsolète" },
  { id: "wording", label: "Faute ou formulation" },
  { id: "difficulty", label: "Niveau mal évalué" },
  { id: "inappropriate", label: "Contenu inapproprié" },
  { id: "other", label: "Autre" },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]["id"];
const REPORT_REASON_IDS = REPORT_REASONS.map((reason) => reason.id) as [
  ReportReason,
  ...ReportReason[],
];

/** What the proposal form produces; validated before it is stored. */
export const proposalDraftSchema = z
  .object({
    theme: z.enum(THEME_IDS),
    difficulty: z.number().int().min(MIN_LEVEL).max(MAX_LEVEL),
    question: z
      .string()
      .trim()
      .min(10, "La question est trop courte.")
      .max(300),
    options: z
      .array(
        z.string().trim().min(1, "Chaque réponse doit être remplie.").max(120),
      )
      .length(4),
    answer: z.number().int().min(0).max(3),
    explanation: z.string().trim().max(400),
    source: z.string().trim().max(300),
  })
  .refine(
    (draft) => new Set(draft.options.map((o) => o.toLowerCase())).size === 4,
    {
      message: "Les quatre réponses doivent être différentes.",
      path: ["options"],
    },
  );

export type ProposalDraft = z.infer<typeof proposalDraftSchema>;

const base = {
  id: z.string().min(1),
  authorId: z.string().min(1),
  authorName: z.string(),
  createdAt: z.string(),
};

export const proposalSchema = z.object({
  ...base,
  kind: z.literal("question"),
  status: z.enum(["pending", "approved", "rejected"]),
  draft: proposalDraftSchema,
});

export const reportSchema = z.object({
  ...base,
  kind: z.literal("report"),
  status: z.enum(["open", "resolved"]),
  questionId: z.string(),
  reason: z.enum(REPORT_REASON_IDS),
  comment: z.string().max(500),
});

export const commentSchema = z.object({
  ...base,
  kind: z.literal("comment"),
  questionId: z.string(),
  text: z.string().trim().min(1).max(500),
});

export const contributionSchema = z.discriminatedUnion("kind", [
  proposalSchema,
  reportSchema,
  commentSchema,
]);

export type Proposal = z.infer<typeof proposalSchema>;
export type Report = z.infer<typeof reportSchema>;
export type Comment = z.infer<typeof commentSchema>;
export type Contribution = z.infer<typeof contributionSchema>;

export function emptyProposalDraft(): ProposalDraft {
  return {
    theme: "pop-culture",
    difficulty: 4,
    question: "",
    options: ["", "", "", ""],
    answer: 0,
    explanation: "",
    source: "",
  };
}

/** A proposal as a playable question (its id cannot clash with the bank's). */
export function proposalToQuestion(proposal: Proposal): Question {
  const { theme, difficulty, question, options, answer, explanation } =
    proposal.draft;
  return {
    id: `contrib-${proposal.id}`,
    theme,
    difficulty,
    question,
    options,
    answer,
    explanation,
  };
}

/** Proposals in the bank's file format, for a moderator to merge into `questions/`. */
export function exportForBank(proposals: readonly Proposal[]) {
  return proposals.map(({ draft, authorName }) => ({
    theme: draft.theme,
    difficulty: draft.difficulty,
    question: draft.question,
    options: draft.options,
    answer: draft.answer,
    explanation: draft.explanation,
    author: authorName,
    source: draft.source,
  }));
}

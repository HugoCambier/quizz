import { memoryStore } from "@shared/storage/keyValueStore";

import { createLocalContributionsRepository } from "@modules/contributions/data/contributionsRepository";
import type { Proposal } from "@modules/contributions/domain/contribution";
import {
  emptyProposalDraft,
  exportForBank,
  proposalDraftSchema,
  proposalToQuestion,
} from "@modules/contributions/domain/contribution";

const draft = {
  ...emptyProposalDraft(),
  question: "Quel fleuve traverse Lyon et Avignon ?",
  options: ["La Loire", "Le Rhône", "La Seine", "La Garonne"],
  answer: 1,
};

const proposal: Proposal = {
  id: "abc",
  authorId: "u1",
  authorName: "Hugo",
  createdAt: "2026-10-25T00:00:00.000Z",
  kind: "question",
  status: "pending",
  draft,
};

describe("proposal draft", () => {
  it("accepts a complete question", () => {
    expect(proposalDraftSchema.safeParse(draft).success).toBe(true);
  });

  it("rejects duplicate or empty answers and a too short question", () => {
    expect(
      proposalDraftSchema.safeParse({ ...draft, options: ["A", "a", "B", "C"] })
        .success,
    ).toBe(false);
    expect(
      proposalDraftSchema.safeParse({ ...draft, options: ["A", "", "B", "C"] })
        .success,
    ).toBe(false);
    expect(
      proposalDraftSchema.safeParse({ ...draft, question: "Court ?" }).success,
    ).toBe(false);
  });

  it("becomes a playable question and a bank entry", () => {
    expect(proposalToQuestion(proposal)).toMatchObject({
      id: "contrib-abc",
      answer: 1,
      theme: "pop-culture",
    });
    expect(exportForBank([proposal])[0]).toMatchObject({
      author: "Hugo",
      answer: 1,
    });
  });
});

describe("local contributions repository", () => {
  it("stores, lists and updates contributions", async () => {
    const repository = createLocalContributionsRepository(memoryStore());
    await repository.add(proposal);
    await repository.update({ ...proposal, status: "approved" });
    expect(await repository.list()).toEqual([
      { ...proposal, status: "approved" },
    ]);
    expect(await repository.loadAccount()).toBeNull();
  });
});

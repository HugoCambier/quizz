import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { createId } from "@shared/lib/id";

import type { Question } from "@modules/quiz/domain/question";

import type { ContributionsRepository } from "../data/contributionsRepository";
import type { Account } from "../domain/account";
import type {
  Contribution,
  Proposal,
  ProposalDraft,
  Report,
  ReportReason,
} from "../domain/contribution";
import { proposalToQuestion } from "../domain/contribution";

interface ContributionsContextValue {
  account: Account | null;
  contributions: readonly Contribution[];
  /** Proposals not rejected, playable in this device's games. */
  communityQuestions: readonly Question[];
  signIn: (displayName: string) => Promise<Account>;
  propose: (draft: ProposalDraft) => Promise<void>;
  report: (
    questionId: string,
    reason: ReportReason,
    comment: string,
  ) => Promise<void>;
  comment: (questionId: string, text: string) => Promise<void>;
  moderate: (
    contribution: Proposal | Report,
    status: Proposal["status"] | Report["status"],
  ) => Promise<void>;
}

const ContributionsContext = createContext<ContributionsContextValue | null>(
  null,
);

export function ContributionsProvider({
  repository,
  children,
}: {
  repository: ContributionsRepository;
  children: ReactNode;
}) {
  const [account, setAccount] = useState<Account | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);

  useEffect(() => {
    let active = true;
    void Promise.all([repository.loadAccount(), repository.list()]).then(
      ([loaded, list]) => {
        if (!active) return;
        setAccount(loaded);
        setContributions(list);
      },
    );
    return () => {
      active = false;
    };
  }, [repository]);

  const signIn = useCallback(
    async (displayName: string) => {
      const next: Account = {
        id: account?.id ?? createId(),
        displayName: displayName.trim(),
        provider: "local",
        createdAt: account?.createdAt ?? new Date().toISOString(),
      };
      await repository.saveAccount(next);
      setAccount(next);
      return next;
    },
    [account, repository],
  );

  const add = useCallback(
    async (contribution: Contribution) => {
      await repository.add(contribution);
      setContributions((current) => [...current, contribution]);
    },
    [repository],
  );

  const signature = useCallback(() => {
    if (!account) throw new Error("A contribution needs an account");
    return {
      id: createId(),
      authorId: account.id,
      authorName: account.displayName,
      createdAt: new Date().toISOString(),
    };
  }, [account]);

  const propose = useCallback(
    (draft: ProposalDraft) =>
      add({ ...signature(), kind: "question", status: "pending", draft }),
    [add, signature],
  );
  const report = useCallback(
    (questionId: string, reason: ReportReason, comment: string) =>
      add({
        ...signature(),
        kind: "report",
        status: "open",
        questionId,
        reason,
        comment,
      }),
    [add, signature],
  );
  const comment = useCallback(
    (questionId: string, text: string) =>
      add({ ...signature(), kind: "comment", questionId, text }),
    [add, signature],
  );

  const moderate = useCallback(
    async (
      contribution: Proposal | Report,
      status: Proposal["status"] | Report["status"],
    ) => {
      const next = { ...contribution, status } as Contribution;
      await repository.update(next);
      setContributions((current) =>
        current.map((other) => (other.id === next.id ? next : other)),
      );
    },
    [repository],
  );

  const communityQuestions = useMemo(
    () =>
      contributions
        .filter(
          (c): c is Proposal =>
            c.kind === "question" && c.status !== "rejected",
        )
        .map(proposalToQuestion),
    [contributions],
  );

  const value = useMemo(
    () => ({
      account,
      contributions,
      communityQuestions,
      signIn,
      propose,
      report,
      comment,
      moderate,
    }),
    [
      account,
      contributions,
      communityQuestions,
      signIn,
      propose,
      report,
      comment,
      moderate,
    ],
  );
  return (
    <ContributionsContext.Provider value={value}>
      {children}
    </ContributionsContext.Provider>
  );
}

export function useContributions(): ContributionsContextValue {
  const value = useContext(ContributionsContext);
  if (!value)
    throw new Error(
      "useContributions must be used inside <ContributionsProvider>",
    );
  return value;
}

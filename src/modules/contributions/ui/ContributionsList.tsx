import { Check, Download, X } from "lucide-react";

import { getTheme } from "@shared/domain/themes";
import { Button } from "@shared/ui/Button";
import { EmptyState } from "@shared/ui/EmptyState";

import type { Contribution, Proposal } from "../domain/contribution";
import { exportForBank, REPORT_REASONS } from "../domain/contribution";

import { useContributions } from "./ContributionsProvider";

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  approved: "Validée",
  rejected: "Refusée",
  open: "Ouvert",
  resolved: "Traité",
};

const KIND_LABELS: Record<Contribution["kind"], string> = {
  question: "Question proposée",
  report: "Signalement",
  comment: "Commentaire",
};

/**
 * Every contribution known to this device, newest first, with the moderation
 * actions. Until the login and roles exist, moderation is local: it decides
 * what this device plays, and the export hands proposals to the bank.
 */
export function ContributionsList() {
  const { contributions, moderate } = useContributions();
  if (contributions.length === 0) {
    return (
      <EmptyState icon="✍️" title="Aucune contribution pour l’instant">
        Propose une question, ou signale-en une pendant une partie.
      </EmptyState>
    );
  }

  const proposals = contributions.filter(
    (c): c is Proposal => c.kind === "question",
  );
  const download = () => {
    const blob = new Blob([JSON.stringify(exportForBank(proposals), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "questions-proposees.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="stack">
      {proposals.length > 0 ? (
        <div className="row row--end">
          <Button size="sm" icon={<Download />} onClick={download}>
            Exporter les questions
          </Button>
        </div>
      ) : null}
      <ul className="ct-list">
        {[...contributions].reverse().map((contribution) => (
          <li key={contribution.id} className="ct-item">
            <div className="ct-item__head">
              <span>
                {KIND_LABELS[contribution.kind]} · {contribution.authorName} ·{" "}
                {new Date(contribution.createdAt).toLocaleDateString("fr-FR")}
              </span>
              {"status" in contribution ? (
                <span className={`badge ct-status--${contribution.status}`}>
                  {STATUS_LABELS[contribution.status]}
                </span>
              ) : null}
            </div>
            <ContributionBody contribution={contribution} />
            {contribution.kind === "question" &&
            contribution.status === "pending" ? (
              <div className="row">
                <Button
                  size="sm"
                  icon={<Check />}
                  onClick={() => void moderate(contribution, "approved")}
                >
                  Valider
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<X />}
                  onClick={() => void moderate(contribution, "rejected")}
                >
                  Refuser
                </Button>
              </div>
            ) : null}
            {contribution.kind === "report" &&
            contribution.status === "open" ? (
              <div className="row">
                <Button
                  size="sm"
                  icon={<Check />}
                  onClick={() => void moderate(contribution, "resolved")}
                >
                  Marquer traité
                </Button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ContributionBody({ contribution }: { contribution: Contribution }) {
  switch (contribution.kind) {
    case "question": {
      const { draft } = contribution;
      const theme = getTheme(draft.theme);
      return (
        <div>
          <strong>{draft.question}</strong>
          <p className="muted">
            {theme.emoji} {theme.label} · niveau {draft.difficulty} · réponse :{" "}
            {draft.options[draft.answer]}
          </p>
        </div>
      );
    }
    case "report":
      return (
        <div>
          <strong>
            {
              REPORT_REASONS.find((reason) => reason.id === contribution.reason)
                ?.label
            }
          </strong>
          <p className="muted">
            Question {contribution.questionId}
            {contribution.comment ? ` — ${contribution.comment}` : ""}
          </p>
        </div>
      );
    case "comment":
      return (
        <div>
          <p>{contribution.text}</p>
          <p className="muted">Question {contribution.questionId}</p>
        </div>
      );
  }
}

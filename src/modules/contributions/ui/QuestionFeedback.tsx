import { Flag, MessageCircle } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@shared/ui/Button";

import type { ReportReason } from "../domain/contribution";
import { REPORT_REASONS } from "../domain/contribution";

import { AccountGate } from "./AccountGate";
import { useContributions } from "./ContributionsProvider";

type Mode = "report" | "comment";

/** "Signaler" and "Commenter" buttons for one question, each opening a dialog. */
export function QuestionFeedback({ questionId }: { questionId: string }) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [sent, setSent] = useState<Mode | null>(null);
  useEffect(() => {
    setSent(null);
  }, [questionId]);

  return (
    <div className="row">
      <Button
        variant="ghost"
        size="sm"
        icon={<Flag />}
        onClick={() => {
          setMode("report");
        }}
      >
        {sent === "report" ? "Signalé, merci !" : "Signaler"}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        icon={<MessageCircle />}
        onClick={() => {
          setMode("comment");
        }}
      >
        {sent === "comment" ? "Commentaire envoyé" : "Commenter"}
      </Button>
      {mode ? (
        <FeedbackDialog
          mode={mode}
          questionId={questionId}
          onClose={(done) => {
            if (done) setSent(mode);
            setMode(null);
          }}
        />
      ) : null}
    </div>
  );
}

function FeedbackDialog({
  mode,
  questionId,
  onClose,
}: {
  mode: Mode;
  questionId: string;
  onClose: (done: boolean) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const { report, comment } = useContributions();
  const [reason, setReason] = useState<ReportReason>("wrong-answer");
  const [text, setText] = useState("");

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (mode === "report") await report(questionId, reason, text.trim());
    else if (text.trim()) await comment(questionId, text.trim());
    else return;
    onClose(true);
  };

  return (
    <dialog
      ref={ref}
      className="dialog"
      onClose={() => {
        onClose(false);
      }}
      aria-label={
        mode === "report" ? "Signaler la question" : "Commenter la question"
      }
    >
      <div className="stack">
        <h2>
          {mode === "report" ? "Signaler la question" : "Commenter la question"}
        </h2>
        <AccountGate>
          <form className="stack" onSubmit={submit}>
            {mode === "report" ? (
              <label className="field">
                <span>Problème</span>
                <select
                  className="input"
                  value={reason}
                  onChange={(event) => {
                    setReason(event.target.value as ReportReason);
                  }}
                >
                  {REPORT_REASONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <label className="field">
              <span>
                {mode === "report"
                  ? "Précisions (facultatif)"
                  : "Ton commentaire"}
              </span>
              <textarea
                className="input"
                value={text}
                maxLength={500}
                onChange={(event) => {
                  setText(event.target.value);
                }}
              />
            </label>
            <div className="row row--end">
              <Button
                variant="ghost"
                onClick={() => {
                  onClose(false);
                }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={mode === "comment" && !text.trim()}
              >
                Envoyer
              </Button>
            </div>
          </form>
        </AccountGate>
      </div>
    </dialog>
  );
}

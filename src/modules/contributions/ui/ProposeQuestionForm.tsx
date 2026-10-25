import { Send } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

import type { ThemeId } from "@shared/domain/themes";
import { THEMES } from "@shared/domain/themes";
import { Button } from "@shared/ui/Button";
import { LevelSlider } from "@shared/ui/LevelSlider";

import type { ProposalDraft } from "../domain/contribution";
import {
  emptyProposalDraft,
  proposalDraftSchema,
} from "../domain/contribution";

import { useContributions } from "./ContributionsProvider";

const LETTERS = ["A", "B", "C", "D"];

export function ProposeQuestionForm() {
  const { propose } = useContributions();
  const [draft, setDraft] = useState<ProposalDraft>(emptyProposalDraft);
  const [errors, setErrors] = useState<string[]>([]);
  const [sent, setSent] = useState(false);

  const update = (patch: Partial<ProposalDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setSent(false);
  };
  const setOption = (index: number, value: string) => {
    update({
      options: draft.options.map((option, i) => (i === index ? value : option)),
    });
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = proposalDraftSchema.safeParse(draft);
    if (!parsed.success) {
      setErrors([
        ...new Set(parsed.error.issues.map((issue) => issue.message)),
      ]);
      return;
    }
    await propose(parsed.data);
    setErrors([]);
    setDraft({
      ...emptyProposalDraft(),
      theme: draft.theme,
      difficulty: draft.difficulty,
    });
    setSent(true);
  };

  return (
    <form className="stack" onSubmit={submit} noValidate>
      <label className="field">
        <span>Thème</span>
        <select
          className="input"
          value={draft.theme}
          onChange={(event) => {
            update({ theme: event.target.value as ThemeId });
          }}
        >
          {THEMES.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.emoji} {theme.label}
            </option>
          ))}
        </select>
      </label>
      <LevelSlider
        label="Niveau estimé"
        value={draft.difficulty}
        onChange={(difficulty) => {
          update({ difficulty });
        }}
      />
      <label className="field">
        <span>Question</span>
        <textarea
          className="input"
          value={draft.question}
          maxLength={300}
          onChange={(event) => {
            update({ question: event.target.value });
          }}
          placeholder="Ex. Quel fleuve traverse Lyon et Avignon ?"
        />
      </label>
      <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="section-title">Réponses — coche la bonne</legend>
        <div className="ct-options">
          {draft.options.map((option, index) => (
            <div className="ct-option" key={LETTERS[index]}>
              <input
                type="radio"
                name="answer"
                checked={draft.answer === index}
                onChange={() => {
                  update({ answer: index });
                }}
                aria-label={`La réponse ${LETTERS[index]} est la bonne`}
              />
              <input
                className="input"
                value={option}
                maxLength={120}
                onChange={(event) => {
                  setOption(index, event.target.value);
                }}
                placeholder={`Réponse ${LETTERS[index]}`}
                aria-label={`Réponse ${LETTERS[index]}`}
              />
            </div>
          ))}
        </div>
      </fieldset>
      <label className="field">
        <span>Explication (facultatif)</span>
        <textarea
          className="input"
          value={draft.explanation}
          maxLength={400}
          onChange={(event) => {
            update({ explanation: event.target.value });
          }}
          placeholder="Une anecdote qui s'affiche après la réponse."
        />
      </label>
      <label className="field">
        <span>Source (facultatif)</span>
        <input
          className="input"
          value={draft.source}
          maxLength={300}
          onChange={(event) => {
            update({ source: event.target.value });
          }}
          placeholder="Lien ou référence qui confirme la réponse"
        />
        <small>Une source accélère la validation par les modérateurs.</small>
      </label>
      {errors.length > 0 ? (
        <ul className="ct-errors" role="alert">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}
      {sent ? (
        <p className="ct-success" role="status">
          Merci ! Ta question est en attente de validation, et déjà jouable sur
          cet appareil.
        </p>
      ) : null}
      <div className="row row--end">
        <Button type="submit" variant="primary" icon={<Send />}>
          Proposer la question
        </Button>
      </div>
    </form>
  );
}

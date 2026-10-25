import type { FormEvent, ReactNode } from "react";
import { useState } from "react";

import { Button } from "@shared/ui/Button";

import { useContributions } from "./ContributionsProvider";

/**
 * Renders `children` once the visitor has a contributor identity; asks for a
 * pseudonym otherwise. The login will replace this form, not its callers.
 */
export function AccountGate({ children }: { children: ReactNode }) {
  const { account, signIn } = useContributions();
  const [name, setName] = useState("");
  if (account) return <>{children}</>;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (name.trim().length >= 2) void signIn(name);
  };
  return (
    <form className="stack" onSubmit={submit}>
      <p className="muted">
        Choisis un pseudo de contributeur : il signe tes questions, remarques et
        signalements. La connexion (pour retrouver tes contributions partout)
        arrive bientôt.
      </p>
      <label className="field">
        <span>Pseudo</span>
        <input
          className="input"
          value={name}
          maxLength={32}
          onChange={(event) => {
            setName(event.target.value);
          }}
          placeholder="Ex. Hugo"
        />
      </label>
      <div className="row row--end">
        <Button
          type="submit"
          variant="primary"
          disabled={name.trim().length < 2}
        >
          Continuer
        </Button>
      </div>
    </form>
  );
}

import { PageHeader } from "@shared/ui/PageHeader";

import { AccountGate } from "./AccountGate";
import { ContributionsList } from "./ContributionsList";
import { useContributions } from "./ContributionsProvider";
import { ProposeQuestionForm } from "./ProposeQuestionForm";
import "./contributions.css";

export function ContributePage() {
  const { account } = useContributions();
  return (
    <div className="page">
      <PageHeader
        title="Contribuer"
        subtitle={
          account
            ? `Connecté en tant que ${account.displayName}. Chaque question proposée est relue avant d’entrer dans la banque commune.`
            : "Propose tes questions, signale les erreurs : la banque grandit avec la communauté."
        }
      />
      <div className="ct-layout">
        <section className="card" aria-labelledby="propose-title">
          <h2 id="propose-title">Proposer une question</h2>
          <AccountGate>
            <ProposeQuestionForm />
          </AccountGate>
        </section>
        <section className="card" aria-labelledby="mine-title">
          <h2 id="mine-title">Contributions</h2>
          <ContributionsList />
        </section>
      </div>
    </div>
  );
}

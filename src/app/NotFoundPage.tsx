import { ButtonLink } from "@shared/ui/Button";
import { EmptyState } from "@shared/ui/EmptyState";

export function NotFoundPage() {
  return (
    <div className="page">
      <div className="card">
        <EmptyState icon="🧭" title="Cette page n’existe pas">
          <ButtonLink to="/">Retour à l’accueil</ButtonLink>
        </EmptyState>
      </div>
    </div>
  );
}

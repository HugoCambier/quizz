import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

import { getLevel } from "@shared/domain/levels";
import { getTheme } from "@shared/domain/themes";
import { Avatar } from "@shared/ui/Avatar";
import { ButtonLink } from "@shared/ui/Button";
import { EmptyState } from "@shared/ui/EmptyState";
import { PageHeader } from "@shared/ui/PageHeader";

import { useProfiles } from "./ProfilesProvider";
import "./profiles.css";

export function ProfilesPage() {
  const { profiles, statsOf } = useProfiles();
  return (
    <div className="page">
      <PageHeader
        title="Joueurs"
        subtitle="Chaque joueur a ses centres d’intérêt et son niveau : les parties s’y adaptent."
        actions={
          <ButtonLink to="/profils/nouveau" variant="primary" icon={<Plus />}>
            Nouveau joueur
          </ButtonLink>
        }
      />
      {profiles.length === 0 ? (
        <div className="card">
          <EmptyState icon="🎭" title="Aucun joueur pour l’instant">
            Crée un profil par joueur : prénom, avatar, thèmes préférés.
          </EmptyState>
        </div>
      ) : (
        <div className="pf-grid">
          {profiles.map((profile) => {
            const stats = statsOf(profile.id);
            return (
              <Link
                key={profile.id}
                to={`/profils/${profile.id}`}
                className="card pf-card"
              >
                <div className="pf-card__head">
                  <Avatar
                    emoji={profile.emoji}
                    color={profile.color}
                    size={48}
                  />
                  <div>
                    <strong>{profile.name}</strong>
                    <div className="pf-card__meta">
                      Niveau {profile.level} · {getLevel(profile.level).title} ·{" "}
                      {stats.gamesPlayed} partie
                      {stats.gamesPlayed > 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
                <div className="chip-list">
                  {profile.interests.length === 0 ? (
                    <span className="badge">Tous les thèmes</span>
                  ) : (
                    profile.interests.map((id) => (
                      <span key={id} className="badge">
                        {getTheme(id).emoji} {getTheme(id).label}
                      </span>
                    ))
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

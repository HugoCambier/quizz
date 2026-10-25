import { Save, Trash2 } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { THEMES } from "@shared/domain/themes";
import { Avatar } from "@shared/ui/Avatar";
import { Button } from "@shared/ui/Button";
import { LevelSlider } from "@shared/ui/LevelSlider";
import { PageHeader } from "@shared/ui/PageHeader";
import { ThemePicker } from "@shared/ui/ThemePicker";

import type { ProfileDraft } from "../domain/profile";
import { AVATARS, COLORS, emptyDraft } from "../domain/profile";
import { successRate } from "../domain/stats";

import { useProfiles } from "./ProfilesProvider";
import "./profiles.css";

export function ProfileEditorPage() {
  const { id } = useParams();
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const { profiles, saveProfile, deleteProfile, statsOf } = useProfiles();
  const existing = profiles.find((profile) => profile.id === id);
  const [draft, setDraft] = useState<ProfileDraft>(
    () => existing ?? emptyDraft(profiles.length),
  );
  // `?retour=/quiz` brings the player back to the game setup after creation.
  const back = search.get("retour") ?? "/profils";

  const update = (patch: Partial<ProfileDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.name.trim()) return;
    saveProfile(draft, existing?.id);
    navigate(back);
  };

  const stats = existing ? statsOf(existing.id) : null;
  return (
    <div className="page">
      <PageHeader
        title={existing ? existing.name : "Nouveau joueur"}
        subtitle="Les thèmes choisis orientent les questions de ce joueur. Aucun thème = tous les thèmes."
      />
      <form className="card pf-editor" onSubmit={submit}>
        <div className="row">
          <Avatar emoji={draft.emoji} color={draft.color} size={64} />
          <label className="field" style={{ flex: 1, minWidth: 200 }}>
            <span>Prénom ou pseudo</span>
            <input
              className="input"
              value={draft.name}
              maxLength={24}
              required
              onChange={(event) => {
                update({ name: event.target.value });
              }}
            />
          </label>
        </div>
        <div>
          <p className="section-title">Avatar</p>
          <div className="pf-avatars">
            {AVATARS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                aria-pressed={draft.emoji === emoji}
                aria-label={`Avatar ${emoji}`}
                onClick={() => {
                  update({ emoji });
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="section-title">Couleur</p>
          <div className="row pf-colors">
            {COLORS.map((color) => (
              <button
                key={color}
                type="button"
                aria-pressed={draft.color === color}
                aria-label={`Couleur ${color}`}
                style={{ background: color }}
                onClick={() => {
                  update({ color });
                }}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="section-title">Centres d’intérêt</p>
          <ThemePicker
            value={draft.interests}
            onChange={(interests) => {
              update({ interests });
            }}
          />
        </div>
        <LevelSlider
          label="Niveau habituel"
          value={draft.level}
          onChange={(level) => {
            update({ level });
          }}
        />
        <div className="row row--end">
          {existing ? (
            <Button
              variant="danger"
              icon={<Trash2 />}
              onClick={() => {
                deleteProfile(existing.id);
                navigate("/profils");
              }}
            >
              Supprimer
            </Button>
          ) : null}
          <Button
            variant="ghost"
            onClick={() => {
              navigate(back);
            }}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={<Save />}
            disabled={!draft.name.trim()}
          >
            Enregistrer
          </Button>
        </div>
      </form>
      {stats && stats.gamesPlayed > 0 ? (
        <section className="card">
          <h2>Réussite par thème</h2>
          <ul className="pf-stats">
            {THEMES.filter((theme) => stats.themes[theme.id]).map((theme) => {
              const rate = successRate(stats.themes[theme.id]) ?? 0;
              return (
                <li key={theme.id} className="pf-stat">
                  <span>
                    {theme.emoji} {theme.label}
                  </span>
                  <span className="pf-stat__bar" aria-hidden="true">
                    <span style={{ width: `${Math.round(rate * 100)}%` }} />
                  </span>
                  <strong>{Math.round(rate * 100)}%</strong>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

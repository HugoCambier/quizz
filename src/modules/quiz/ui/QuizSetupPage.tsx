import { Play, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { newSeed } from "@shared/lib/random";
import { browserStore } from "@shared/storage/keyValueStore";
import { Avatar } from "@shared/ui/Avatar";
import { Button, ButtonLink } from "@shared/ui/Button";
import { EmptyState } from "@shared/ui/EmptyState";
import { LevelSlider } from "@shared/ui/LevelSlider";
import { PageHeader } from "@shared/ui/PageHeader";

import { useContributions } from "@modules/contributions/ui/ContributionsProvider";
import { useProfiles } from "@modules/profiles/ui/ProfilesProvider";

import { QUESTIONS } from "../bank";
import type { GameSetup } from "../data/setupRepository";
import { loadSetup, saveSetup } from "../data/setupRepository";
import { MAX_TEAMS, TEAM_STYLES } from "../domain/competitors";
import type { DifficultySetting, GamePresetId } from "../domain/config";
import { GAME_PRESETS, ROUND_CHOICES } from "../domain/config";
import { newGame } from "../domain/newGame";

import { useGame } from "./GameProvider";
import { PRESET_ICONS } from "./presets";
import "./quiz.css";

const store = browserStore();

function defaultSetup(): GameSetup {
  const preset = GAME_PRESETS[0];
  if (!preset) throw new Error("No game preset");
  return {
    presetId: preset.id,
    playerIds: [],
    teams: false,
    teamOf: {},
    includeCommunity: true,
    config: preset.config,
  };
}

export function QuizSetupPage() {
  const { profiles, statsOf } = useProfiles();
  const { communityQuestions } = useContributions();
  const { start } = useGame();
  const navigate = useNavigate();
  const [setup, setSetup] = useState<GameSetup>(() => {
    const saved = loadSetup(store) ?? defaultSetup();
    // Players deleted since the last game drop out.
    return {
      ...saved,
      playerIds: saved.playerIds.filter((id) =>
        profiles.some((p) => p.id === id),
      ),
    };
  });
  const { config } = setup;

  const update = (patch: Partial<GameSetup>) => {
    setSetup((current) => ({ ...current, ...patch }));
  };
  const updateConfig = (patch: Partial<GameSetup["config"]>) => {
    setSetup((current) => ({
      ...current,
      config: { ...current.config, ...patch },
    }));
  };

  const selected = useMemo(
    () => profiles.filter((profile) => setup.playerIds.includes(profile.id)),
    [profiles, setup.playerIds],
  );
  const teamCount = new Set(
    selected.map((player) => setup.teamOf[player.id] ?? 0),
  ).size;
  const canStart = selected.length > 0 && (!setup.teams || teamCount >= 2);

  const togglePlayer = (id: string) => {
    update({
      playerIds: setup.playerIds.includes(id)
        ? setup.playerIds.filter((other) => other !== id)
        : [...setup.playerIds, id],
      teamOf: {
        ...setup.teamOf,
        [id]: setup.teamOf[id] ?? setup.playerIds.length % 2,
      },
    });
  };
  const cycleTeam = (id: string) => {
    update({
      teamOf: {
        ...setup.teamOf,
        [id]: ((setup.teamOf[id] ?? 0) + 1) % MAX_TEAMS,
      },
    });
  };
  const choosePreset = (presetId: GamePresetId) => {
    const preset = GAME_PRESETS.find((candidate) => candidate.id === presetId);
    if (preset) update({ presetId, config: preset.config });
  };

  const launch = () => {
    saveSetup(store, setup);
    const seen = new Set(
      selected.flatMap((player) => statsOf(player.id).seenQuestionIds),
    );
    start(
      newGame({
        players: selected,
        teamOf: setup.teams ? setup.teamOf : undefined,
        config: { ...config, seed: newSeed() },
        questions: setup.includeCommunity
          ? [...QUESTIONS, ...communityQuestions]
          : QUESTIONS,
        seenQuestionIds: seen,
      }),
    );
    navigate("/quiz/partie");
  };

  const questionCount =
    config.rounds *
    (setup.teams ? Math.max(teamCount, 1) : Math.max(selected.length, 1));

  return (
    <div className="page">
      <PageHeader
        title="Nouvelle partie"
        subtitle="Choisis les joueurs et l’ambiance : les questions suivent leurs centres d’intérêt."
      />

      <section className="card stack" aria-labelledby="players-title">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h2 id="players-title">1. Les joueurs</h2>
          <ButtonLink
            to="/profils/nouveau?retour=/quiz"
            size="sm"
            icon={<UserPlus />}
          >
            Ajouter un joueur
          </ButtonLink>
        </div>
        {profiles.length === 0 ? (
          <EmptyState icon="🎭" title="Commence par créer les joueurs">
            Un profil par personne : prénom, avatar, thèmes préférés et niveau.
          </EmptyState>
        ) : (
          <div className="qz-players">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                type="button"
                className="qz-player"
                aria-pressed={setup.playerIds.includes(profile.id)}
                onClick={() => {
                  togglePlayer(profile.id);
                }}
              >
                <Avatar emoji={profile.emoji} color={profile.color} size={36} />
                <span>{profile.name}</span>
              </button>
            ))}
          </div>
        )}
        {selected.length > 1 ? (
          <div className="stack">
            <label className="row">
              <input
                type="checkbox"
                checked={setup.teams}
                onChange={(event) => {
                  update({ teams: event.target.checked });
                }}
              />
              <span>Jouer en équipes (couples, parents contre enfants…)</span>
            </label>
            {setup.teams ? (
              <div className="qz-teams">
                <p className="muted">
                  Touchez un joueur pour changer son équipe.
                </p>
                <div className="chip-list">
                  {selected.map((player) => {
                    const team =
                      TEAM_STYLES[setup.teamOf[player.id] ?? 0] ??
                      TEAM_STYLES[0];
                    return (
                      <button
                        key={player.id}
                        type="button"
                        className="chip"
                        style={{ borderColor: team.color }}
                        onClick={() => {
                          cycleTeam(player.id);
                        }}
                      >
                        {player.emoji} {player.name} → {team.emoji} {team.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="card stack" aria-labelledby="mode-title">
        <h2 id="mode-title">2. L’ambiance</h2>
        <div className="qz-presets">
          {GAME_PRESETS.map((preset) => {
            const Icon = PRESET_ICONS[preset.id];
            return (
              <button
                key={preset.id}
                type="button"
                className="qz-preset"
                aria-pressed={setup.presetId === preset.id}
                onClick={() => {
                  choosePreset(preset.id);
                }}
              >
                <Icon aria-hidden="true" />
                <strong>{preset.label}</strong>
                <span>{preset.description}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="card stack" aria-labelledby="rules-title">
        <h2 id="rules-title">3. Les règles</h2>
        <div className="qz-rules">
          <div className="field">
            <span>Réponses</span>
            <div className="segmented">
              <button
                type="button"
                aria-pressed={config.answerMode === "turns"}
                onClick={() => {
                  updateConfig({ answerMode: "turns" });
                }}
              >
                Chacun son tour
              </button>
              <button
                type="button"
                aria-pressed={config.answerMode === "buzzer"}
                onClick={() => {
                  updateConfig({ answerMode: "buzzer" });
                }}
              >
                Animateur / buzzer
              </button>
            </div>
          </div>
          <div className="field">
            <span>Questions par joueur</span>
            <div className="segmented">
              {ROUND_CHOICES.map((rounds) => (
                <button
                  key={rounds}
                  type="button"
                  aria-pressed={config.rounds === rounds}
                  onClick={() => {
                    updateConfig({ rounds });
                  }}
                >
                  {rounds}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <span>Points</span>
            <div className="segmented">
              <button
                type="button"
                aria-pressed={config.scoring === "flat"}
                onClick={() => {
                  updateConfig({ scoring: "flat" });
                }}
              >
                1 pt par bonne réponse
              </button>
              <button
                type="button"
                aria-pressed={config.scoring === "difficulty"}
                onClick={() => {
                  updateConfig({ scoring: "difficulty" });
                }}
              >
                Selon la difficulté
              </button>
            </div>
          </div>
        </div>
        <DifficultyEditor
          value={config.difficulty}
          onChange={(difficulty) => {
            updateConfig({ difficulty });
          }}
        />
        {communityQuestions.length > 0 ? (
          <label className="row">
            <input
              type="checkbox"
              checked={setup.includeCommunity}
              onChange={(event) => {
                update({ includeCommunity: event.target.checked });
              }}
            />
            <span>
              Inclure les {communityQuestions.length} question
              {communityQuestions.length > 1 ? "s" : ""} proposée
              {communityQuestions.length > 1 ? "s" : ""} par la communauté
            </span>
          </label>
        ) : null}
      </section>

      <div className="qz-launch">
        <span className="muted">
          {canStart
            ? `${questionCount} questions · ${selected.length} joueur${selected.length > 1 ? "s" : ""}`
            : setup.teams
              ? "Il faut au moins deux équipes."
              : "Sélectionne au moins un joueur."}
        </span>
        <Button
          variant="primary"
          size="lg"
          icon={<Play />}
          disabled={!canStart}
          onClick={launch}
        >
          Lancer la partie
        </Button>
      </div>
    </div>
  );
}

function DifficultyEditor({
  value,
  onChange,
}: {
  value: DifficultySetting;
  onChange: (value: DifficultySetting) => void;
}) {
  return (
    <div className="stack">
      <div className="field">
        <span>Difficulté</span>
        <div className="segmented">
          <button
            type="button"
            aria-pressed={value.kind === "range"}
            onClick={() => {
              onChange({ kind: "range", min: 3, max: 6 });
            }}
          >
            Fixe
          </button>
          <button
            type="button"
            aria-pressed={value.kind === "per-player"}
            onClick={() => {
              onChange({ kind: "per-player" });
            }}
          >
            Chacun son niveau
          </button>
          <button
            type="button"
            aria-pressed={value.kind === "progressive"}
            onClick={() => {
              onChange({ kind: "progressive", from: 2, to: 8 });
            }}
          >
            Progressive
          </button>
        </div>
      </div>
      {value.kind === "range" ? (
        <div className="qz-rules">
          <LevelSlider
            label="Niveau minimum"
            value={value.min}
            onChange={(min) => {
              onChange({ ...value, min, max: Math.max(min, value.max) });
            }}
          />
          <LevelSlider
            label="Niveau maximum"
            value={value.max}
            onChange={(max) => {
              onChange({ ...value, max, min: Math.min(max, value.min) });
            }}
          />
        </div>
      ) : null}
      {value.kind === "progressive" ? (
        <div className="qz-rules">
          <LevelSlider
            label="Au début"
            value={value.from}
            onChange={(from) => {
              onChange({ ...value, from });
            }}
          />
          <LevelSlider
            label="À la fin"
            value={value.to}
            onChange={(to) => {
              onChange({ ...value, to });
            }}
          />
        </div>
      ) : null}
      {value.kind === "per-player" ? (
        <p className="muted">
          Chaque joueur reçoit des questions à son niveau habituel (réglable
          dans son profil). En mode animateur, c’est la moyenne des niveaux.
        </p>
      ) : null}
    </div>
  );
}

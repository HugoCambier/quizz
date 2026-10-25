import { Home, RotateCcw, Settings2 } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";

import { getTheme } from "@shared/domain/themes";
import { newSeed } from "@shared/lib/random";
import { Avatar } from "@shared/ui/Avatar";
import { Button, ButtonLink } from "@shared/ui/Button";
import { PageHeader } from "@shared/ui/PageHeader";

import { useContributions } from "@modules/contributions/ui/ContributionsProvider";
import { QuestionFeedback } from "@modules/contributions/ui/QuestionFeedback";
import { useProfiles } from "@modules/profiles/ui/ProfilesProvider";

import { QUESTIONS } from "../bank";
import { rematch } from "../domain/newGame";
import { standings } from "../domain/session";

import { useGame } from "./GameProvider";
import "./quiz.css";

const MEDALS = ["🥇", "🥈", "🥉"];

export function QuizResultsPage() {
  const { game, start } = useGame();
  const { statsOf } = useProfiles();
  const { communityQuestions } = useContributions();
  const navigate = useNavigate();

  if (!game) return <Navigate to="/quiz" replace />;
  if (game.phase !== "finished") return <Navigate to="/quiz/partie" replace />;

  const rows = standings(game);
  const winners = rows.filter((row) => row.rank === 1);

  const replay = () => {
    const seen = new Set(
      game.competitors.flatMap((c) =>
        c.memberIds.flatMap((id) => statsOf(id).seenQuestionIds),
      ),
    );
    start(
      rematch(game, [...QUESTIONS, ...communityQuestions], newSeed(), seen),
    );
    navigate("/quiz/partie");
  };

  return (
    <div className="page">
      <PageHeader
        title={
          rows.length === 1
            ? `${rows[0]?.correct ?? 0} bonne${(rows[0]?.correct ?? 0) > 1 ? "s" : ""} réponse${(rows[0]?.correct ?? 0) > 1 ? "s" : ""} sur ${rows[0]?.played ?? 0}`
            : winners.length > 1
              ? "Égalité !"
              : `${winners[0]?.competitor.name ?? ""} l’emporte !`
        }
        subtitle="Les réponses sont enregistrées dans l’historique de chaque joueur."
        actions={
          <>
            <ButtonLink to="/" variant="ghost" icon={<Home />}>
              Accueil
            </ButtonLink>
            <ButtonLink to="/quiz" icon={<Settings2 />}>
              Changer les règles
            </ButtonLink>
            <Button variant="primary" icon={<RotateCcw />} onClick={replay}>
              Rejouer
            </Button>
          </>
        }
      />

      <ol className="qz-podium">
        {rows.map((row) => (
          <li key={row.competitor.id} className="card qz-podium__row">
            <span className="qz-podium__rank">
              {MEDALS[row.rank - 1] ?? `${row.rank}e`}
            </span>
            <Avatar
              emoji={row.competitor.emoji}
              color={row.competitor.color}
              size={44}
            />
            <div className="qz-podium__name">
              <strong>{row.competitor.name}</strong>
              <span className="muted">
                {row.correct}/{row.played} bonnes réponses
              </span>
            </div>
            <span className="qz-podium__score">{row.score} pts</span>
          </li>
        ))}
      </ol>

      <section className="card">
        <h2>Revoir les questions</h2>
        <ol className="qz-review">
          {game.results.map((result, index) => {
            const item = game.deck[index];
            if (!item) return null;
            const theme = getTheme(item.question.theme);
            const won = result.winnerIds.length > 0;
            return (
              <li key={item.question.id} className="qz-review__item">
                <span aria-hidden="true">{won ? "✅" : "❌"}</span>
                <div className="stack" style={{ gap: 4 }}>
                  <span className="muted">
                    {theme.emoji} {theme.label} · niveau{" "}
                    {item.question.difficulty}
                  </span>
                  <strong>{item.question.question}</strong>
                  <span>
                    Réponse :{" "}
                    <strong>
                      {item.question.options[item.question.answer]}
                    </strong>
                  </span>
                  <QuestionFeedback questionId={item.question.id} />
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

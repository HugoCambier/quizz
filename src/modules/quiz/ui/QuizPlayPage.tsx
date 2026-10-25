import { ArrowRight, Eye, Flag } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";

import { getLevel } from "@shared/domain/levels";
import { getTheme } from "@shared/domain/themes";
import { Avatar } from "@shared/ui/Avatar";
import { Button } from "@shared/ui/Button";

import { QuestionFeedback } from "@modules/contributions/ui/QuestionFeedback";

import { pointsFor } from "../domain/scoring";
import type { GameState } from "../domain/session";
import { standings } from "../domain/session";

import { useGame } from "./GameProvider";
import "./quiz.css";

const LETTERS = ["A", "B", "C", "D"];

export function QuizPlayPage() {
  const { game, dispatch } = useGame();

  // Keyboard: 1-4 / A-D answers, Enter or Space goes on (a focused control
  // keeps its own keys).
  useEffect(() => {
    if (!game || game.phase === "finished") return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLElement &&
        event.target.closest("input, textarea, select, dialog, button, a")
      )
        return;
      const index = "1234".includes(event.key)
        ? "1234".indexOf(event.key)
        : "abcd".indexOf(event.key.toLowerCase());
      const item = game.deck[game.index];
      if (
        game.phase === "question" &&
        index >= 0 &&
        item?.competitorId !== null
      ) {
        dispatch({ type: "answer", choice: index });
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        dispatch({ type: game.phase === "question" ? "reveal" : "next" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [game, dispatch]);

  if (!game) return <Navigate to="/quiz" replace />;
  if (game.phase === "finished")
    return <Navigate to="/quiz/resultats" replace />;

  const item = game.deck[game.index];
  if (!item) return <Navigate to="/quiz/resultats" replace />;
  const { question } = item;
  const theme = getTheme(question.theme);
  const result =
    game.phase === "revealed" ? game.results[game.index] : undefined;
  const turnOf = game.competitors.find(
    (competitor) => competitor.id === item.competitorId,
  );
  const buzzer = item.competitorId === null;
  const points = pointsFor(question, game.config.scoring);

  return (
    <div
      className="page qz-play"
      style={{ "--theme-hue": theme.hue } as CSSProperties}
    >
      <Scoreboard game={game} />

      <div className="qz-progress" aria-hidden="true">
        <span
          style={{
            width: `${((game.index + (result ? 1 : 0)) / game.deck.length) * 100}%`,
          }}
        />
      </div>

      {turnOf ? (
        <div
          className="qz-turn"
          style={{ "--turn-color": turnOf.color } as CSSProperties}
        >
          <Avatar emoji={turnOf.emoji} color={turnOf.color} size={32} />
          <span>
            Au tour de <strong>{turnOf.name}</strong>
          </span>
        </div>
      ) : null}

      <section className="card qz-question" aria-live="polite">
        <div className="row qz-question__meta">
          <span className="badge qz-theme">
            {theme.emoji} {theme.label}
          </span>
          <span className="badge">
            Niveau {question.difficulty} · {getLevel(question.difficulty).title}
          </span>
          <span className="badge">
            {points} pt{points > 1 ? "s" : ""}
          </span>
          <span className="qz-counter">
            {game.index + 1} / {game.deck.length}
          </span>
        </div>
        <h2 className="qz-question__text">{question.question}</h2>
        <div className="qz-options">
          {question.options.map((option, index) => {
            const state = !result
              ? "idle"
              : index === question.answer
                ? "right"
                : index === result.choice
                  ? "wrong"
                  : "dim";
            return (
              <button
                key={option}
                type="button"
                className={`qz-option qz-option--${state}`}
                disabled={buzzer || Boolean(result)}
                onClick={() => {
                  dispatch({ type: "answer", choice: index });
                }}
              >
                <span className="qz-option__letter">{LETTERS[index]}</span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>

        {result ? (
          <div className="qz-reveal">
            {!buzzer ? (
              <p
                className={`qz-verdict ${result.winnerIds.length > 0 ? "qz-verdict--right" : "qz-verdict--wrong"}`}
              >
                {result.winnerIds.length > 0 ? `Bravo ! +${points}` : "Raté !"}
              </p>
            ) : (
              <div className="stack">
                <p className="section-title">Qui a trouvé ? (+{points})</p>
                <div className="chip-list">
                  {game.competitors.map((competitor) => (
                    <button
                      key={competitor.id}
                      type="button"
                      className="chip"
                      aria-pressed={result.winnerIds.includes(competitor.id)}
                      onClick={() => {
                        dispatch({
                          type: "toggleWinner",
                          competitorId: competitor.id,
                        });
                      }}
                    >
                      {competitor.emoji} {competitor.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {question.explanation ? (
              <p className="qz-explanation">{question.explanation}</p>
            ) : null}
            <QuestionFeedback questionId={question.id} />
          </div>
        ) : null}
      </section>

      <div className="qz-actions">
        <Button
          variant="ghost"
          icon={<Flag />}
          onClick={() => {
            dispatch({ type: "finish" });
          }}
        >
          Terminer la partie
        </Button>
        {!result && buzzer ? (
          <Button
            variant="primary"
            size="lg"
            icon={<Eye />}
            onClick={() => {
              dispatch({ type: "reveal" });
            }}
          >
            Révéler la réponse
          </Button>
        ) : null}
        {result ? (
          <Button
            variant="primary"
            size="lg"
            icon={<ArrowRight />}
            onClick={() => {
              dispatch({ type: "next" });
            }}
          >
            {game.index + 1 < game.deck.length
              ? "Question suivante"
              : "Voir les résultats"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function Scoreboard({ game }: { game: GameState }) {
  const scores = new Map(
    standings(game).map((row) => [row.competitor.id, row.score]),
  );
  return (
    <ol className="qz-scoreboard" aria-label="Scores">
      {game.competitors.map((competitor) => (
        <li
          key={competitor.id}
          style={{ "--player-color": competitor.color } as CSSProperties}
        >
          <span aria-hidden="true">{competitor.emoji}</span>
          <span className="qz-scoreboard__name">{competitor.name}</span>
          <strong>{scores.get(competitor.id) ?? 0}</strong>
        </li>
      ))}
    </ol>
  );
}

import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useProfiles } from "@modules/profiles/ui/ProfilesProvider";

import { answerRecords } from "../domain/outcomes";
import type { GameAction, GameState } from "../domain/session";
import { gameReducer } from "../domain/session";

interface GameContextValue {
  game: GameState | null;
  start: (game: GameState) => void;
  dispatch: (action: GameAction) => void;
  clear: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

// The game in progress survives a reload (sessionStorage: this tab only).
const GAME_KEY = "quizz.game.v1";

function loadGame(): GameState | null {
  try {
    const raw = window.sessionStorage.getItem(GAME_KEY);
    return raw ? (JSON.parse(raw) as GameState) : null;
  } catch {
    return null;
  }
}

/**
 * Holds the game in progress and, the moment it finishes, writes what each
 * player played into their profile's history (once per game).
 */
export function GameProvider({ children }: { children: ReactNode }) {
  const { recordGame } = useProfiles();
  const [game, setGame] = useState<GameState | null>(loadGame);
  const recorded = useRef<GameState | null>(
    game?.phase === "finished" ? game : null,
  );

  useEffect(() => {
    try {
      if (game) window.sessionStorage.setItem(GAME_KEY, JSON.stringify(game));
      else window.sessionStorage.removeItem(GAME_KEY);
    } catch {
      // Storage unavailable: the game simply does not survive a reload.
    }
  }, [game]);

  useEffect(() => {
    if (game?.phase !== "finished" || recorded.current?.deck === game.deck)
      return;
    recorded.current = game;
    recordGame(answerRecords(game));
  }, [game, recordGame]);

  const dispatch = useCallback((action: GameAction) => {
    setGame((current) => (current ? gameReducer(current, action) : current));
  }, []);
  const clear = useCallback(() => {
    setGame(null);
  }, []);

  const value = useMemo(
    () => ({ game, start: setGame, dispatch, clear }),
    [game, dispatch, clear],
  );
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const value = useContext(GameContext);
  if (!value) throw new Error("useGame must be used inside <GameProvider>");
  return value;
}

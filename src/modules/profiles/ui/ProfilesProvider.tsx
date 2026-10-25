import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { createId } from "@shared/lib/id";

import type { ProfilesRepository } from "../data/profilesRepository";
import type { Profile, ProfileDraft } from "../domain/profile";
import type { AnswerRecord, ProfileStats } from "../domain/stats";
import { applyGame, emptyStats } from "../domain/stats";

interface ProfilesContextValue {
  profiles: readonly Profile[];
  statsOf: (profileId: string) => ProfileStats;
  saveProfile: (draft: ProfileDraft, id?: string) => Profile;
  deleteProfile: (id: string) => void;
  recordGame: (records: ReadonlyMap<string, readonly AnswerRecord[]>) => void;
}

const ProfilesContext = createContext<ProfilesContextValue | null>(null);

export function ProfilesProvider({
  repository,
  children,
}: {
  repository: ProfilesRepository;
  children: ReactNode;
}) {
  const [profiles, setProfiles] = useState(() => repository.loadProfiles());
  const [stats, setStats] = useState(() => repository.loadStats());

  useEffect(() => {
    repository.saveProfiles(profiles);
  }, [repository, profiles]);
  useEffect(() => {
    repository.saveStats(stats);
  }, [repository, stats]);

  const statsOf = useCallback(
    (id: string) => stats[id] ?? emptyStats(),
    [stats],
  );

  const saveProfile = useCallback(
    (draft: ProfileDraft, id?: string) => {
      const existing = id
        ? profiles.find((profile) => profile.id === id)
        : undefined;
      const profile: Profile = {
        ...draft,
        name: draft.name.trim(),
        id: existing?.id ?? createId(),
        createdAt: existing?.createdAt ?? new Date().toISOString(),
      };
      setProfiles((current) =>
        existing
          ? current.map((other) => (other.id === profile.id ? profile : other))
          : [...current, profile],
      );
      return profile;
    },
    [profiles],
  );

  const deleteProfile = useCallback((id: string) => {
    setProfiles((current) => current.filter((profile) => profile.id !== id));
    setStats((current) => {
      return Object.fromEntries(
        Object.entries(current).filter(([profileId]) => profileId !== id),
      );
    });
  }, []);

  const recordGame = useCallback(
    (records: ReadonlyMap<string, readonly AnswerRecord[]>) => {
      setStats((current) => {
        const next = { ...current };
        for (const [profileId, answers] of records) {
          next[profileId] = applyGame(
            current[profileId] ?? emptyStats(),
            answers,
          );
        }
        return next;
      });
    },
    [],
  );

  const value = useMemo(
    () => ({ profiles, statsOf, saveProfile, deleteProfile, recordGame }),
    [profiles, statsOf, saveProfile, deleteProfile, recordGame],
  );
  return (
    <ProfilesContext.Provider value={value}>
      {children}
    </ProfilesContext.Provider>
  );
}

export function useProfiles(): ProfilesContextValue {
  const value = useContext(ProfilesContext);
  if (!value)
    throw new Error("useProfiles must be used inside <ProfilesProvider>");
  return value;
}

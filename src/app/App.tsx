import { useMemo } from "react";
import { createHashRouter, RouterProvider } from "react-router-dom";

import type { KeyValueStore } from "@shared/storage/keyValueStore";
import { browserStore } from "@shared/storage/keyValueStore";

import { createLocalContributionsRepository } from "@modules/contributions/data/contributionsRepository";
import { ContributionsProvider } from "@modules/contributions/ui/ContributionsProvider";
import { createProfilesRepository } from "@modules/profiles/data/profilesRepository";
import { ProfilesProvider } from "@modules/profiles/ui/ProfilesProvider";
import { GameProvider } from "@modules/quiz/ui/GameProvider";

import { HubPage } from "./HubPage";
import { Layout } from "./Layout";
import { MODULES } from "./modules";
import { NotFoundPage } from "./NotFoundPage";

/**
 * The composition root: adapters are chosen here (browser storage today) and
 * handed to the providers, so the modules never know where data lives.
 */
export function App({ store = browserStore() }: { store?: KeyValueStore }) {
  const repositories = useMemo(
    () => ({
      profiles: createProfilesRepository(store),
      contributions: createLocalContributionsRepository(store),
    }),
    [store],
  );
  // Hash routing: works on any static host (GitHub Pages) without rewrites.
  const router = useMemo(
    () =>
      createHashRouter([
        {
          element: <Layout />,
          children: [
            { path: "/", element: <HubPage /> },
            ...MODULES.flatMap((module) => module.routes ?? []),
            { path: "*", element: <NotFoundPage /> },
          ],
        },
      ]),
    [],
  );
  return (
    <ProfilesProvider repository={repositories.profiles}>
      <ContributionsProvider repository={repositories.contributions}>
        <GameProvider>
          <RouterProvider router={router} />
        </GameProvider>
      </ContributionsProvider>
    </ProfilesProvider>
  );
}

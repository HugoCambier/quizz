import { z } from "zod";

import type { KeyValueStore } from "@shared/storage/keyValueStore";
import { readJson, writeJson } from "@shared/storage/keyValueStore";

import type { Account } from "../domain/account";
import { accountSchema } from "../domain/account";
import type { Contribution } from "../domain/contribution";
import { contributionSchema } from "../domain/contribution";

const ACCOUNT_KEY = "quizz.account.v1";
const CONTRIBUTIONS_KEY = "quizz.contributions.v1";

/**
 * Contributions are shared by nature: this port is asynchronous so the local
 * adapter below can be swapped for a remote one (Supabase, see the ADR)
 * without touching the UI.
 */
export interface ContributionsRepository {
  loadAccount: () => Promise<Account | null>;
  saveAccount: (account: Account) => Promise<void>;
  list: () => Promise<Contribution[]>;
  add: (contribution: Contribution) => Promise<void>;
  update: (contribution: Contribution) => Promise<void>;
}

export function createLocalContributionsRepository(
  store: KeyValueStore,
): ContributionsRepository {
  const read = () =>
    readJson(store, CONTRIBUTIONS_KEY, z.array(contributionSchema), []);
  const write = (contributions: readonly Contribution[]) => {
    writeJson(store, CONTRIBUTIONS_KEY, contributions);
  };
  return {
    loadAccount: () =>
      Promise.resolve(
        readJson(store, ACCOUNT_KEY, accountSchema.nullable(), null),
      ),
    saveAccount: (account) => {
      writeJson(store, ACCOUNT_KEY, account);
      return Promise.resolve();
    },
    list: () => Promise.resolve(read()),
    add: (contribution) => {
      write([...read(), contribution]);
      return Promise.resolve();
    },
    update: (contribution) => {
      write(
        read().map((other) =>
          other.id === contribution.id ? contribution : other,
        ),
      );
      return Promise.resolve();
    },
  };
}

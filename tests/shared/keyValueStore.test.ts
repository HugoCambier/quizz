import { z } from "zod";

import {
  memoryStore,
  readJson,
  writeJson,
} from "@shared/storage/keyValueStore";

describe("readJson", () => {
  const schema = z.object({ n: z.number() });

  it("round-trips a valid value", () => {
    const store = memoryStore();
    writeJson(store, "k", { n: 1 });
    expect(readJson(store, "k", schema, { n: 0 })).toEqual({ n: 1 });
  });

  it("falls back on missing, corrupted or outdated data", () => {
    const store = memoryStore();
    expect(readJson(store, "k", schema, { n: 0 })).toEqual({ n: 0 });
    store.set("k", "{not json");
    expect(readJson(store, "k", schema, { n: 0 })).toEqual({ n: 0 });
    store.set("k", JSON.stringify({ n: "one" }));
    expect(readJson(store, "k", schema, { n: 0 })).toEqual({ n: 0 });
  });
});

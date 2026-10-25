import { createRandom, pickOne, randomInt, shuffle } from "@shared/lib/random";

describe("createRandom", () => {
  it("gives the same sequence for the same seed", () => {
    const a = createRandom(7);
    const b = createRandom(7);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("stays within [0, 1)", () => {
    const random = createRandom(1);
    for (let i = 0; i < 1000; i++) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe("helpers", () => {
  it("randomInt includes both bounds", () => {
    const random = createRandom(3);
    const values = new Set(
      Array.from({ length: 500 }, () => randomInt(random, 1, 3)),
    );
    expect([...values].sort()).toEqual([1, 2, 3]);
  });

  it("shuffle keeps every item and leaves the input untouched", () => {
    const input = [1, 2, 3, 4, 5];
    const output = shuffle(createRandom(9), input);
    expect(output.slice().sort()).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });

  it("pickOne refuses an empty list", () => {
    expect(() => pickOne(createRandom(1), [])).toThrow();
  });
});

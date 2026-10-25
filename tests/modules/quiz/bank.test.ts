import { THEMES } from "@shared/domain/themes";

import { loadQuestions, QUESTIONS } from "@modules/quiz/bank";

describe("question bank", () => {
  it("loads every theme of the catalogue", () => {
    const themes = new Set(QUESTIONS.map((question) => question.theme));
    expect([...themes].sort()).toEqual(THEMES.map((theme) => theme.id).sort());
  });

  it("has unique ids and unique wordings", () => {
    expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(QUESTIONS.length);
    expect(new Set(QUESTIONS.map((q) => q.question)).size).toBe(
      QUESTIONS.length,
    );
  });

  it("rejects a malformed file with its name", () => {
    const bad = {
      theme: "cinema",
      questions: [
        {
          id: "cinema-001",
          difficulty: 3,
          question: "Une question ?",
          options: ["A", "A", "B", "C"],
          answer: 0,
          explanation: "Parce que.",
        },
      ],
    };
    expect(() => loadQuestions({ "./questions/cinema.json": bad })).toThrow(
      /cinema\.json/,
    );
  });

  it("rejects an id outside its theme", () => {
    const bad = {
      theme: "cinema",
      questions: [
        {
          id: "musique-001",
          difficulty: 3,
          question: "Une question ?",
          options: ["A", "B", "C", "D"],
          answer: 0,
          explanation: "Parce que.",
        },
      ],
    };
    expect(() => loadQuestions({ "x.json": bad })).toThrow();
  });
});

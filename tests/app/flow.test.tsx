import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { App } from "@app/App";

import { memoryStore } from "@shared/storage/keyValueStore";

describe("a first game, end to end", () => {
  it("creates a player, plays a question, reports it and sees the results", async () => {
    const user = userEvent.setup();
    render(<App store={memoryStore()} />);

    await user.click(screen.getByRole("link", { name: /créer un joueur/i }));
    await user.type(screen.getByLabelText(/prénom ou pseudo/i), "Léa");
    await user.click(screen.getByRole("button", { name: /cinéma/i }));
    await user.click(screen.getByRole("button", { name: /enregistrer/i }));
    expect(await screen.findByText("Léa")).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: /^quiz$/i }));
    await user.click(screen.getByRole("button", { name: /léa/i }));
    await user.click(screen.getByRole("button", { name: /entraînement/i }));
    await user.click(screen.getByRole("button", { name: /^3$/ }));
    await user.click(screen.getByRole("button", { name: /lancer la partie/i }));

    expect(await screen.findByText(/au tour de/i)).toBeInTheDocument();
    expect(screen.getByText("Cinéma", { exact: false })).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: /^[ABCD]/ })[0]!);
    expect(screen.getByText(/bravo|raté/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /signaler/i }));
    const dialog = screen.getByRole("dialog");
    await user.type(within(dialog).getByLabelText(/pseudo/i), "Hugo");
    await user.click(
      within(dialog).getByRole("button", { name: /continuer/i }),
    );
    await user.click(
      await within(dialog).findByRole("button", { name: /envoyer/i }),
    );
    expect(
      screen.getByRole("button", { name: /signalé, merci/i }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /terminer la partie/i }),
    );
    expect(
      await screen.findByText(/bonnes? réponses? sur 1/i),
    ).toBeInTheDocument();
  });
});

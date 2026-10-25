# Design system

- Tokens in `src/shared/styles/tokens.css` (colours, radii, spacing, shadows), dark first with a light
  variant under `prefers-color-scheme: light`. Components read tokens, never raw colours (exceptions:
  player/team colours, which are data).
- Shared components: `src/shared/ui/` + `src/shared/styles/components.css` (`.btn`, `.card`, `.chip`,
  `.badge`, `.segmented`, `.field`, `.input`, `.dialog`, `.page`, `.stack`, `.row`).
- Module styles: one stylesheet per module next to its UI, every class prefixed (`hub-`/`app-` shell,
  `qz-` quiz, `pf-` profiles, `ct-` contributions). No CSS-in-JS.
- Toggle buttons use `aria-pressed`; dialogs are native `<dialog>`; every page works at phone width
  (the game is played on a phone passed around the table) and with the keyboard (1-4 / A-D to answer,
  Enter to go on).
- Copy is French, tutoiement, short.

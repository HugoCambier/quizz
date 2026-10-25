import type { ThemeId } from "@shared/domain/themes";
import { THEMES } from "@shared/domain/themes";

/** Toggle chips over the theme catalogue (or a subset of it). */
export function ThemePicker({
  value,
  onChange,
  themes = THEMES.map((theme) => theme.id),
}: {
  value: readonly ThemeId[];
  onChange: (themes: ThemeId[]) => void;
  themes?: readonly ThemeId[];
}) {
  const toggle = (id: ThemeId) => {
    onChange(
      value.includes(id)
        ? value.filter((other) => other !== id)
        : [...value, id],
    );
  };
  return (
    <div className="chip-list">
      {THEMES.filter((theme) => themes.includes(theme.id)).map((theme) => (
        <button
          key={theme.id}
          type="button"
          className="chip"
          aria-pressed={value.includes(theme.id)}
          onClick={() => {
            toggle(theme.id);
          }}
        >
          <span aria-hidden="true">{theme.emoji}</span>
          {theme.label}
        </button>
      ))}
    </div>
  );
}

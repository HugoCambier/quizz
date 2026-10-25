import { useId } from "react";

import { getLevel, MAX_LEVEL, MIN_LEVEL } from "@shared/domain/levels";

export function LevelSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (level: number) => void;
}) {
  const id = useId();
  const level = getLevel(value);
  return (
    <div className="level-slider">
      <label className="level-slider__label" htmlFor={id}>
        <span>{label}</span>
        <span>
          <strong>{value}</strong>/10 · {level.title}
        </span>
      </label>
      <input
        id={id}
        type="range"
        min={MIN_LEVEL}
        max={MAX_LEVEL}
        value={value}
        onChange={(event) => {
          onChange(Number(event.target.value));
        }}
      />
    </div>
  );
}

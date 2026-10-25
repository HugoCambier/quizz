import type { CSSProperties } from "react";

export function Avatar({
  emoji,
  color,
  size = 40,
}: {
  emoji: string;
  color: string;
  size?: number;
}) {
  const style = {
    "--avatar-color": color,
    width: size,
    height: size,
    fontSize: size * 0.55,
  } as CSSProperties;
  return (
    <span className="avatar" style={style} aria-hidden="true">
      {emoji}
    </span>
  );
}

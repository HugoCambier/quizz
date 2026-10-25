import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { LinkProps } from "react-router-dom";
import { Link } from "react-router-dom";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface StyleProps {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
}

function classes(
  { variant = "secondary", size = "md" }: StyleProps,
  extra?: string,
) {
  return [
    "btn",
    `btn--${variant}`,
    size === "md" ? "" : `btn--${size}`,
    extra ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function Button({
  variant,
  size,
  icon,
  className,
  children,
  type = "button",
  ...rest
}: StyleProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={classes({ variant, size }, className)}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  icon,
  className,
  children,
  ...rest
}: StyleProps & LinkProps) {
  return (
    <Link className={classes({ variant, size }, className)} {...rest}>
      {icon}
      {children}
    </Link>
  );
}

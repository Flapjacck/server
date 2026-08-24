/* Button — three variants: primary (accent), ghost (transparent), destructive (error red).
   All variants ship with hover, focus, active, and disabled states. */

import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "destructive";
  size?: "sm" | "md";
}

export function Button({
  variant = "ghost",
  size = "md",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={[styles.btn, styles[variant], styles[size], className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}

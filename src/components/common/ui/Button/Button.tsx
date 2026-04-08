import React from "react";
import styles from "./Button.module.css";

type ButtonVariant = "outlined" | "contained" | "text";
type ButtonColor = "orange" | "green" | "primary" | "gray";

type ButtonProps = {
  title: string;
  subtitle?: string;
  variant?: ButtonVariant;
  color?: ButtonColor;
  disabled?: boolean;
  onClick?: () => void;
  href?: string;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({
  title,
  subtitle,
  variant = "outlined",
  color,
  disabled = false,
  onClick,
  href,
  fullWidth = false,
  startIcon,
  endIcon,
}) => {
  const classNames = [
    styles.button,
    styles[variant],
    color ? styles[color] : "",
    fullWidth ? styles.fullWidth : "",
    disabled ? styles.disabled : "",
  ].join(" ");

  const content = (
    <span className={styles.content}>
      {startIcon && <span className={styles.icon}>{startIcon}</span>}

      <span className={styles.textWrapper}>
        <span className={styles.title}>{title}</span>
        {subtitle && (
          <span className={styles.subtitle}>{subtitle}</span>
        )}
      </span>

      {endIcon && <span className={styles.icon}>{endIcon}</span>}
    </span>
  );

  if (href) {
    return (
      <a href={href} className={classNames}>
        {content}
      </a>
    );
  }

  return (
    <button onClick={onClick} disabled={disabled} className={classNames}>
      {content}
    </button>
  );
};
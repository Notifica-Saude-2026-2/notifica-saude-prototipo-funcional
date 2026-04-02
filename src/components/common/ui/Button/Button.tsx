import React from "react";
import styles from "./Button.module.css";

type ButtonVariant = "outlined" | "contained" | "text";

type ButtonProps = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  disabled?: boolean;
  onClick?: () => void;
  href?: string;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "outlined",
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
    fullWidth ? styles.fullWidth : "",
    disabled ? styles.disabled : "",
  ].join(" ");

  const content = (
    <>
      {startIcon && <span className={styles.icon}>{startIcon}</span>}
      <span>{children}</span>
      {endIcon && <span className={styles.icon}>{endIcon}</span>}
    </>
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
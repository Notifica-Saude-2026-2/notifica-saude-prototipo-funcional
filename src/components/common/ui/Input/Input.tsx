import React from "react";
import styles from "./Input.module.css";

type InputProps = {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  error?: string;
  fullWidth?: boolean;
  max?: string;
};

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
  error,
  fullWidth = false,
  max,
}) => {
  const hasError = !!error;

  const containerClass = [
    styles.container,
    fullWidth ? styles.fullWidth : "",
  ].join(" ");

  const inputClass = [
    styles.input,
    hasError ? styles.error : "",
  ].join(" ");

  return (
    <div className={containerClass}>
      {label && <label className={styles.label}>{label}</label>}

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        max={max}
        className={inputClass}
      />

      {hasError && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};
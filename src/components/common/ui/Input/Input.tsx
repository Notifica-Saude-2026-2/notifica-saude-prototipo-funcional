import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import styles from "./Input.module.css";

type InputProps = {
  label?: string;
  labelClassName?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  error?: string;
  fullWidth?: boolean;
  max?: string;
  required?: boolean;
  showPasswordToggle?: boolean;
  "data-testid"?: string;
};

export const Input: React.FC<InputProps> = ({
  label,
  labelClassName,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
  error,
  fullWidth = false,
  max,
  required = false,
  showPasswordToggle = false,
  "data-testid": dataTestId,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const hasError = !!error;
  const isPassword = type === "password";
  const resolvedType = isPassword && showPasswordToggle && showPassword ? "text" : type;

  const containerClass = [styles.container, fullWidth ? styles.fullWidth : ""].join(" ");

  const inputClass = [
    styles.input,
    hasError ? styles.error : "",
    isPassword && showPasswordToggle ? styles.inputWithToggle : "",
  ].join(" ");

  return (
    <div className={containerClass}>
      {label && (
        <span className={[styles.label, labelClassName].filter(Boolean).join(" ")}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </span>
      )}
      {required && <span className={styles.requiredHint}>*Preenchimento obrigatório</span>}

      <div className={styles.inputWrapper}>
        <input
          type={resolvedType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          max={max}
          className={inputClass}
          data-testid={dataTestId}
        />

        {isPassword && showPasswordToggle && (
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            tabIndex={-1}
          >
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        )}
      </div>

      {hasError && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};

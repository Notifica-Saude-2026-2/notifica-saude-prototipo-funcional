import React from "react";
import styles from "./Textarea.module.css";

type TextareaProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  "data-testid"?: string;
};

export const Textarea: React.FC<TextareaProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  "data-testid": dataTestId,
}) => {
  return (
    <div className={styles.container}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      {required && <span className={styles.requiredHint}>*Preenchimento obrigatório</span>}
      <textarea
        className={[styles.textarea, error ? styles.error : ""].join(" ").trim()}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          e.currentTarget.style.height = "auto";
          e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
        }}
        placeholder={placeholder}
        rows={3}
        data-testid={dataTestId}
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};

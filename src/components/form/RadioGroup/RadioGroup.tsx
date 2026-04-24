import React from "react";
import styles from "./RadioGroup.module.css";

export type RadioOption = {
  value: string;
  label: string;
};

type RadioGroupProps = {
  name: string;
  label: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  scrollable?: boolean;
  'data-testid'?: string;
};

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  label,
  options,
  value,
  onChange,
  error,
  required = false,
  scrollable = false,
  'data-testid': dataTestId,
}) => {
  return (
    <div className={styles.container}>
      <span className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </span>

      {required && (
        <span className={styles.requiredHint}>*Preenchimento obrigatório</span>
      )}

      <div
        className={[styles.options, scrollable ? styles.scrollable : ""]
          .join(" ")
          .trim()}
      >
        {options.map((option) => (
          <label key={option.value} className={styles.optionLabel}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className={styles.radio}
              data-testid={dataTestId ? `${dataTestId}-option-${option.value}` : undefined}
            />
            <span className={styles.optionText}>{option.label}</span>
          </label>
        ))}
      </div>

      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};

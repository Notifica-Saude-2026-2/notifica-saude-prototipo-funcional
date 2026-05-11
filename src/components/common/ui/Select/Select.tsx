import React from "react";
import styles from "./Select.module.css";
import type { OpcaoCampo } from "../../../../types/formulario";

type SelectSingleProps = {
  multiple?: false;
  value: string;
  onChange: (value: string) => void;
};

type SelectMultipleProps = {
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
};

type SelectBaseProps = {
  label?: string;
  options: OpcaoCampo[];
  required?: boolean;
  placeholder?: string;
  error?: string;
  "data-testid"?: string;
};

type SelectProps = SelectBaseProps & (SelectSingleProps | SelectMultipleProps);

export const Select: React.FC<SelectProps> = (props) => {
  const {
    label,
    options,
    required = false,
    placeholder,
    error,
    multiple,
    "data-testid": dataTestId,
  } = props;

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (multiple) {
      const selected = Array.from(e.target.selectedOptions, (o) => o.value);
      (props as SelectMultipleProps).onChange(selected);
    } else {
      (props as SelectSingleProps).onChange(e.target.value);
    }
  }

  return (
    <div className={styles.container}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      {required && <span className={styles.requiredHint}>*Preenchimento obrigatório</span>}
      <select
        multiple={multiple}
        value={multiple ? (props as SelectMultipleProps).value : (props as SelectSingleProps).value}
        onChange={handleChange}
        className={[styles.select, error ? styles.error : ""].join(" ").trim()}
        data-testid={dataTestId}
      >
        {!multiple && (
          <option value="" disabled hidden={required}>
            {placeholder ?? "Selecione..."}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.valor}
          </option>
        ))}
      </select>
      {multiple && <span className={styles.hint}>Segure Ctrl/Cmd para selecionar múltiplos</span>}
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};

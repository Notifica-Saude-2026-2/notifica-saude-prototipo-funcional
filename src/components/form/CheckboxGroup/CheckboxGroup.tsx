import React from 'react';
import styles from './CheckboxGroup.module.css';
import type { OpcaoCampo } from '../../../types/formulario';

type CheckboxGroupProps = {
  label: string;
  options: OpcaoCampo[];
  value: string[];
  onChange: (value: string[]) => void;
  required?: boolean;
  error?: string;
};

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  label,
  options,
  value,
  onChange,
  required = false,
  error,
}) => {
  function toggle(id: string) {
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id]
    );
  }

  return (
    <div className={styles.container}>
      <span className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </span>
      {required && (
        <span className={styles.requiredHint}>*Preenchimento obrigatório</span>
      )}
      <div className={styles.options}>
        {options.map((opt) => (
          <label key={opt.id} className={styles.optionLabel}>
            <input
              type="checkbox"
              value={opt.id}
              checked={value.includes(opt.id)}
              onChange={() => toggle(opt.id)}
              className={styles.checkbox}
            />
            <span className={styles.optionText}>{opt.valor}</span>
          </label>
        ))}
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};

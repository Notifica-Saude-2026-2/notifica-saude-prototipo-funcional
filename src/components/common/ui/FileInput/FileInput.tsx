import React from 'react';
import styles from './FileInput.module.css';

type FileInputProps = {
  label?: string;
  onChange: (file: File | null) => void;
  required?: boolean;
  error?: string;
  accept?: string;
};

export const FileInput: React.FC<FileInputProps> = ({
  label,
  onChange,
  required = false,
  error,
  accept,
}) => {
  return (
    <div className={styles.container}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      {required && (
        <span className={styles.requiredHint}>*Preenchimento obrigatório</span>
      )}
      <input
        type="file"
        accept={accept}
        className={styles.input}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};

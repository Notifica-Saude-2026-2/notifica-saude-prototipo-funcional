import React from "react";
import styles from "./Textarea.module.css";
import { SectionInfoBox } from "../../../analise/SectionInfoBox";
import analiseStyles from "../../../analise/Analise.module.css";

type TextareaProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  maxLength?: number;
  /** Texto de ajuda exibido entre a pergunta e o campo, na caixa de informação padrão do sistema. */
  ajuda?: string;
  "data-testid"?: string;
};

export const Textarea: React.FC<TextareaProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  maxLength,
  ajuda,
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
      {ajuda && (
        <SectionInfoBox className={`${analiseStyles.sectionInfoBoxField} ${styles.ajuda}`}>
          {ajuda}
        </SectionInfoBox>
      )}
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
        maxLength={maxLength}
        data-testid={dataTestId}
      />
      <div className={styles.footer}>
        {error && <span className={styles.errorMessage}>{error}</span>}
        {maxLength && (
          <span className={styles.charCount}>
            {value.length} / {maxLength}
          </span>
        )}
      </div>
    </div>
  );
};

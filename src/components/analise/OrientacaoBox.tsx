import type { ReactNode } from "react";
import { BsPinAngleFill } from "react-icons/bs";
import styles from "./Analise.module.css";

type Props = {
  children: ReactNode;
};

/**
 * Caixa de orientação de preenchimento, com destaque visual (cor + ícone) para chamar atenção
 * de quem está preenchendo — antes esse mesmo texto (helpText do campo) aparecia como um <p>
 * discreto e passava despercebido. Ajuste pedido pela proponente (PPT de validação de mudanças
 * da Análise de Causa Raiz): usado em qualquer campo que tenha `helpText` no schema, então
 * cobre Seções 2/3/4/6 e o aprofundamento guiado (Seção 5) de forma consistente.
 */
export function OrientacaoBox({ children }: Props) {
  return (
    <div className={styles.orientacaoBox}>
      <BsPinAngleFill className={styles.orientacaoIcon} size={13} />
      <div className={styles.orientacaoContent}>
        <span className={styles.orientacaoLabel}>Orientação</span>
        <p className={styles.orientacaoText}>{children}</p>
      </div>
    </div>
  );
}

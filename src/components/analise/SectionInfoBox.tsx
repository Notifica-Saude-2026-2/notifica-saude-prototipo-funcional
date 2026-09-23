import type { ReactNode } from "react";
import { FiInfo } from "react-icons/fi";
import styles from "./Analise.module.css";

type Props = {
  children: ReactNode;
  /** Classe extra (ex.: espaçamento menor quando usado abaixo do rótulo de um campo). */
  className?: string;
};

/**
 * Explicação curta da seção do formulário de análise, exibida no topo do conteúdo da seção (antes
 * ficava escondida num ícone "i" ao lado do título). Azul claro + ícone de info, sem título —
 * diferente da OrientacaoBox (verde, "Orientação"), que orienta o preenchimento de um campo.
 */
export function SectionInfoBox({ children, className }: Props) {
  return (
    <div
      className={[styles.sectionInfoBox, className].filter(Boolean).join(" ")}
      role="note"
      data-testid="analise-secao-info"
    >
      <FiInfo className={styles.sectionInfoIcon} size={15} aria-hidden="true" />
      <div className={styles.sectionInfoText}>{children}</div>
    </div>
  );
}

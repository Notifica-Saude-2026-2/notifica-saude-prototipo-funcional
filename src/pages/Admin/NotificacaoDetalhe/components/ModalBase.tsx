import type { CSSProperties } from "react";
import styles from "../NotificacaoDetalhe.module.css";

type Props = {
  children: React.ReactNode;
  onClose: () => void;
  ariaLabel: string;
  modalStyle?: CSSProperties;
};

export function ModalBase({ children, onClose, ariaLabel, modalStyle }: Props) {
  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <div className={styles.modal} style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

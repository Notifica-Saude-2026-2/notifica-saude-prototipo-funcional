import { EditIcon } from "../../../../components/common/icons/EditIcon";
import type { NotificacaoDetalheDTO } from "../../../../types/notificacaoDetalhe";
import styles from "../NotificacaoDetalhe.module.css";

type Props = {
  detalhe: NotificacaoDetalheDTO;
  isOpen: boolean;
  onToggle: () => void;
};

export function AnaliseSection({ detalhe, isOpen, onToggle }: Props) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={onToggle}>
        Análise
        <div className={`${styles.collapseIcon} ${isOpen ? styles.open : styles.closed}`} />
      </div>

      {isOpen && (
        <div className={styles.sectionContent}>
          <span className={styles.sectionValue}>
            {detalhe.classificacao
              ? "Esse incidente ainda está pendente de análise."
              : "Não é possível registrar análises em um incidente sem classificação."}
          </span>
          {detalhe.classificacao && (
            <button className={styles.primaryButton}>
              <EditIcon width={15} stroke="ffffff" /> Registrar análise
            </button>
          )}
        </div>
      )}
    </div>
  );
}

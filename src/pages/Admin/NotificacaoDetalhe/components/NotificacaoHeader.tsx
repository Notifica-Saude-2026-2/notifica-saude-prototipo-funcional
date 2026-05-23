import type { NotificacaoDetalheDTO } from "../../../../types/notificacaoDetalhe";
import { getStatusColors } from "../../../../utils/statusColors";
import styles from "../NotificacaoDetalhe.module.css";

type Props = {
  detalhe: NotificacaoDetalheDTO;
};

export function NotificacaoHeader({ detalhe }: Props) {
  const statusColors = getStatusColors(detalhe.statusRaw);

  return (
    <div className={styles.detailsHeader}>
      <p className={styles.incidentId}>#{detalhe.codigo}</p>

      <div className={styles.headerRight}>
        <div className={styles.headerBadgeGroup}>
          <span className={styles.headerLabel}>Criado em:</span>
          <span className={styles.headerBadge}>{detalhe.dataCadastro}</span>
        </div>

        <div className={styles.headerBadgeGroup}>
          <span className={styles.headerLabel}>Ocorrido em:</span>
          <span className={styles.headerBadge}>{detalhe.dataIncidente}</span>
        </div>

        <div className={styles.headerBadgeGroup}>
          <span className={styles.headerLabel}>Status:</span>
          <span
            className={styles.headerBadge}
            style={{ background: statusColors.bg, color: statusColors.text }}
          >
            {detalhe.statusLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

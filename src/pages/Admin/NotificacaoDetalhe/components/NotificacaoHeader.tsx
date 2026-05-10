import type { NotificacaoDetalheDTO } from "../../../../types/notificacaoDetalhe";
import styles from "../NotificacaoDetalhe.module.css";

type Props = {
  detalhe: NotificacaoDetalheDTO;
};

export function NotificacaoHeader({ detalhe }: Props) {
  const idShort = `#${detalhe.id.slice(0, 8).toUpperCase()}`;

  return (
    <div className={styles.detailsHeader}>
      <p className={styles.incidentId}>{idShort}</p>

      <div className={styles.headerRight}>
        <div className={styles.headerBadgeGroup}>
          <span className={styles.headerLabel}>Grau de dano:</span>
          <span className={styles.headerBadge}>
            {detalhe.classificacao && !detalhe.classificacao.rascunho
              ? detalhe.classificacao.grauDano
              : "Sem"}
          </span>
        </div>

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
          <span className={styles.headerBadge}>{detalhe.statusLabel}</span>
        </div>
      </div>
    </div>
  );
}

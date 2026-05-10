import styles from "../NotificacaoDetalhe.module.css";

export function InfoField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className={styles.infoItem}>
      <div className={styles.fieldHeader}>{label}</div>
      {value ? (
        <div className={styles.fieldValue}>{value}</div>
      ) : (
        <div className={styles.emptyValue}>—</div>
      )}
    </div>
  );
}

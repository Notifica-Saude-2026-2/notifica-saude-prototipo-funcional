import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div>
            <p className={styles.title}>
              Notifica <span className={styles.bold}>Saúde</span>
            </p>
            <p className={styles.email}>notifica.saude@gmail.com</p>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.bottom}>
          <p>© 2026 Notifica Saúde. Todos os direitos reservados</p>
        </div>
      </div>
    </footer>
  );
}

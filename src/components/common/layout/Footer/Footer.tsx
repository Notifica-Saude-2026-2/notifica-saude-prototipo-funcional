import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div>
          <h3 className={styles.title}>Notifica Saúde</h3>
          <p className={styles.email}>notifica.saude@gmail.com</p>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.bottom}>
        <p>© 2026 Notifica Saúde. Todos os direitos reservados</p>
      </div>
    </footer>
  );
}
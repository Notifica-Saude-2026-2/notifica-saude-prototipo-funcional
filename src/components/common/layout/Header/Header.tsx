import styles from "./Header.module.css";
import logo from "../../../../assets/logo_azul.svg";
import { Link } from "react-router-dom"; // 👈 IMPORTANTE

type HeaderProps = {
  isAdmin?: boolean;
};

export function Header({ isAdmin = false }: HeaderProps) {
  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        <img src={logo} alt="Logo Notifica Saúde" />
      </Link>

      <nav className={styles.nav}>{isAdmin && <> </>}</nav>
    </header>
  );
}

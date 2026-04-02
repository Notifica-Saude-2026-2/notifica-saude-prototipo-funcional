import styles from "./Header.module.css";
import logo from "../../../../assets/logo_azul.svg";
import { Button } from "../../ui";

type HeaderProps = {
  isAdmin?: boolean;
};

export function Header({ isAdmin = false }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <img src={logo} alt="Logo Notifica Saúde" />
      </div>

      <nav className={styles.nav}>
        {isAdmin && (
          <>
            <Button variant="text">Dashboard</Button>
            <Button variant="text">Usuários</Button>
            <Button variant="text">Relatórios</Button>
          </>
        )}
      </nav>
    </header>
  );
}
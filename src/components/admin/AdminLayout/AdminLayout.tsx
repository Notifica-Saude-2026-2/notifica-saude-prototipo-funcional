import { useState } from "react";
import type { ReactNode } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import { AdminDrawer } from "../AdminDrawer/AdminDrawer";
import { AccessibilityWidget } from "../../common/ui/AccessibilityWidget/AccessibilityWidget";
import menuIcon from "../../../assets/menu-hamburguer.svg";
import styles from "./AdminLayout.module.css";

type Props = {
  children: ReactNode;
};

export function AdminLayout({ children }: Props) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <AdminDrawer mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <main className={styles.content}>
        {isMobile && (
          <div className={styles.mobileHeader}>
            <button
              className={styles.mobileMenuBtn}
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu de navegação"
            >
              <img src={menuIcon} alt="" width={22} height={22} className={styles.mobileMenuIcon} />
            </button>
            <span className={styles.mobileHeaderTitle}>Notifica Saúde</span>
          </div>
        )}
        {children}
      </main>
      <AccessibilityWidget />
    </div>
  );
}

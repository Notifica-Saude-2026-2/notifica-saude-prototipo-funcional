import type { ReactNode } from "react";
import { AdminDrawer } from "../AdminDrawer/AdminDrawer";
import styles from "./AdminLayout.module.css";

type Props = {
  children: ReactNode;
};

export function AdminLayout({ children }: Props) {
  return (
    <div className={styles.layout}>
      <AdminDrawer />
      <div className={styles.content}>{children}</div>
    </div>
  );
}

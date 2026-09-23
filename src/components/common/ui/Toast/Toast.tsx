import type { IconType } from "react-icons";
import { MdCheck, MdClose, MdWarningAmber } from "react-icons/md";
import styles from "./Toast.module.css";

/** Tipo do aviso — define o ícone e a cor dele:
    - "success" (padrão): ✓ fundo verde — ação concluída (ex.: "Rascunho salvo").
    - "error": ✕ fundo vermelho — algo falhou.
    - "warning": ⚠ fundo laranja — atenção; algo precisa ser corrigido (ex.: limite de caracteres). */
export type ToastVariant = "success" | "error" | "warning";

const ICONS: Record<ToastVariant, IconType> = {
  success: MdCheck,
  error: MdClose,
  warning: MdWarningAmber,
};

type ToastProps = {
  message: string;
  show: boolean;
  variant?: ToastVariant;
};

/**
 * Notificação flutuante (ex.: "Rascunho salvo"). Fica sempre montada e só alterna
 * opacidade/posição via CSS quando `show` muda, pra permitir a transição de entrada/saída.
 * A cor de fundo muda por tipo; texto e ícone são sempre brancos.
 */
export function Toast({ message, show, variant = "success" }: ToastProps) {
  const Icon = ICONS[variant];
  const urgente = variant !== "success";
  return (
    <div
      className={[styles.toast, styles[variant], show ? styles.show : ""].filter(Boolean).join(" ")}
      role={urgente ? "alert" : "status"}
      aria-live={urgente ? "assertive" : "polite"}
      data-variant={variant}
    >
      <Icon className={styles.icon} size={18} aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

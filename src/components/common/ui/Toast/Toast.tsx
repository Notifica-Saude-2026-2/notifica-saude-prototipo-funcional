import styles from "./Toast.module.css";

type ToastProps = {
  message: string;
  show: boolean;
};

/**
 * Notificação flutuante simples (ex.: "Rascunho salvo"). Fica sempre montada e só alterna
 * opacidade/posição via CSS quando `show` muda, pra permitir a transição de entrada/saída.
 */
export function Toast({ message, show }: ToastProps) {
  return (
    <div className={`${styles.toast} ${show ? styles.show : ""}`} role="status" aria-live="polite">
      {message}
    </div>
  );
}

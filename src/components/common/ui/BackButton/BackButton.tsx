import type { ReactNode } from "react";
import { ArrowLeftIcon } from "../../../../assets/icons/ArrowLeftIcon";
import styles from "./BackButton.module.css";

type BackButtonProps = {
  /** Texto do botão (ex.: "Voltar", "Voltar para a notificação"). */
  children: ReactNode;
  onClick: () => void;
  "data-testid"?: string;
  /** Espaçamento extra do contexto onde o botão está (ex.: margem inferior fora de um container
      flex que já teria gap). O visual do botão em si (sem fundo/borda) não muda. */
  className?: string;
};

/**
 * Botão de "voltar" padrão do admin: sem fundo nem borda — só o ícone e o texto, na mesma cor,
 * pra não competir visualmente com as ações primárias da tela. Reutilizável em qualquer tela que
 * precise de um link de "voltar" (basta passar o texto como children).
 */
export function BackButton({
  children,
  onClick,
  "data-testid": testId,
  className,
}: BackButtonProps) {
  return (
    <button
      type="button"
      className={className ? `${styles.backButton} ${className}` : styles.backButton}
      onClick={onClick}
      data-testid={testId}
    >
      <ArrowLeftIcon width={14} stroke="6b6375" />
      {children}
    </button>
  );
}

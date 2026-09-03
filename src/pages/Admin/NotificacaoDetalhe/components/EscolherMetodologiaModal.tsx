import { EscolhaMetodologiaStep } from "../../../../components/analise/EscolhaMetodologiaStep";
import { escolherMetodologiaAnalise } from "../../../../services/notificacaoDetalheService";
import type { MetodologiaAbordagem } from "../../../../types/analise";
import { ModalBase } from "./ModalBase";
import styles from "../NotificacaoDetalhe.module.css";

type Props = {
  notificacaoId: string;
  onClose: () => void;
  onSuccess: (metodologia: MetodologiaAbordagem) => void;
};

/**
 * Passo de escolha da metodologia de investigação (ACR / Protocolo de Londres), usado quando uma
 * notificação foi classificada mas ainda não teve a metodologia definida — por exemplo, se o
 * usuário fechou o modal de classificação antes de concluir esse passo.
 */
export function EscolherMetodologiaModal({ notificacaoId, onClose, onSuccess }: Props) {
  return (
    <ModalBase onClose={onClose} ariaLabel="Escolha da metodologia de investigação">
      <>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Escolha da metodologia de investigação</h2>
        </div>
        <div className={styles.modalBody}>
          <EscolhaMetodologiaStep
            onComplete={async ({ abordagem }) => {
              try {
                await escolherMetodologiaAnalise(notificacaoId, abordagem);
              } catch (e) {
                console.error(e);
              }
              onSuccess(abordagem);
              onClose();
            }}
          />
        </div>
      </>
    </ModalBase>
  );
}

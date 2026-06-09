import { useState } from "react";
import { EnvelopeIcon } from "../../../../assets/icons/EnvelopeIcon";
import {
  encaminharNotificacao,
} from "../../../../services/notificacaoDetalheService";
import { ApiError } from "../../../../services/api";
import { InfoField } from "./InfoField";
import { ModalBase } from "./ModalBase";
import styles from "../NotificacaoDetalhe.module.css";

type Props = {
  notificacaoId: string;
  setorNome: string | null;
  setorDestinoId: string;
  onClose: () => void;
  onSuccess: () => void;
};

export function EncaminhamentoModal({
  notificacaoId,
  setorNome,
  setorDestinoId,
  onClose,
  onSuccess,
}: Props) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  async function handleEncaminhar() {
    setEnviando(true);
    setErro(null);
    try {
      await encaminharNotificacao(notificacaoId, { setor_destino_id: setorDestinoId });
      setEnviado(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 800);
    } catch (err) {
      let msg = "Erro ao encaminhar. Tente novamente.";
      if (err instanceof ApiError) {
        if (err.status === 409) msg = "Esta notificação já foi encaminhada.";
        else if (err.status === 422)
          msg = "A notificação precisa ter uma classificação concluída para ser encaminhada.";
        else if (err.status === 403)
          msg = "Você não tem permissão para encaminhar esta notificação.";
      }
      setErro(msg);
      setEnviando(false);
    }
  }

  return (
    <ModalBase onClose={onClose} ariaLabel="Encaminhar notificação">
      <>
        <div
          className={styles.modalHeader}
          style={{ flexDirection: "column", alignItems: "center", textAlign: "center", gap: "12px" }}
        >
          <EnvelopeIcon width={64} fill="2f4fff" />
          <h2 className={styles.modalTitle} style={{ fontSize: "22px", fontWeight: 500 }}>
            Encaminhar notificação
          </h2>
        </div>

        <div className={styles.modalBody} style={{ padding: "0.75rem 2rem" }}>
          <InfoField label="Setor destinatário" value={setorNome} />

          {enviado && (
            <p className={styles.modalSuccess}>Notificação encaminhada com sucesso.</p>
          )}
          {erro && <p className={styles.modalError}>{erro}</p>}
        </div>

        <div className={styles.modalFooter}>
          <button
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={enviando || enviado}
            data-testid="encaminhamento-btn-cancelar"
          >
            Cancelar
          </button>
          <button
            className={styles.saveBtn}
            onClick={handleEncaminhar}
            disabled={enviando || enviado}
            data-testid="encaminhamento-btn-enviar"
          >
            {enviando ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </>
    </ModalBase>
  );
}

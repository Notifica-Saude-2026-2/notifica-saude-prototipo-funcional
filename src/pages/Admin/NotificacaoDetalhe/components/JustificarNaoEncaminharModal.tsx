import { useState } from "react";
import { decidirEncaminhamentoPosAnalise } from "../../../../services/notificacaoDetalheService";
import { ApiError } from "../../../../services/api";
import { ModalBase } from "./ModalBase";
import styles from "../NotificacaoDetalhe.module.css";

type Props = {
  notificacaoId: string;
  onClose: () => void;
  onSuccess: () => void;
};

export function JustificarNaoEncaminharModal({ notificacaoId, onClose, onSuccess }: Props) {
  const [justificativa, setJustificativa] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const isValido = justificativa.trim().length > 0;

  async function handleConfirmar() {
    if (!isValido) return;
    setEnviando(true);
    setErro(null);
    try {
      await decidirEncaminhamentoPosAnalise(notificacaoId, {
        encaminhar: false,
        justificativa: justificativa.trim(),
      });
      onSuccess();
      onClose();
    } catch (err) {
      let msg = "Erro ao registrar a justificativa. Tente novamente.";
      if (err instanceof ApiError && err.status === 422)
        msg = "Conclua a análise antes de registrar esta decisão.";
      setErro(msg);
      setEnviando(false);
    }
  }

  return (
    <ModalBase onClose={onClose} ariaLabel="Justificar não encaminhamento">
      <>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Não encaminhar ao setor</h2>
        </div>

        <div className={styles.modalBody}>
          <p className={styles.formHint}>
            A análise foi concluída pelo núcleo sem encaminhamento ao setor. Registre o motivo para
            manter o histórico do caso.
          </p>
          <div style={{ marginTop: 12 }}>
            <p className={styles.formQuestion}>Motivo de não encaminhar *</p>
            <textarea
              className={styles.modalInput}
              rows={4}
              maxLength={400}
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              disabled={enviando}
              placeholder="Explique por que o setor não precisa ser acionado..."
              required
              data-testid="justificar-nao-encaminhar-input"
            />
          </div>

          {erro && <p className={styles.modalError}>{erro}</p>}
        </div>

        <div className={styles.modalFooter}>
          <button
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={enviando}
            data-testid="justificar-nao-encaminhar-btn-cancelar"
          >
            Cancelar
          </button>
          <button
            className={styles.saveBtn}
            onClick={handleConfirmar}
            disabled={enviando || !isValido}
            data-testid="justificar-nao-encaminhar-btn-confirmar"
          >
            {enviando ? "Salvando..." : "Confirmar"}
          </button>
        </div>
      </>
    </ModalBase>
  );
}

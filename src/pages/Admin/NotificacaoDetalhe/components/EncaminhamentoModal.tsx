import { useState } from "react";
import { EnvelopeIcon } from "../../../../assets/icons/EnvelopeIcon";
import {
  encaminharNotificacao,
  decidirEncaminhamentoPosAnalise,
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
  /**
   * "pre-analise" (padrão): encaminha a notificação para o setor analisar — muda o status
   * para "Encaminhado" (o núcleo só volta a ver o caso quando o setor concluir a análise).
   *
   * "pos-analise": o núcleo já concluiu a própria análise e está apenas comunicando o setor —
   * ação simples, não muda o fluxo de análise (status vai para "Analisado").
   */
  mode?: "pre-analise" | "pos-analise";
};

export function EncaminhamentoModal({
  notificacaoId,
  setorNome,
  setorDestinoId,
  onClose,
  onSuccess,
  mode = "pre-analise",
}: Props) {
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  const isPosAnalise = mode === "pos-analise";

  async function handleEncaminhar() {
    setEnviando(true);
    setErro(null);
    try {
      if (isPosAnalise) {
        await decidirEncaminhamentoPosAnalise(notificacaoId, {
          encaminhar: true,
          setorDestinoId,
          mensagem: mensagem.trim() || undefined,
        });
      } else {
        await encaminharNotificacao(notificacaoId, {
          setor_destino_id: setorDestinoId,
          mensagem: mensagem.trim() || undefined,
        });
      }
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
          msg = isPosAnalise
            ? "Conclua a análise antes de encaminhar."
            : "A notificação precisa ter uma classificação concluída para ser encaminhada.";
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
          style={{
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "12px",
          }}
        >
          <EnvelopeIcon width={64} fill="2f4fff" />
          <h2 className={styles.modalTitle} style={{ fontSize: "22px", fontWeight: 500 }}>
            {isPosAnalise ? "Encaminhar ao setor" : "Encaminhar notificação"}
          </h2>
        </div>

        <div className={styles.modalBody} style={{ padding: "0.75rem 2rem" }}>
          <InfoField label="Setor destinatário" value={setorNome} />

          {isPosAnalise && (
            <p className={styles.formHint} style={{ marginTop: 4 }}>
              A análise já foi concluída pelo núcleo. Esta notificação apenas avisa o setor sobre o
              resultado — não altera quem é responsável pela análise.
            </p>
          )}

          <div style={{ marginTop: 12 }}>
            <p className={styles.formQuestion}>Mensagem (opcional)</p>
            <textarea
              className={styles.modalInput}
              rows={3}
              maxLength={400}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              disabled={enviando || enviado}
              placeholder="Adicione uma observação para o setor, se necessário..."
              data-testid="encaminhamento-mensagem-input"
            />
          </div>

          {enviado && <p className={styles.modalSuccess}>Notificação encaminhada com sucesso.</p>}
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

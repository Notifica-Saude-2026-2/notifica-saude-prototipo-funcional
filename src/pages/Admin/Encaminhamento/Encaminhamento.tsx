import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "../../../components/admin/AdminLayout/AdminLayout";
import { EnvelopeIcon } from "../../../assets/icons/EnvelopeIcon";
import {
  getNotificacaoById,
  encaminharNotificacao,
} from "../../../services/notificacaoDetalheService";
import { ApiError } from "../../../services/api";
import type { NotificacaoRaw } from "../../../types/notificacaoDetalhe";
import { InfoField } from "../NotificacaoDetalhe/components/InfoField";
import styles from "./Encaminhamento.module.css";

export default function Encaminhamento() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [rawData, setRawData] = useState<NotificacaoRaw | null>(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getNotificacaoById(id)
      .then((raw) => setRawData(raw))
      .catch(() => setErro("Não foi possível carregar os dados da notificação."))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleEncaminhar() {
    if (!id || !rawData?.setor_id) return;
    setEnviando(true);
    setErro(null);
    try {
      await encaminharNotificacao(id, { setor_destino_id: rawData.setor_id });
      navigate(`/incident/${id}`, { replace: true });
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
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AdminLayout>
      <div className={styles.page}>
        {loading && <div className={styles.loading}>Carregando dados da notificação...</div>}

        {!loading && !rawData && !erro && (
          <div className={styles.loading}>Notificação não encontrada.</div>
        )}

        {!loading && !rawData && erro && (
          <div className={styles.loading}>{erro}</div>
        )}

        {!loading && rawData && (
          <div className={styles.card}>
            <div className={styles.cardIcon}>
              <EnvelopeIcon width={64} fill="2f4fff" />
            </div>

            <h1 className={styles.cardTitle}>Encaminhar notificação</h1>

            <InfoField label="Setor destinatário" value={rawData.setor?.nome ?? null} />

            {erro && <p className={styles.error}>{erro}</p>}

            <div className={styles.footer}>
              <button
                className={styles.cancelBtn}
                onClick={() => navigate(`/incident/${id}`)}
                disabled={enviando}
                data-testid="encaminhamento-btn-voltar"
              >
                Voltar
              </button>
              <button
                className={styles.submitBtn}
                onClick={handleEncaminhar}
                disabled={enviando}
                data-testid="encaminhamento-btn-enviar"
              >
                {enviando ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

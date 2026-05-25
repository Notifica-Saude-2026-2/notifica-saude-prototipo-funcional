import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "../../../components/admin/AdminLayout/AdminLayout";
import { EnvelopeIcon } from "../../../assets/icons/EnvelopeIcon";
import {
  getNotificacaoById,
  encaminharNotificacao,
} from "../../../services/notificacaoDetalheService";
import { fetchSetoresParaUnidade } from "../../../hooks/useCamposFormulario";
import { ApiError } from "../../../services/api";
import type { NotificacaoRaw } from "../../../types/notificacaoDetalhe";
import styles from "./Encaminhamento.module.css";

export default function Encaminhamento() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [rawData, setRawData] = useState<NotificacaoRaw | null>(null);
  const [setores, setSetores] = useState<{ id: string; valor: string }[]>([]);
  const [setorDestinoId, setSetorDestinoId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getNotificacaoById(id)
      .then(async (raw) => {
        setRawData(raw);
        const lista = await fetchSetoresParaUnidade(raw.unidade_id);
        setSetores(lista);
        if (raw.setor_id) setSetorDestinoId(raw.setor_id);
      })
      .catch(() => setErro("Não foi possível carregar os dados da notificação."))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleEncaminhar() {
    if (!id || !setorDestinoId) return;
    setEnviando(true);
    setErro(null);
    try {
      await encaminharNotificacao(id, { setor_destino_id: setorDestinoId });
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

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="setor-destinatario">
                Setor destinatário
              </label>
              <select
                id="setor-destinatario"
                className={styles.fieldSelect}
                value={setorDestinoId}
                onChange={(e) => setSetorDestinoId(e.target.value)}
                disabled={enviando}
                data-testid="encaminhamento-select-setor"
              >
                <option value="" disabled hidden>
                  Selecione o setor
                </option>
                {setores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.valor}
                  </option>
                ))}
              </select>
            </div>

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
                disabled={!setorDestinoId || enviando}
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

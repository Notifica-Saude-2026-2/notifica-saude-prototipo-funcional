import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "../../../components/admin/AdminLayout/AdminLayout";
import { ArrowLeftIcon } from "../../../assets/icons/ArrowLeftIcon";
import { EnvelopeIcon } from "../../../assets/icons/EnvelopeIcon";
import {
  getNotificacaoById,
  mapToNotificacaoDetalhe,
  encaminharNotificacao,
} from "../../../services/notificacaoDetalheService";
import { ApiError } from "../../../services/api";
import type { NotificacaoDetalheDTO } from "../../../types/notificacaoDetalhe";
import styles from "./Encaminhamento.module.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isEmailValido(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export default function Encaminhamento() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [detalhe, setDetalhe] = useState<NotificacaoDetalheDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [emailTocado, setEmailTocado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getNotificacaoById(id)
      .then((raw) => setDetalhe(mapToNotificacaoDetalhe(raw)))
      .catch(() => setErro("Não foi possível carregar os dados da notificação."))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleEncaminhar() {
    if (!id || !isEmailValido(email)) return;
    setEnviando(true);
    setErro(null);
    try {
      await encaminharNotificacao(id, email.trim());
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

  const emailInvalido = emailTocado && !isEmailValido(email);
  const podeEncaminhar = isEmailValido(email) && !enviando;

  return (
    <AdminLayout>
      <div className={styles.page}>
        <button className={styles.backLink} onClick={() => navigate(`/incident/${id}`)}>
          <ArrowLeftIcon width={14} stroke="6b6375" /> Voltar para o incidente
        </button>

        {loading && <div className={styles.loading}>Carregando dados da notificação...</div>}

        {!loading && detalhe && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <EnvelopeIcon width={20} fill="2f4fff" />
              <h1 className={styles.cardTitle}>Encaminhar notificação</h1>
              <span className={styles.incidentCode}>#{detalhe.codigo}</span>
            </div>

            <div className={styles.section}>
              <span className={styles.sectionLabel}>Setor destinatário</span>
              <div className={styles.setorValue}>{detalhe.setor}</div>
            </div>

            <div className={styles.section}>
              <label className={styles.sectionLabel} htmlFor="encaminhamento-email-input">
                E-mail do destinatário
              </label>
              <input
                id="encaminhamento-email-input"
                type="email"
                className={`${styles.emailInput} ${emailInvalido ? styles.emailInputError : ""}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmailTocado(true)}
                placeholder="destinatario@exemplo.com"
                disabled={enviando}
                data-testid="encaminhamento-email-input"
              />
              {emailInvalido && (
                <span className={styles.fieldError}>Informe um e-mail válido.</span>
              )}
            </div>

            {erro && <p className={styles.error}>{erro}</p>}

            <div className={styles.footer}>
              <button
                className={styles.cancelBtn}
                onClick={() => navigate(`/incident/${id}`)}
                disabled={enviando}
                data-testid="encaminhamento-btn-cancelar"
              >
                Cancelar
              </button>
              <button
                className={styles.submitBtn}
                onClick={handleEncaminhar}
                disabled={!podeEncaminhar}
                data-testid="encaminhamento-btn-confirmar"
              >
                {enviando ? "Encaminhando..." : "Confirmar encaminhamento"}
              </button>
            </div>
          </div>
        )}

        {!loading && !detalhe && !erro && (
          <div className={styles.loading}>Notificação não encontrada.</div>
        )}

        {!loading && erro && !detalhe && (
          <div className={styles.loading}>{erro}</div>
        )}
      </div>
    </AdminLayout>
  );
}

import { useNavigate } from "react-router-dom";
import { EditIcon } from "../../../../assets/icons/EditIcon";
import { useAuth } from "../../../../hooks/useAuth";
import type { NotificacaoDetalheDTO } from "../../../../types/notificacaoDetalhe";
import styles from "../NotificacaoDetalhe.module.css";

type Props = {
  detalhe: NotificacaoDetalheDTO;
  isOpen: boolean;
  onToggle: () => void;
};

export function AnaliseSection({ detalhe, isOpen, onToggle }: Props) {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const podeEncaminhar =
    (usuario?.perfil === "NSP" || usuario?.perfil === "ADMINISTRADOR") &&
    detalhe.statusRaw === "CLASSIFICADA";

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={onToggle}>
        Análise
        <div className={`${styles.collapseIcon} ${isOpen ? styles.open : styles.closed}`} />
      </div>

      {isOpen && (
        <div className={styles.sectionContent}>
          <span className={styles.sectionValue}>
            {detalhe.classificacao
              ? "Esse incidente ainda está pendente de análise."
              : "Não é possível registrar análises em um incidente sem classificação."}
          </span>
          {podeEncaminhar && (
            <button
              className={styles.primaryButton}
              onClick={() => navigate(`/incident/${detalhe.id}/encaminhamento`)}
              data-testid="btn-encaminhar-notificacao"
            >
              <EditIcon width={15} stroke="ffffff" /> Encaminhar notificação
            </button>
          )}
        </div>
      )}
    </div>
  );
}

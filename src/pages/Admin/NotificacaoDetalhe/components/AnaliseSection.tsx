import { PaperAirplaneIcon } from "../../../../assets/icons/PaperAirplaneIcon";
import { useAuth } from "../../../../hooks/useAuth";
import type { NotificacaoDetalheDTO } from "../../../../types/notificacaoDetalhe";
import styles from "../NotificacaoDetalhe.module.css";

type Props = {
  detalhe: NotificacaoDetalheDTO;
  isOpen: boolean;
  onToggle: () => void;
  onEncaminhar: () => void;
};

export function AnaliseSection({ detalhe, isOpen, onToggle, onEncaminhar }: Props) {
  const { usuario } = useAuth();

  const podeEncaminhar =
    (usuario?.perfil === "NSP" || usuario?.perfil === "ADMINISTRADOR") &&
    detalhe.statusRaw === "CLASSIFICADA";
  const analiseConcluida =
    detalhe.statusRaw === "ANALISADA" || detalhe.statusRaw === "ENCAMINHADA_SETOR";

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={onToggle} data-testid="section-analise-toggle">
        Análise
        <div className={`${styles.collapseIcon} ${isOpen ? styles.open : styles.closed}`} />
      </div>

      {isOpen && (
        <div className={styles.sectionContent}>
          <span className={styles.sectionValue}>
            {analiseConcluida
              ? "A análise deste incidente foi concluída."
              : detalhe.classificacao
                ? "Esse incidente ainda está pendente de análise."
                : "Não é possível registrar análises em um incidente sem classificação."}
          </span>
          {podeEncaminhar && (
            <button
              className={styles.primaryButton}
              onClick={onEncaminhar}
              data-testid="btn-encaminhar-notificacao"
            >
              <PaperAirplaneIcon width={15} stroke="ffffff" /> Encaminhar notificação
            </button>
          )}
        </div>
      )}
    </div>
  );
}

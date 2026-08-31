import { FiEdit3, FiEye, FiEyeOff } from "react-icons/fi";
import type { ActionPlan } from "./ActionPlanModal";
import styles from "../NotificacaoDetalhe.module.css";

type Props = {
  isOpen: boolean;
  onToggle: () => void;
  onRegister: () => void;
  canRegister: boolean;
  actions: ActionPlan[];
  visibleActionId: string | null;
  onToggleDetails: (id: string) => void;
  onUpdate: (action: ActionPlan) => void;
};

export function ActionPlanSection({
  isOpen,
  onToggle,
  onRegister,
  canRegister,
  actions,
  visibleActionId,
  onToggleDetails,
  onUpdate,
}: Props) {
  return (
    <section className={styles.section}>
      <div
        className={styles.sectionHeader}
        onClick={onToggle}
        data-testid="section-plano-acao-toggle"
      >
        Plano de ação
        <div className={`${styles.collapseIcon} ${isOpen ? styles.open : styles.closed}`} />
      </div>
      {isOpen && (
        <div className={styles.sectionContent}>
          {actions.length === 0 ? (
            <span className={styles.sectionValue}>
              {canRegister
                ? "Registre aqui as ações necessárias para tratar o problema identificado."
                : "O plano de ação ficará disponível após a conclusão da análise."}
            </span>
          ) : (
            <div className={styles.actionCardsGrid}>
              {actions.map((action, index) => {
                const detailsVisible = visibleActionId === action.id;
                return (
                  <article className={styles.actionPlanCard} key={action.id}>
                    <div className={styles.actionCardHeader}>
                      <strong>Ação {index + 1}</strong>
                      <div className={styles.actionCardControls}>
                        <span className={`${styles.actionStatus} ${statusClass(action.status)}`}>
                          {action.status}
                        </span>
                        <button
                          className={styles.actionIconButton}
                          aria-label="Atualizar andamento da ação"
                          title="Atualizar andamento da ação"
                          onClick={() => onUpdate(action)}
                        >
                          <FiEdit3 />
                        </button>
                        <button
                          className={styles.actionIconButton}
                          aria-label={detailsVisible ? "Ocultar detalhes" : "Visualizar detalhes"}
                          title={detailsVisible ? "Ocultar detalhes" : "Visualizar detalhes"}
                          onClick={() => onToggleDetails(action.id)}
                        >
                          {detailsVisible ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                    </div>
                    <p className={styles.actionCardLabel}>O que será feito</p>
                    <p className={styles.actionCardValue}>{action.what}</p>
                    <p className={styles.actionCardLabel}>Responsável</p>
                    <p className={styles.actionCardValue}>{action.responsible}</p>
                    <p className={styles.actionCardDates}>
                      <b>Início:</b> {formatDate(action.startDate)} &nbsp; <b>Fim:</b>{" "}
                      {formatDate(action.conclusionDate)}
                    </p>
                    <p className={styles.actionCardUpdated}>
                      Atualizada: {formatUpdatedAt(action.updatedAt)}
                    </p>
                    {detailsVisible && (
                      <div className={styles.actionDetails}>
                        <Detail label="Onde será feito" value={action.where} />
                        <Detail label="Comprovação" value={action.proof} />
                        <Detail label="Resultado esperado" value={action.expectedResult} />
                        <Detail label="Como verificar" value={action.verification} />
                        <Detail label="Quando verificar" value={action.verificationDate} />
                        <Detail
                          label="Resultado observado"
                          value={action.observedResult || "Não informado"}
                        />
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
          {canRegister && (
            <button
              className={styles.primaryButton}
              onClick={onRegister}
              data-testid="btn-registrar-plano-acao"
            >
              <FiEdit3 size={15} />{" "}
              {actions.length ? "Adicionar outra ação" : "Registrar plano de ação"}
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <p>{value}</p>
    </div>
  );
}
function statusClass(status: ActionPlan["status"]) {
  if (status === "Concluído") return styles.actionStatusCompleted;
  if (status === "Parcialmente concluído") return styles.actionStatusPartial;
  if (status === "Atrasada") return styles.actionStatusLate;
  if (status === "Cancelada") return styles.actionStatusCancelled;
  return styles.actionStatusInProgress;
}
function formatDate(date: string) {
  if (!date) return "Não informado";
  const [year, month, day] = date.split("-");
  return day && month && year ? `${day}/${month}/${year}` : date;
}
function formatUpdatedAt(date: string) {
  return date
    ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(
        new Date(date),
      )
    : "Não informado";
}

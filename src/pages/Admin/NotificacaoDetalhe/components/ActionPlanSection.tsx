import { useState } from "react";
import { FiEdit3, FiEye, FiEyeOff, FiTrash2 } from "react-icons/fi";
import type { ActionPlan } from "./ActionPlanModal";
import styles from "../NotificacaoDetalhe.module.css";

type Props = {
  isOpen: boolean;
  onToggle: () => void;
  onRegister: () => void;
  canRegister: boolean;
  // Incidente concluído: apenas leitura — sem editar andamento, sem excluir ações.
  readOnly?: boolean;
  actions: ActionPlan[];
  visibleActionId: string | null;
  onToggleDetails: (id: string) => void;
  onUpdate: (action: ActionPlan) => void;
  onDelete: (actionId: string) => Promise<void> | void;
};

export function ActionPlanSection({
  isOpen,
  onToggle,
  onRegister,
  canRegister,
  readOnly = false,
  actions,
  visibleActionId,
  onToggleDetails,
  onUpdate,
  onDelete,
}: Props) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleConfirmDelete() {
    if (!pendingDeleteId) return;
    setDeleting(true);
    try {
      await onDelete(pendingDeleteId);
      setPendingDeleteId(null);
    } finally {
      setDeleting(false);
    }
  }
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
                        {!readOnly && (
                          <button
                            className={styles.actionIconButton}
                            aria-label="Atualizar andamento da ação"
                            title="Atualizar andamento da ação"
                            onClick={() => onUpdate(action)}
                          >
                            <FiEdit3 />
                          </button>
                        )}
                        <button
                          className={styles.actionIconButton}
                          aria-label={detailsVisible ? "Ocultar detalhes" : "Visualizar detalhes"}
                          title={detailsVisible ? "Ocultar detalhes" : "Visualizar detalhes"}
                          onClick={() => onToggleDetails(action.id)}
                        >
                          {detailsVisible ? <FiEyeOff /> : <FiEye />}
                        </button>
                        {!readOnly && (
                          <button
                            className={`${styles.actionIconButton} ${styles.actionIconButtonDanger}`}
                            aria-label="Excluir ação"
                            title="Excluir ação"
                            onClick={() => setPendingDeleteId(action.id)}
                          >
                            <FiTrash2 />
                          </button>
                        )}
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
                        {action.attachments.length > 0 && (
                          <div className={styles.actionDetailsFull}>
                            <span>Anexos</span>
                            <div className={styles.actionAttachmentList}>
                              {action.attachments.map((attachment) => (
                                <a
                                  key={`${attachment.name}-${attachment.size}`}
                                  href={attachment.dataUrl}
                                  download={attachment.name}
                                  className={styles.actionAttachmentLink}
                                >
                                  {attachment.name}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
          {canRegister && !readOnly && (
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

      {pendingDeleteId && (
        <div className={styles.overlay} onClick={() => !deleting && setPendingDeleteId(null)}>
          <div
            className={styles.confirmModal}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <p className={styles.confirmText}>
              Tem certeza que deseja excluir esse plano de ação? Essa ação não poderá ser desfeita.
            </p>
            <div className={styles.confirmActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setPendingDeleteId(null)}
                disabled={deleting}
                data-testid="btn-excluir-acao-cancelar"
              >
                Não
              </button>
              <button
                className={styles.saveBtnDanger}
                onClick={handleConfirmDelete}
                disabled={deleting}
                data-testid="btn-excluir-acao-confirmar"
              >
                {deleting ? "Excluindo..." : "Sim"}
              </button>
            </div>
          </div>
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

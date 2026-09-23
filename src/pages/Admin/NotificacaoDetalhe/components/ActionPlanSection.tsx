import { useState } from "react";
import { FiEdit2, FiEdit3, FiEye, FiEyeOff, FiRefreshCw, FiTrash2 } from "react-icons/fi";
import { MdWarningAmber } from "react-icons/md";
import { camposPendentesPlano, nomesResponsaveis } from "../../../../types/actionPlan";
import type { ActionPlan } from "./ActionPlanModal";
import styles from "../NotificacaoDetalhe.module.css";

type Props = {
  isOpen: boolean;
  onToggle: () => void;
  onRegister: () => void;
  canRegister: boolean;
  /** Pode editar/completar as ações existentes — basta a análise estar concluída (as ações
      pré-criadas pelas recomendações já existem antes da decisão de encaminhamento). */
  canEdit: boolean;
  // Incidente concluído: apenas leitura — sem editar andamento, sem excluir ações.
  readOnly?: boolean;
  actions: ActionPlan[];
  visibleActionId: string | null;
  onToggleDetails: (id: string) => void;
  onUpdate: (action: ActionPlan) => void;
  /** Editar os dados da ação (todos os campos do plano) — também usado para completar as ações
      pré-criadas a partir das recomendações da Análise. */
  onEdit: (action: ActionPlan) => void;
  onDelete: (actionId: string) => Promise<void> | void;
};

export function ActionPlanSection({
  isOpen,
  onToggle,
  onRegister,
  canRegister,
  canEdit,
  readOnly = false,
  actions,
  visibleActionId,
  onToggleDetails,
  onUpdate,
  onEdit,
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
                // Ação pré-criada a partir de uma recomendação da Análise (só com o "O que será
                // feito"): precisa ser completada antes de ter o andamento acompanhado.
                const pendentes = camposPendentesPlano(action);
                const incompleta = pendentes.length > 0;
                return (
                  <article
                    className={`${styles.actionPlanCard} ${incompleta ? styles.actionPlanCardPending : ""}`}
                    key={action.id}
                    data-testid={`acao-${index + 1}`}
                  >
                    <div className={styles.actionCardHeader}>
                      <strong>Ação {index + 1}</strong>
                      <div className={styles.actionCardControls}>
                        {/* Ação incompleta não mostra status — o aviso de campos obrigatórios
                            pendentes, logo abaixo, já explica a situação. */}
                        {!incompleta && (
                          <span className={`${styles.actionStatus} ${statusClass(action.status)}`}>
                            {action.status}
                          </span>
                        )}
                        {!readOnly && canEdit && (
                          <button
                            className={styles.actionIconButton}
                            aria-label="Editar ação"
                            title="Editar ação"
                            onClick={() => onEdit(action)}
                            data-testid={`acao-${index + 1}-editar`}
                          >
                            <FiEdit2 />
                          </button>
                        )}
                        {!readOnly && !incompleta && (
                          <button
                            className={styles.actionIconButton}
                            aria-label="Atualizar andamento da ação"
                            title="Atualizar andamento da ação"
                            onClick={() => onUpdate(action)}
                          >
                            <FiRefreshCw />
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
                    {action.origemRecomendacao && (
                      <p className={styles.actionCardOrigem}>Veio de uma recomendação da análise</p>
                    )}
                    <p className={styles.actionCardLabel}>O que será feito</p>
                    <p className={styles.actionCardValue}>{action.what || "Não informado"}</p>
                    {incompleta && (
                      <div className={styles.actionPendingBox}>
                        <p className={styles.actionPendingText}>
                          <MdWarningAmber size={15} aria-hidden="true" /> Faltam {pendentes.length}{" "}
                          campo{pendentes.length > 1 ? "s" : ""} obrigatório
                          {pendentes.length > 1 ? "s" : ""} para essa ação poder ser acompanhada.
                        </p>
                        {!readOnly && canEdit && (
                          <button
                            className={styles.actionCompleteBtn}
                            onClick={() => onEdit(action)}
                            data-testid={`acao-${index + 1}-completar`}
                          >
                            Completar preenchimento
                          </button>
                        )}
                      </div>
                    )}
                    <p className={styles.actionCardLabel}>Responsável</p>
                    <p className={styles.actionCardValue}>
                      {nomesResponsaveis(action) || "Não informado"}
                    </p>
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
                        <Detail label="Resultado observado" value={action.observedResult} />
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

/** Um campo nos detalhes da ação — vazio aparece sempre como "Não informado" (mesmo padrão do
    card), nunca em branco. */
function Detail({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div>
      <span>{label}</span>
      <p>{value?.trim() ? value : "Não informado"}</p>
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

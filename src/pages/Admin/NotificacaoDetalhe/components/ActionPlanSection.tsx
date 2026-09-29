import { Fragment, useState } from "react";
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
            // Uma ação por linha; o "olho" abre os demais campos numa linha logo abaixo.
            <div className={styles.planoTabelaWrap}>
              <table className={styles.planoTabela}>
                <thead>
                  <tr>
                    <th>Ação</th>
                    <th>Recomendação</th>
                    <th>Responsável</th>
                    <th>Início</th>
                    <th>Prazo</th>
                    <th>Status</th>
                    <th>Acompanhamento</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {actions.map((action, index) => {
                    const detailsVisible = visibleActionId === action.id;
                    // Ação pré-criada a partir de uma recomendação da Análise (só com o "O que
                    // será feito"): precisa ser completada antes de ter o andamento acompanhado.
                    const pendentes = camposPendentesPlano(action);
                    const incompleta = pendentes.length > 0;
                    return (
                      <Fragment key={action.id}>
                        <tr
                          className={detailsVisible ? styles.planoLinhaAberta : undefined}
                          data-testid={`acao-${index + 1}`}
                        >
                          <td className={styles.planoAcaoTexto}>{action.what || "—"}</td>
                          <td>{action.origemRecomendacao || "—"}</td>
                          <td>{nomesResponsaveis(action) || "—"}</td>
                          <td className={styles.planoData}>{formatDate(action.startDate)}</td>
                          <td className={styles.planoData}>
                            {formatDate(action.conclusionDate)}
                            {action.status === "Atrasada" && action.newConclusionDate && (
                              <span className={styles.planoNovoPrazo}>
                                Nova: {formatDate(action.newConclusionDate)}
                              </span>
                            )}
                          </td>
                          <td>
                            {incompleta ? (
                              <span
                                className={`${styles.planoStatus} ${styles.actionStatusPending}`}
                                title={`Faltam ${pendentes.length} campo(s) obrigatório(s) para essa ação poder ser acompanhada.`}
                              >
                                Preenchimento pendente
                              </span>
                            ) : (
                              <span
                                className={`${styles.planoStatus} ${statusClass(action.status)}`}
                              >
                                {action.status}
                              </span>
                            )}
                          </td>
                          <td>{acompanhamento(action)}</td>
                          <td>
                            <div className={styles.planoAcoes}>
                              {!readOnly && canEdit && (
                                <button
                                  className={styles.actionIconButton}
                                  aria-label={
                                    incompleta ? "Completar preenchimento" : "Editar ação"
                                  }
                                  title={incompleta ? "Completar preenchimento" : "Editar ação"}
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
                                aria-label={
                                  detailsVisible ? "Ocultar detalhes" : "Visualizar detalhes"
                                }
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
                          </td>
                        </tr>
                        {detailsVisible && (
                          <tr className={styles.planoDetalhesLinha}>
                            <td colSpan={8}>
                              {incompleta && (
                                <p className={styles.actionPendingText}>
                                  <MdWarningAmber size={15} aria-hidden="true" /> Faltam{" "}
                                  {pendentes.length} campo{pendentes.length > 1 ? "s" : ""}{" "}
                                  obrigatório{pendentes.length > 1 ? "s" : ""} para essa ação poder
                                  ser acompanhada.
                                </p>
                              )}
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
                              <p className={styles.actionCardUpdated}>
                                Atualizada: {formatUpdatedAt(action.updatedAt)}
                              </p>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
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
/** Última informação de andamento, conforme a situação da ação (ver ActionUpdateModal). */
function acompanhamento(action: ActionPlan) {
  const texto =
    action.status === "Cancelada"
      ? action.cancellationReason
      : action.status === "Atrasada"
        ? action.delayReason
        : action.status === "Concluído"
          ? action.completionDescription || action.observedResult
          : action.observedResult;
  return texto?.trim() || "—";
}
function statusClass(status: ActionPlan["status"]) {
  if (status === "Concluído") return styles.actionStatusCompleted;
  if (status === "Parcialmente concluído") return styles.actionStatusPartial;
  if (status === "Atrasada") return styles.actionStatusLate;
  if (status === "Cancelada") return styles.actionStatusCancelled;
  return styles.actionStatusInProgress;
}
function formatDate(date: string) {
  if (!date) return "—";
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

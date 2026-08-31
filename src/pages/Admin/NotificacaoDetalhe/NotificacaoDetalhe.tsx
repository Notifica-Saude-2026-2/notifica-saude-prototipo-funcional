import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../../../components/admin/AdminLayout/AdminLayout";
import { useNotificacaoDetalhe } from "../../../hooks/useNotificacaoDetalhe";
import { ClassificacaoModal } from "./ClassificacaoModal";
import { ArrowLeftIcon } from "../../../assets/icons/ArrowLeftIcon";
import type { UpdateNotificacaoPayload } from "../../../services/notificacaoDetalheService";
import styles from "./NotificacaoDetalhe.module.css";
import { STATUS_EDITAVEIS } from "../../../constants/notificacaoStatus";

// Componentes extraídos
import { NotificacaoHeader } from "./components/NotificacaoHeader";
import { InformacoesGeraisSection } from "./components/InformacoesGeraisSection";
import { ClassificacaoSection } from "./components/ClassificacaoSection";
import { AnaliseSection } from "./components/AnaliseSection";
import { HistoricoSection } from "./components/HistoricoSection";
import { EditModal } from "./components/EditModal";
import { EncaminhamentoModal } from "./components/EncaminhamentoModal";
import { ActionPlanSection } from "./components/ActionPlanSection";
import { ActionPlanModal, type ActionPlan } from "./components/ActionPlanModal";
import { ActionUpdateModal } from "./components/ActionUpdateModal";

export default function NotificacaoDetalhe() {
  const navigate = useNavigate();
  const {
    detalhe,
    rawData,
    hasData,
    loading,
    update,
    historico,
    salvar,
    onClassificacaoSuccess,
    onArquivarSuccess,
    onEncaminharSuccess,
  } = useNotificacaoDetalhe();

  type SectionKey = "info" | "classification" | "analysis" | "actionPlan" | "history";
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    info: true,
    classification: true,
    analysis: true,
    actionPlan: true,
    history: true,
  });

  const [editOpen, setEditOpen] = useState(false);
  const [classificacaoOpen, setClassificacaoOpen] = useState(false);
  const [encaminhamentoOpen, setEncaminhamentoOpen] = useState(false);
  const [actionPlanOpen, setActionPlanOpen] = useState(false);
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [visibleActionId, setVisibleActionId] = useState<string | null>(null);
  const [actionToUpdate, setActionToUpdate] = useState<ActionPlan | null>(null);
  const analysisCompleted =
    detalhe?.statusRaw === "ANALISADA" || detalhe?.statusRaw === "ENCAMINHADA_SETOR";

  const toggleSection = (key: SectionKey) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  async function handleSave(payload: UpdateNotificacaoPayload) {
    const ok = await salvar(payload);
    if (ok) setTimeout(() => setEditOpen(false), 800);
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className={styles.page}>
          <div className={styles.notFound}>
            <p>Carregando notificação...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!hasData || !detalhe) {
    return (
      <AdminLayout>
        <div className={styles.page}>
          <div className={styles.notFound}>
            <p>Notificação não encontrada ou sessão expirada.</p>
            <button
              className={styles.backLink}
              data-testid="btn-voltar"
              onClick={() => navigate("/admin")}
            >
              <ArrowLeftIcon width={14} stroke="6b6375" /> Voltar para a listagem
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className={styles.page}>
        <button
          className={styles.backLink}
          data-testid="btn-voltar"
          onClick={() => navigate("/admin")}
        >
          <ArrowLeftIcon width={14} stroke="6b6375" /> Voltar
        </button>

        <div className={styles.detailsCard}>
          <NotificacaoHeader detalhe={detalhe} onArquivarSuccess={onArquivarSuccess} />

          <InformacoesGeraisSection
            detalhe={detalhe}
            isOpen={openSections.info}
            onToggle={() => toggleSection("info")}
            onEdit={() => setEditOpen(true)}
          />

          <ClassificacaoSection
            detalhe={detalhe}
            isOpen={openSections.classification}
            onToggle={() => toggleSection("classification")}
            onClassificar={() => setClassificacaoOpen(true)}
          />

          <AnaliseSection
            detalhe={detalhe}
            isOpen={openSections.analysis}
            onToggle={() => toggleSection("analysis")}
            onEncaminhar={() => setEncaminhamentoOpen(true)}
          />

          <ActionPlanSection
            isOpen={openSections.actionPlan}
            onToggle={() => toggleSection("actionPlan")}
            onRegister={() => setActionPlanOpen(true)}
            canRegister={analysisCompleted}
            actions={actionPlans}
            visibleActionId={visibleActionId}
            onToggleDetails={(id) => setVisibleActionId((current) => (current === id ? null : id))}
            onUpdate={setActionToUpdate}
          />

          <HistoricoSection
            detalhe={detalhe}
            historico={historico}
            isOpen={openSections.history}
            onToggle={() => toggleSection("history")}
          />
        </div>

        {editOpen && (
          <EditModal
            detalhe={detalhe}
            rawData={rawData!}
            saving={update.saving}
            saveError={update.saveError}
            saveSuccess={update.saveSuccess}
            onClose={() => setEditOpen(false)}
            onSave={handleSave}
          />
        )}

        {classificacaoOpen && STATUS_EDITAVEIS.has(detalhe.statusRaw) && (
          <ClassificacaoModal
            notificacaoId={detalhe.id}
            classificacaoExistente={detalhe.classificacao ? rawData?.classificacao : null}
            onClose={() => setClassificacaoOpen(false)}
            onSuccess={(classificacao) => {
              onClassificacaoSuccess(classificacao);
              setClassificacaoOpen(false);
            }}
          />
        )}

        {encaminhamentoOpen && rawData && (
          <EncaminhamentoModal
            notificacaoId={detalhe.id}
            setorNome={rawData.setor?.nome ?? null}
            setorDestinoId={rawData.setor_id}
            onClose={() => setEncaminhamentoOpen(false)}
            onSuccess={onEncaminharSuccess}
          />
        )}

        {actionPlanOpen && (
          <ActionPlanModal
            onClose={() => setActionPlanOpen(false)}
            onSave={(plan) => {
              setActionPlans((plans) => [
                ...plans,
                { ...plan, id: createActionId(), updatedAt: new Date().toISOString() },
              ]);
              setActionPlanOpen(false);
            }}
          />
        )}

        {actionToUpdate && (
          <ActionUpdateModal
            action={actionToUpdate}
            onClose={() => setActionToUpdate(null)}
            onSave={(updatedAction) => {
              setActionPlans((plans) =>
                plans.map((action) => (action.id === updatedAction.id ? updatedAction : action)),
              );
              setActionToUpdate(null);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}

function createActionId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `action-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

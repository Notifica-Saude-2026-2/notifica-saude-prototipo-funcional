import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../../../components/admin/AdminLayout/AdminLayout";
import { useNotificacaoDetalhe } from "../../../hooks/useNotificacaoDetalhe";
import { ClassificacaoModal } from "./ClassificacaoModal";
import { BackButton } from "../../../components/common/ui/BackButton";
import {
  registrarPlanoAcao,
  atualizarPlanoAcao,
  type UpdateNotificacaoPayload,
} from "../../../services/notificacaoDetalheService";
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
import { JustificarNaoEncaminharModal } from "./components/JustificarNaoEncaminharModal";
import { EscolherMetodologiaModal } from "./components/EscolherMetodologiaModal";
import { AnaliseResumoModal } from "./components/AnaliseResumoModal";
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
    onDecisaoPosAnaliseSuccess,
    onMetodologiaEscolhida,
    onPlanoAcaoRegistrado,
    onPlanoAcaoAtualizado,
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
  const [encaminhamentoPosAnaliseOpen, setEncaminhamentoPosAnaliseOpen] = useState(false);
  const [justificarNaoEncaminharOpen, setJustificarNaoEncaminharOpen] = useState(false);
  const [escolherMetodologiaOpen, setEscolherMetodologiaOpen] = useState(false);
  const [analiseResumoOpen, setAnaliseResumoOpen] = useState(false);
  const [actionPlanOpen, setActionPlanOpen] = useState(false);
  const [visibleActionId, setVisibleActionId] = useState<string | null>(null);
  const [actionToUpdate, setActionToUpdate] = useState<ActionPlan | null>(null);

  const actionPlans = detalhe?.planosAcao ?? [];
  // O plano de ação só pode ser registrado depois que a análise (núcleo ou setor) foi concluída.
  const analysisCompleted = detalhe?.statusRaw === "ANALISADA" || detalhe?.statusRaw === "EM_ACAO";

  // Próxima recomendação da Análise (ACR/Londres) ainda sem um plano de ação vinculado —
  // usada para pré-preencher o modal de novo plano de ação.
  const recomendacoesPendentes = (detalhe?.analise?.recomendacoes ?? []).filter(
    (r) => !actionPlans.some((p) => p.origemRecomendacao === r.texto),
  );
  const proximaRecomendacao = recomendacoesPendentes[0]?.texto;

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
            <BackButton data-testid="btn-voltar" onClick={() => navigate("/admin")}>
              Voltar para a listagem
            </BackButton>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className={styles.page}>
        <BackButton
          className={styles.backButtonSpacing}
          data-testid="btn-voltar"
          onClick={() => navigate("/admin")}
        >
          Voltar
        </BackButton>

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
            onEncaminharPosAnalise={() => setEncaminhamentoPosAnaliseOpen(true)}
            onJustificarNaoEncaminhar={() => setJustificarNaoEncaminharOpen(true)}
            onEscolherMetodologia={() => setEscolherMetodologiaOpen(true)}
            onVerAnalise={() => setAnaliseResumoOpen(true)}
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
            metodologiaAtual={rawData?.metodologia_analise ?? null}
            onClose={() => setClassificacaoOpen(false)}
            onSuccess={(classificacao, metodologia) => {
              onClassificacaoSuccess(classificacao, metodologia);
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

        {encaminhamentoPosAnaliseOpen && rawData && (
          <EncaminhamentoModal
            notificacaoId={detalhe.id}
            setorNome={rawData.setor?.nome ?? null}
            setorDestinoId={rawData.setor_id}
            mode="pos-analise"
            onClose={() => setEncaminhamentoPosAnaliseOpen(false)}
            onSuccess={onDecisaoPosAnaliseSuccess}
          />
        )}

        {justificarNaoEncaminharOpen && (
          <JustificarNaoEncaminharModal
            notificacaoId={detalhe.id}
            onClose={() => setJustificarNaoEncaminharOpen(false)}
            onSuccess={onDecisaoPosAnaliseSuccess}
          />
        )}

        {escolherMetodologiaOpen && (
          <EscolherMetodologiaModal
            notificacaoId={detalhe.id}
            onClose={() => setEscolherMetodologiaOpen(false)}
            onSuccess={onMetodologiaEscolhida}
          />
        )}

        {analiseResumoOpen && detalhe.analise && (
          <AnaliseResumoModal
            analise={detalhe.analise}
            detalhe={detalhe}
            onClose={() => setAnaliseResumoOpen(false)}
          />
        )}

        {actionPlanOpen && (
          <ActionPlanModal
            initialWhat={proximaRecomendacao}
            origemRecomendacao={proximaRecomendacao}
            onClose={() => setActionPlanOpen(false)}
            onSave={async (plan) => {
              try {
                const planoComId: ActionPlan = {
                  ...plan,
                  id: createActionId(),
                  updatedAt: new Date().toISOString(),
                };
                const raw = await registrarPlanoAcao(detalhe.id, planoComId);
                onPlanoAcaoRegistrado(raw);
                setActionPlanOpen(false);
              } catch {
                window.alert("Erro ao registrar o plano de ação. Tente novamente.");
              }
            }}
          />
        )}

        {actionToUpdate && (
          <ActionUpdateModal
            action={actionToUpdate}
            onClose={() => setActionToUpdate(null)}
            onSave={async (updatedAction) => {
              try {
                const raw = await atualizarPlanoAcao(detalhe.id, updatedAction);
                onPlanoAcaoAtualizado(raw);
              } catch {
                // A ação continua visível com o valor anterior — o usuário pode tentar novamente.
              } finally {
                setActionToUpdate(null);
              }
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

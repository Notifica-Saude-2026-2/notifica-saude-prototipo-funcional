import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "../../../components/admin/AdminLayout/AdminLayout";
import { StepForm } from "../../../components/form/StepForm/StepForm";
import { AnaliseSectionForm } from "../../../components/analise/AnaliseSectionForm";
import { evalCondition } from "../../../components/analise/condition";
import type { TableRow } from "../../../components/analise/TableField";
import styles from "../../../components/analise/Analise.module.css";
import { BackButton } from "../../../components/common/ui/BackButton";
import { Toast } from "../../../components/common/ui/Toast";
import { ANALISE_FLOWS } from "../../../constants/analiseSchema";
import { getGrauDanoColorByLabel } from "../../../utils/statusColors";
import {
  getNotificacaoById,
  mapToNotificacaoDetalhe,
  salvarAnaliseRascunho,
  concluirAnalise,
} from "../../../services/notificacaoDetalheService";
import type { NotificacaoDetalheDTO } from "../../../types/notificacaoDetalhe";
import type { AnaliseFlowId, AnaliseValues, RecomendacaoExtraida } from "../../../types/analise";
import { ANALISE_FLOW_LABEL, METODOLOGIA_TO_FLOW } from "../../../types/analise";

function escalateToLondresCompleto(values: AnaliseValues): AnaliseValues {
  const next: AnaliseValues = { ...values };
  const linha = (values["linha_do_tempo"] as TableRow[] | undefined) ?? [];
  next["cronologia_ampliada"] = linha.map((r) => ({
    data: r.data ?? "",
    hora: r.horario ?? "",
    fato: r.fato ?? "",
    fonte: r.fonte ?? "",
    status: "Confirmado",
  }));
  const problemas = (values["problemas_cuidado"] as TableRow[] | undefined) ?? [];
  const ppc: TableRow[] = problemas.map((r, i) => ({
    numero: String(i + 1),
    esperado: r.esperado ?? "",
    ocorrido: r.ocorrido ?? "",
    fonte: "",
  }));
  next["ppc"] = ppc;
  const checklist = values["fatores_contribuintes"];
  if (checklist && ppc.length > 0) {
    next["secao7"] = [{ ppc_referencia: ppc[0].numero, fatores_contribuintes: checklist }];
  }
  return next;
}

function extrairRecomendacoes(values: AnaliseValues): RecomendacaoExtraida[] {
  const rows = (values["recomendacoes"] as TableRow[] | undefined) ?? [];
  return rows
    .map((r) => (r.recomendacao ?? "").trim())
    .filter((texto) => texto.length > 0)
    .map((texto) => ({ texto }));
}

function ResumoNotificacao({ detalhe }: { detalhe: NotificacaoDetalheDTO }) {
  const grauDanoColor = getGrauDanoColorByLabel(detalhe.classificacao?.grauDano);
  return (
    <div>
      <p style={{ margin: "0 0 6px" }}>
        <strong>Notificação #{detalhe.codigo}</strong> — {detalhe.unidade} · {detalhe.setor}
      </p>
      <p style={{ margin: "0 0 6px" }}>{detalhe.descricao}</p>
      {detalhe.classificacao && (
        <p style={{ margin: 0 }}>
          Classificação: {detalhe.classificacao.tipoIncidente ?? "—"}
          {detalhe.classificacao.grauDano && (
            <>
              {" · Grau do dano: "}
              <span
                style={{
                  fontWeight: 700,
                  color: grauDanoColor?.text,
                  background: grauDanoColor?.bg,
                  padding: grauDanoColor ? "1px 8px" : undefined,
                  borderRadius: grauDanoColor ? 4 : undefined,
                }}
              >
                {detalhe.classificacao.grauDano}
              </span>
            </>
          )}
          {detalhe.classificacao.tiposIncidentes.length > 0
            ? ` · Tipo: ${detalhe.classificacao.tiposIncidentes.join(", ")}`
            : ""}
        </p>
      )}
    </div>
  );
}

export default function AnaliseFlowPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [detalhe, setDetalhe] = useState<NotificacaoDetalheDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [flowId, setFlowId] = useState<AnaliseFlowId | null>(null);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [values, setValues] = useState<AnaliseValues>({});
  const [savedHint, setSavedHint] = useState(false);
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    if (!id) return;
    getNotificacaoById(id).then((raw) => {
      const dto = mapToNotificacaoDetalhe(raw);
      setDetalhe(dto);
      const initialFlow =
        raw.analise?.flowAtivo ??
        (dto.metodologiaAnalise ? METODOLOGIA_TO_FLOW[dto.metodologiaAnalise] : null);
      setFlowId(initialFlow);
      setValues(raw.analise?.valores ?? {});
      setLoading(false);
    });
  }, [id]);

  const flow = flowId ? ANALISE_FLOWS[flowId] : null;
  const section = flow?.sections[sectionIndex];

  const resumoNotificacao = useMemo(
    () => (detalhe ? <ResumoNotificacao detalhe={detalhe} /> : null),
    [detalhe],
  );

  function updateField(fieldId: string, value: unknown) {
    setValues((current) => ({ ...current, [fieldId]: value }));
  }

  async function saveDraft(nextValues: AnaliseValues) {
    if (!id || !flowId) return;
    try {
      await salvarAnaliseRascunho(id, flowId, nextValues);
      setSavedHint(true);
      setTimeout(() => setSavedHint(false), 2000);
    } catch {
      // rascunho é best-effort no protótipo
    }
  }

  async function handleFinish(nextValues: AnaliseValues) {
    if (!id || !flowId) return;
    setFinishing(true);
    const recomendacoes = extrairRecomendacoes(nextValues);
    await concluirAnalise(id, flowId, nextValues, recomendacoes);
    navigate(`/incident/${id}`, { state: { analiseRecomendacoes: recomendacoes } });
  }

  function decisionCanAdvance(): boolean {
    if (!section || section.kind !== "decision") return true;
    return section.fields.every((f) => {
      if (f.type === "readonly" || f.type === "info") return true;
      const v = values[f.id];
      return Array.isArray(v) ? v.length > 0 : !!v;
    });
  }

  async function handleNext() {
    if (!flow || !section) return;

    // Seção de decisão com lógica de escalonamento (Londres Rápido → Completo)
    if (section.kind === "decision" && section.decisionLogic) {
      const rule = section.decisionLogic.find((r) => evalCondition(values, r.if));
      const goto = rule?.next.goto;
      if (goto && goto.includes(".")) {
        const [targetFlowId, targetSectionId] = goto.split(".") as [AnaliseFlowId, string];
        const escalatedValues =
          targetFlowId === "londres_completo" ? escalateToLondresCompleto(values) : values;
        const targetIndex = ANALISE_FLOWS[targetFlowId].sections.findIndex(
          (s) => s.id === targetSectionId,
        );
        setValues(escalatedValues);
        setFlowId(targetFlowId);
        setSectionIndex(targetIndex >= 0 ? targetIndex : 0);
        await saveDraft(escalatedValues);
        return;
      }
      if (goto) {
        const targetIndex = flow.sections.findIndex((s) => s.id === goto);
        if (targetIndex >= 0) {
          setSectionIndex(targetIndex);
          await saveDraft(values);
          return;
        }
      }
    }

    if (section.onSubmit) {
      await handleFinish(values);
      return;
    }

    if (section.onSubmitNext) {
      const targetIndex = flow.sections.findIndex((s) => s.id === section.onSubmitNext);
      setSectionIndex(targetIndex >= 0 ? targetIndex : sectionIndex + 1);
      await saveDraft(values);
      return;
    }

    setSectionIndex((i) => Math.min(i + 1, flow.sections.length - 1));
    await saveDraft(values);
  }

  function handlePrev() {
    if (sectionIndex === 0) {
      if (id) navigate(`/incident/${id}`);
      return;
    }
    setSectionIndex((i) => Math.max(i - 1, 0));
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className={styles.flowPage}>
          <p>Carregando análise...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!detalhe || !flow || !section) {
    return (
      <AdminLayout>
        <div className={styles.flowPage}>
          <p>
            Escolha a metodologia de investigação (no encaminhamento da notificação) antes de
            iniciar a análise.
          </p>
          <BackButton onClick={() => id && navigate(`/incident/${id}`)}>
            Voltar para a notificação
          </BackButton>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className={styles.flowPage}>
        <div className={styles.flowHeader}>
          <BackButton data-testid="btn-voltar-analise" onClick={() => navigate(`/incident/${id}`)}>
            Voltar para a notificação
          </BackButton>
          <h1 style={{ fontSize: 20 }}>{ANALISE_FLOW_LABEL[flowId as AnaliseFlowId]}</h1>
        </div>

        {flow.globalNote && <div className={styles.flowNote}>{flow.globalNote}</div>}

        {/* Resumo da notificação e classificação: na Seção 1 ele já é o próprio conteúdo da seção
            (ver schema); a partir da Seção 2 esse campo não existe mais, então fixamos o mesmo
            resumo acima do formulário pra ele não sumir da tela quando o usuário avança. */}
        {resumoNotificacao && sectionIndex > 0 && (
          <div className={styles.flowResumoFixed}>{resumoNotificacao}</div>
        )}

        <StepForm
          currentStep={sectionIndex + 1}
          totalSteps={flow.sections.length}
          stepTitle={`Seção ${sectionIndex + 1}`}
          onNext={handleNext}
          onPrev={handlePrev}
          isLastStep={!!section.onSubmit}
          canAdvance={decisionCanAdvance() && !finishing}
          submitLabel="Concluir investigação"
          compact
        >
          <AnaliseSectionForm
            section={section}
            values={values}
            onFieldChange={updateField}
            resumoNotificacao={resumoNotificacao}
          />
        </StepForm>

        <Toast message="✓ Rascunho salvo" show={savedHint} />
      </div>
    </AdminLayout>
  );
}

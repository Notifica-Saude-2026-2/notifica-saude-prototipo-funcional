import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BsBellFill } from "react-icons/bs";
import { AdminLayout } from "../../../components/admin/AdminLayout/AdminLayout";
import { StepForm } from "../../../components/form/StepForm/StepForm";
import { AnaliseSectionForm } from "../../../components/analise/AnaliseSectionForm";
import { SectionInfoBox } from "../../../components/analise/SectionInfoBox";
import { listar, validarSecao } from "../../../components/analise/validacao";
import type { MultiChoiceWithOtherValue } from "../../../components/analise/AnaliseFieldRenderer";
import type { ChecklistState } from "../../../components/analise/ChecklistWithDetailField";
import { OUTRO_MAX_LENGTH } from "../../../constants/limites";
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
import { ANALISE_FLOW_LABEL, METODOLOGIA_TO_FLOW, normalizeOption } from "../../../types/analise";

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

function GrauDanoTag({ label }: { label: string }) {
  const cor = getGrauDanoColorByLabel(label);
  return (
    <span
      style={{
        fontWeight: 700,
        color: cor?.text,
        background: cor?.bg,
        padding: cor ? "1px 8px" : undefined,
        borderRadius: cor ? 4 : undefined,
      }}
    >
      {label}
    </span>
  );
}

function ResumoItem({
  label,
  value,
  full,
}: {
  label: string;
  value: React.ReactNode;
  full?: boolean;
}) {
  if (!value) return null;
  return (
    <div className={full ? `${styles.resumoItemFull}` : undefined}>
      <div className={styles.resumoLabel}>{label}</div>
      <div className={styles.resumoValue}>{value}</div>
    </div>
  );
}

/**
 * Resumo completo da notificação + classificação — exibido só na Seção 1. A partir da Seção 2,
 * acima do formulário, aparece apenas o "Incidente em investigação" informado na Seção 1.
 */
function ResumoNotificacao({
  detalhe,
  incidenteInvestigado,
}: {
  detalhe: NotificacaoDetalheDTO;
  /** Texto livre informado pelo analista na Seção 1, identificando qual incidente está sendo investigado. */
  incidenteInvestigado?: string;
}) {
  const classificacao = detalhe.classificacao;
  return (
    <div>
      <p style={{ margin: "0 0 4px" }}>
        <strong>Notificação #{detalhe.codigo}</strong> — {detalhe.unidade} · {detalhe.setor}
      </p>

      {incidenteInvestigado && (
        <p style={{ margin: "0 0 8px" }}>
          <strong>Incidente em investigação:</strong> {incidenteInvestigado}
        </p>
      )}

      <div className={styles.resumoGrid}>
        <ResumoItem label="Descrição" value={detalhe.descricao} full />
        <ResumoItem label="Data do incidente" value={detalhe.dataIncidente} />
        <ResumoItem label="Horário" value={detalhe.horario} />
        <ResumoItem label="Turno" value={detalhe.turno} />
        {detalhe.paciente.envolvido ? (
          <>
            <ResumoItem label="Faixa etária do paciente" value={detalhe.paciente.idade} />
            <ResumoItem label="Sexo do paciente" value={detalhe.paciente.sexo} />
          </>
        ) : (
          <ResumoItem label="Paciente" value="Não envolve o paciente" full />
        )}
        {detalhe.anonima ? (
          <ResumoItem label="Notificante" value="Notificação anônima" full />
        ) : (
          <>
            <ResumoItem label="Nome do notificante" value={detalhe.notificante.nome} />
            <ResumoItem label="Celular/E-mail" value={detalhe.notificante.contato} />
          </>
        )}
      </div>

      {classificacao && (
        <>
          <hr className={styles.resumoDivider} />
          <div className={styles.resumoGrid}>
            <ResumoItem label="Classificação" value={classificacao.tipoIncidente} />
            <ResumoItem
              label="Grau do dano"
              value={classificacao.grauDano && <GrauDanoTag label={classificacao.grauDano} />}
            />
            {classificacao.tipoEspecifico ? (
              <ResumoItem
                label="Tipo específico (Never Event)"
                value={classificacao.tipoEspecifico}
              />
            ) : (
              <ResumoItem
                label="Tipo de incidente"
                value={classificacao.tiposIncidentes.join(", ")}
              />
            )}
            <ResumoItem label="Envolve" value={classificacao.envolvidos.join(", ")} />
            <ResumoItem label="Data da classificação" value={classificacao.dataClassificacao} />
            <ResumoItem label="Observações do NSP" value={classificacao.observacoes} full />
          </div>
        </>
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
  const [limiteToast, setLimiteToast] = useState<string | null>(null);
  /** "Foto" do que estava pendente no último clique em "Próximo". Só isso fica destacado — e cada
      item some quando é corrigido. O que for criado DEPOIS do clique (ex.: uma linha nova na
      cronologia) não aparece em vermelho até a próxima tentativa de avançar. */
  const [pendenciasDoClique, setPendenciasDoClique] = useState<{
    campos: Set<string>;
    celulas: Set<string>;
  } | null>(null);
  const limiteToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!id) return;
    getNotificacaoById(id).then((raw) => {
      const dto = mapToNotificacaoDetalhe(raw);
      setDetalhe(dto);
      // Não existe mais uma etapa dedicada de "escolher metodologia" antes de iniciar a análise —
      // o usuário começa direto pelo fluxo ACR (o mais comum) e o sistema vai adaptando as seções
      // conforme as respostas (ver decisionLogic dos fluxos em analiseSchema.ts).
      const initialFlow: AnaliseFlowId =
        raw.analise?.flowAtivo ??
        (dto.metodologiaAnalise ? METODOLOGIA_TO_FLOW[dto.metodologiaAnalise] : "acr");
      setFlowId(initialFlow);
      setValues(raw.analise?.valores ?? {});
      setLoading(false);
    });
  }, [id]);

  const flow = flowId ? ANALISE_FLOWS[flowId] : null;
  const section = flow?.sections[sectionIndex];

  const incidenteInvestigado = values["incidente_investigado"] as string | undefined;

  const resumoNotificacaoCompleto = useMemo(
    () =>
      detalhe ? (
        <ResumoNotificacao detalhe={detalhe} incidenteInvestigado={incidenteInvestigado} />
      ) : null,
    [detalhe, incidenteInvestigado],
  );

  function mostrarAviso(mensagem: string) {
    setLimiteToast(mensagem);
    if (limiteToastTimer.current) clearTimeout(limiteToastTimer.current);
    limiteToastTimer.current = setTimeout(() => setLimiteToast(null), 4000);
  }

  function mostrarAvisoLimite(label: string, max: number, atual: number) {
    mostrarAviso(`"${label}" deve ter no máximo ${max} caracteres (atual: ${atual}).`);
  }

  // Pendências da seção atual (campos obrigatórios vazios, limites de caracteres...) — recalculadas
  // a cada alteração, então somem da tela assim que a pessoa corrige.
  const pendencias = section ? validarSecao(section, values, flow?.sections) : [];
  const pendenciasPorCampo = pendenciasDoClique
    ? pendencias.reduce<Record<string, { message: string; cells?: string[] }[]>>((acc, p) => {
        if (!pendenciasDoClique.campos.has(p.fieldId)) return acc;
        let { message, cells } = p;
        if (cells) {
          cells = cells.filter((cell) => pendenciasDoClique.celulas.has(`${p.fieldId}|${cell}`));
          if (cells.length === 0) return acc;
          // Células vazias: remonta a mensagem só com as colunas que continuam pendentes.
          if (p.cellLabels) {
            const colunas = [...new Set(cells.map((cell) => p.cellLabels![cell]))];
            const linhas = new Set(
              cells.filter((cell) => /^\d+:/.test(cell)).map((cell) => cell.split(":")[0]),
            );
            message = `Preencha ${listar(colunas)}${linhas.size > 1 ? " nas linhas destacadas" : ""}.`;
          }
        }
        (acc[p.fieldId] ??= []).push({ message, cells });
        return acc;
      }, {})
    : undefined;

  /** Textos que passaram do `maxLength` do schema na seção atual — tanto campos de texto quanto
      células de tabela (ex.: coluna "Nome" do condutor/membros). */
  function textosAcimaDoLimite(vals: AnaliseValues) {
    if (!section) return [];
    const excedidos: { label: string; max: number; atual: number }[] = [];
    for (const f of section.fields) {
      if (f.visibleIf && !evalCondition(vals, f.visibleIf)) continue;
      const v = vals[f.id];
      if (f.maxLength && typeof v === "string" && v.length > f.maxLength) {
        excedidos.push({ label: f.label, max: f.maxLength, atual: v.length });
      }
      if (f.type === "table" && Array.isArray(v)) {
        for (const col of f.columns ?? []) {
          for (const row of v as TableRow[]) {
            const cell = row[col.id] ?? "";
            if (col.maxLength && cell.length > col.maxLength) {
              excedidos.push({
                label: (f.columns ?? []).length === 1 ? f.label : `${f.label} — ${col.label}`,
                max: col.maxLength,
                atual: cell.length,
              });
            }
            // Texto livre de "Outro" num menu de seleção da tabela (valor fora da lista de opções).
            if (col.type === "choice" && col.allowOther && cell.length > OUTRO_MAX_LENGTH) {
              const opcoes = (col.options ?? []).map((o) => normalizeOption(o).value);
              if (!opcoes.includes(cell)) {
                excedidos.push({
                  label: `${f.label} — ${col.label} (Outro)`,
                  max: OUTRO_MAX_LENGTH,
                  atual: cell.length,
                });
              }
            }
          }
        }
      }
      // "Outro" em escolha múltipla (ex.: Fontes consultadas).
      if (f.type === "choice" && f.multiple && f.allowOther && v) {
        const st = v as MultiChoiceWithOtherValue;
        const outro = st.outro ?? "";
        if (st.selected?.includes("OUTRO") && outro.length > OUTRO_MAX_LENGTH) {
          excedidos.push({
            label: `${f.label} (Outro)`,
            max: OUTRO_MAX_LENGTH,
            atual: outro.length,
          });
        }
      }
    }
    // "Outro / não mapeado" no checklist de fatores contribuintes — que pode estar numa seção
    // repetida por item (valores guardados em values[section.id][item][campo]).
    const checklists = section.fields.filter(
      (f) => f.type === "checklist_with_detail" && f.allowOther,
    );
    const instancias: Record<string, unknown>[] = section.repeatablePerSelectedItemOf
      ? Object.values((vals[section.id] as Record<string, Record<string, unknown>>) ?? {})
      : [vals];
    for (const inst of instancias) {
      for (const f of checklists) {
        const st = inst?.[f.id] as ChecklistState | undefined;
        const txt = st?.otherText ?? "";
        if (st?.otherChecked && txt.length > OUTRO_MAX_LENGTH) {
          excedidos.push({
            label: `${f.otherLabel ?? "Outro"}`,
            max: OUTRO_MAX_LENGTH,
            atual: txt.length,
          });
        }
      }
    }
    return excedidos;
  }

  function updateField(fieldId: string, value: unknown) {
    // Avisa no momento em que um texto passa do limite (não a cada tecla depois disso).
    const antes = textosAcimaDoLimite(values).length;
    const depois = textosAcimaDoLimite({ ...values, [fieldId]: value });
    if (depois.length > antes) {
      const novo = depois[depois.length - 1];
      mostrarAvisoLimite(novo.label, novo.max, novo.atual);
    } else if (section?.repeatablePerSelectedItemOf) {
      // Seção repetida por item (ex.: 5 Porquês da 4A): usa a validação completa pra detectar o
      // momento em que algum texto passa do limite.
      const limite = (p: { message: string }) => p.message.includes("máximo de");
      const qtd = (ps: { cells?: string[] }[]) =>
        ps.reduce((n, p) => n + (p.cells?.length ?? 1), 0);
      const antesR = qtd(validarSecao(section, values, flow?.sections).filter(limite));
      const depoisR = validarSecao(section, { ...values, [fieldId]: value }, flow?.sections).filter(
        limite,
      );
      if (qtd(depoisR) > antesR) {
        const novo = depoisR[depoisR.length - 1];
        mostrarAviso(novo.message.split(" · ").pop()!.replace(/\.$/, "") + ".");
      }
    }
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

  async function handleNext() {
    if (!flow || !section) return;

    // Pendências: não avança, destaca os campos com problema, avisa e rola até o primeiro.
    if (pendencias.length > 0) {
      setPendenciasDoClique({
        campos: new Set(pendencias.map((p) => p.fieldId)),
        celulas: new Set(
          pendencias.flatMap((p) => (p.cells ?? []).map((cell) => `${p.fieldId}|${cell}`)),
        ),
      });
      mostrarAviso(
        pendencias.length === 1
          ? `${pendencias[0].label}: ${pendencias[0].message}`
          : `Corrija os ${pendencias.length} itens destacados para continuar.`,
      );
      setTimeout(() => {
        document
          .querySelector('[data-pendencia="true"]')
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return;
    }
    setPendenciasDoClique(null);

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
      // "Checagem de suficiência" concluindo que a análise já está completa (Londres Rápido) —
      // não há mais uma seção de Plano de Ação própria pra ir em seguida, então encerra aqui.
      if (goto === "fim") {
        await handleFinish(values);
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
    setPendenciasDoClique(null);
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
          <p>Não foi possível carregar esta análise.</p>
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

        {sectionIndex > 0 && incidenteInvestigado?.trim() && (
          <div
            className={styles.flowResumoFixed}
            data-testid="analise-incidente-investigado"
            style={{ marginBottom: 12 }}
          >
            <BsBellFill className={styles.flowResumoIcon} size={15} aria-hidden="true" />
            <span>
              <strong>Incidente em investigação:</strong> {incidenteInvestigado}
            </span>
          </div>
        )}

        <StepForm
          currentStep={sectionIndex + 1}
          totalSteps={flow.sections.length}
          stepTitle={section.title}
          onNext={handleNext}
          onPrev={handlePrev}
          isLastStep={!!section.onSubmit}
          // Sempre clicável: com pendências, o clique mostra o que falta em vez de não fazer nada.
          canAdvance={!finishing}
          submitLabel="Concluir investigação"
          compact
        >
          {section.description && <SectionInfoBox>{section.description}</SectionInfoBox>}
          <AnaliseSectionForm
            section={section}
            values={values}
            onFieldChange={updateField}
            resumoNotificacao={resumoNotificacaoCompleto}
            allSections={flow.sections}
            pendencias={pendenciasPorCampo}
          />
        </StepForm>

        <Toast message="Rascunho salvo" show={savedHint && !limiteToast} variant="success" />
        <Toast message={limiteToast ?? ""} show={!!limiteToast} variant="warning" />
      </div>
    </AdminLayout>
  );
}

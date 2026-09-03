// --------------------------------------------------------------------------
// Tipos estruturais da jornada de Análise de Incidente (ACR / Protocolo de
// Londres). Modelam o schema (declarativo, orientado a dados) usado pelo
// motor genérico de renderização em src/components/analise.
// --------------------------------------------------------------------------

export type AnaliseValues = Record<string, unknown>;

export type AnaliseCondition =
  | { field: string; isEmpty: boolean }
  | { field: string; equals: string }
  | { field: string; countExcluding: string; gte?: number; lte?: number };

export type ChoiceOptionObj = {
  value: string;
  label: string;
  tooltip?: string;
  disabledIf?: AnaliseCondition;
  disabledReason?: string;
};

export type ChoiceOption = string | ChoiceOptionObj;

export function normalizeOption(opt: ChoiceOption): ChoiceOptionObj {
  return typeof opt === "string" ? { value: opt, label: opt } : opt;
}

export type TableColumnType = "text" | "textarea" | "date" | "time" | "choice";

export type TableColumn = {
  id: string;
  label: string;
  type: TableColumnType;
  options?: ChoiceOption[];
  helpText?: string;
};

export type ChecklistItemDef = { id: string; label: string; example?: string };
export type DetailFieldDef = { id: string; label: string; type: "textarea" | "text" };

export type ItemCommonFieldDef = { id: string; label: string; type: "text" };

export type ItemChoiceOptionDef = { value: string; label: string; when?: string };

export type ItemChoiceFieldDef = {
  id: string;
  label: string;
  type: "choice";
  multiple: boolean;
  options: ItemChoiceOptionDef[];
};

export type ItemSchemaFieldDef = {
  id: string;
  label: string;
  type: "text" | "textarea" | "table";
  columns?: TableColumn[];
  repeatable?: boolean;
  fixedRows?: string[];
  helpText?: string;
};

export type ItemSchemaDef = { fields: ItemSchemaFieldDef[] };

export type AnaliseFieldType =
  | "readonly"
  | "text"
  | "textarea"
  | "date"
  | "time"
  | "choice"
  | "table"
  | "checklist_with_detail"
  | "computed"
  | "info"
  | "repeatable_choice_group";

export type AnaliseField = {
  id: string;
  label: string;
  type: AnaliseFieldType;
  helpText?: string;
  designNote?: string;
  description?: string;
  source?: string;
  options?: ChoiceOption[];
  multiple?: boolean;
  allowOther?: boolean;
  otherLabel?: string;
  visibleIf?: AnaliseCondition;
  repeatable?: boolean;
  minRows?: number;
  fixedRows?: string[];
  columns?: TableColumn[];
  /** Nome no singular de cada linha de uma tabela repetível (ex.: "PPC", "Recomendação",
      "Entrevista") — usado no título do card de cada linha ("PPC #1"). Sem isso, cai no genérico
      "Linha N". */
  itemLabel?: string;
  pullsInto?: string;
  prefilledFrom?: string;
  taxonomy?: string;
  linkedTo?: string;
  items?: ChecklistItemDef[];
  detailFields?: DetailFieldDef[];
  generatedFrom?: string;
  itemCommonFields?: ItemCommonFieldDef[];
  itemChoiceField?: ItemChoiceFieldDef;
  itemSchemas?: Record<string, ItemSchemaDef>;
};

export type DecisionThen = {
  suggestion?: string;
  suggestedOptions?: string[];
  hide?: string[];
  goto?: string;
  carryOverData?: string[];
  mapping?: Record<string, string>;
};

export type DecisionRule = {
  if: AnaliseCondition;
  next: DecisionThen;
};

export type AnaliseSectionSchema = {
  id: string;
  title: string;
  kind: "form" | "decision";
  description?: string;
  fields: AnaliseField[];
  onSubmitNext?: string;
  onSubmit?: { action: string; next: string };
  decisionLogic?: DecisionRule[];
  /** Quando presente, a seção se repete uma vez por linha da tabela referenciada (ex.: "secao6.ppc"). */
  repeatablePerItemOf?: string;
};

export type AnaliseFlowId = "acr" | "londres_rapido" | "londres_completo";

export type AnaliseFlowSchema = {
  flowId: AnaliseFlowId;
  flowName: string;
  globalNote?: string;
  sections: AnaliseSectionSchema[];
};

export type MetodologiaAbordagem = "ACR" | "LONDRES_RAPIDO" | "LONDRES_COMPLETO";

export const METODOLOGIA_LABEL: Record<MetodologiaAbordagem, string> = {
  ACR: "ACR — Análise de Causa Raiz",
  LONDRES_RAPIDO: "Protocolo de Londres — Investigação rápida",
  LONDRES_COMPLETO: "Protocolo de Londres — Investigação completa",
};

export const ANALISE_FLOW_LABEL: Record<AnaliseFlowId, string> = {
  acr: "ACR — Análise de Causa Raiz",
  londres_rapido: "Protocolo de Londres — Investigação rápida",
  londres_completo: "Protocolo de Londres — Investigação completa",
};

export const METODOLOGIA_TO_FLOW: Record<MetodologiaAbordagem, AnaliseFlowId> = {
  ACR: "acr",
  LONDRES_RAPIDO: "londres_rapido",
  LONDRES_COMPLETO: "londres_completo",
};

// --------------------------------------------------------------------------
// Estado persistido (mock) da análise de um incidente
// --------------------------------------------------------------------------

/** Uma recomendação extraída de uma seção "Recomendações", pronta para virar item do Plano de Ação. */
export type RecomendacaoExtraida = {
  texto: string;
};

export type AnaliseRaw = {
  id: string;
  notificacao_id: string;
  metodologia: MetodologiaAbordagem;
  /** Id do fluxo de schema ativo no momento (pode mudar se Londres Rápido escalar para Completo). */
  flowAtivo: AnaliseFlowId;
  concluida: boolean;
  valores: AnaliseValues;
  recomendacoes: RecomendacaoExtraida[];
  data_inicio: string;
  data_conclusao: string | null;
  responsavel_nome: string;
};

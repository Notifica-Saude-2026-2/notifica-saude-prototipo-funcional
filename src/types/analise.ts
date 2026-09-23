// --------------------------------------------------------------------------
// Tipos estruturais da jornada de Análise de Incidente (ACR / Protocolo de
// Londres). Modelam o schema (declarativo, orientado a dados) usado pelo
// motor genérico de renderização em src/components/analise.
// --------------------------------------------------------------------------

import type { TooltipLegendItem } from "../components/common/ui/InfoTooltip";

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

export type TableColumnType =
  | "text"
  | "textarea"
  | "date"
  | "time"
  | "choice"
  | "currency"
  /** Número da linha preenchido automaticamente pela posição (1, 2, 3...) — não editável.
      Ex.: coluna "Nível" dos 5 Porquês, que deve acompanhar sozinha a ordem das linhas. */
  | "auto-index";

export type TableColumn = {
  id: string;
  label: string;
  type: TableColumnType;
  /** Texto de exemplo exibido no campo vazio. Sem isso, texto livre usa "Digite aqui...". */
  placeholder?: string;
  /** Limite de caracteres da célula (colunas text/textarea). Mesmo comportamento do `maxLength`
      de campo: contador, toast ao ultrapassar e bloqueio do avanço de seção. */
  maxLength?: number;
  /** Largura fixa da coluna quando a tabela é exibida como grade (ex.: "420px") — sobrescreve a
      largura padrão por tipo (ver COLUMN_WIDTH em TableField.tsx). */
  tableWidth?: string;
  /** Peso da largura da coluna na linha de campos curtos do card (ex.: 2, 6, 2 = 20%/60%/20%).
      Sem isso, os campos curtos dividem a linha em duas colunas iguais. */
  width?: number;
  options?: ChoiceOption[];
  helpText?: string;
  /** Legenda estruturada (uma linha por item, com bolinha colorida opcional) para o tooltip do
      cabeçalho da coluna — usar no lugar de `helpText` quando a explicação for uma lista de
      opções (ex.: o que cada valor de "Status" significa). Ver InfoTooltip. */
  helpTextItems?: TooltipLegendItem[];
  /** Coluna "choice" com uma opção "Outro" que revela um campo de texto livre ao ser selecionada. */
  allowOther?: boolean;
  /** Ao clicar em "Adicionar linha", pré-preenche este campo com o valor de outra coluna da linha
      anterior (opcionalmente envolvido num prefixo/sufixo) — ex.: nos "5 Porquês", a pergunta do
      próximo nível já vem sugerida a partir da resposta do nível anterior ("Por que <resposta>?").
      Só um ponto de partida: o campo continua editável normalmente depois. Não faz nada na
      primeira linha (não há linha anterior pra copiar). */
  deriveFromPreviousRow?: {
    sourceColumnId: string;
    prefix?: string;
    suffix?: string;
  };
};

export type ChecklistItemDef = { id: string; label: string; example?: string };
export type DetailFieldDef = {
  id: string;
  label: string;
  type: "textarea" | "text";
  placeholder?: string;
};

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
  layout?: "table" | "cards";
  /** Rótulo de cada item repetido (ex.: "Porquê" -> "Porquê #1"). Pré-existente — apenas
      faltava no tipo; já era usado em runtime (ver "niveis" do 5 Porquês). */
  itemLabel?: string;
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
  | "repeatable_choice_group"
  | "item_selector";

export type AnaliseField = {
  id: string;
  label: string;
  type: AnaliseFieldType;
  helpText?: string;
  /** Ver TableColumn.helpTextItems — mesma ideia, pro tooltip do rótulo do campo (não de coluna). */
  helpTextItems?: TooltipLegendItem[];
  /** Mostra o `helpText` como caixa de informação (azul claro, ícone de info) logo abaixo do
      rótulo do campo, em vez de escondido no ícone "i" com tooltip. */
  helpTextInline?: boolean;
  /** Texto de exemplo exibido no campo vazio (text/textarea). Sem isso, usa "Digite aqui...". */
  placeholder?: string;
  designNote?: string;
  description?: string;
  source?: string;
  /** Marca o campo como obrigatório para avançar de seção — ver formCanAdvance em AnaliseFlowPage.
      Em campos "table", exige ao menos uma linha e TODAS as colunas preenchidas em cada linha
      (inclusive o texto de "Outro", quando essa opção for escolhida). */
  required?: boolean;
  /** Tabela opcional (pode ficar sem nenhuma linha), mas cada linha adicionada precisa ter TODAS
      as colunas preenchidas para avançar de seção. Ex.: "Demais membros participantes". */
  requireCompleteRows?: boolean;
  /** Limite de caracteres de um campo de texto. Ultrapassar exibe um toast de aviso e bloqueia o
      avanço de seção (ver handleNext em AnaliseFlowPage) — não corta o texto digitado. */
  maxLength?: number;
  options?: ChoiceOption[];
  multiple?: boolean;
  allowOther?: boolean;
  otherLabel?: string;
  visibleIf?: AnaliseCondition;
  repeatable?: boolean;
  minRows?: number;
  /** Máximo de linhas de uma tabela repetível — ao atingir, o botão de adicionar é desabilitado e
      aparece um aviso (ex.: 5 Porquês, até 15 níveis). */
  maxRows?: number;
  /** Impede remover linhas abaixo de `minRows` (o botão "Remover" some da última linha restante). */
  lockMinRows?: boolean;
  fixedRows?: string[];
  columns?: TableColumn[];
  /** Força a tabela repetível a renderizar como grid (linhas/colunas) mesmo tendo coluna de texto
      longo — por padrão esses casos viram uma lista de cards (ver TableField.tsx). Usado quando
      o valor de ter tudo alinhado em colunas (ex.: cronologia, 5 Porquês) supera o aperto do
      texto longo, que quebra dentro da célula normalmente. */
  layout?: "table" | "cards";
  /** Em telas estreitas (celular), cada linha da tabela vira um bloco empilhado (rótulo acima de
      cada campo) em vez de rolar na horizontal. Usado nas tabelas do plano de ação. */
  stackOnMobile?: boolean;
  /** Nome no singular de cada linha de uma tabela repetível (ex.: "PPC", "Recomendação",
      "Entrevista") — usado no título do card de cada linha ("PPC #1"). Sem isso, cai no genérico
      "Linha N". */
  itemLabel?: string;
  /** Texto do botão de adicionar linha de uma tabela repetível (ex.: "+ Adicionar membro"). Sem
      isso, cai no genérico "+ Adicionar linha". */
  addButtonLabel?: string;
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
  /** Fontes de itens para um campo "item_selector" (Seção 4 — seleção de fatores a investigar):
      cada entrada aponta para uma tabela já preenchida em seção anterior (ex.: cronologia, ppc)
      e diz qual coluna usar como prévia de texto no card de seleção. */
  selectorSources?: { fieldId: string; itemLabel: string; textColumnId: string }[];
  /** No checklist de fatores contribuintes: habilita, em cada categoria marcada, o gatilho
      "Por que isso aconteceu?" que abre um 5 Porquês embutido vinculado àquele achado — em vez de
      uma seção de aprofundamento solta e desconectada. */
  enablePorques?: boolean;
  /** Para um campo "computed" que é o diagrama de Ishikawa por item (Seção de Resultado): de onde
      juntar os dados, já que os fatores contribuintes agora são por item selecionado, não mais um
      único checklist global (ver `generatedFrom`, que cobria só esse caso antigo). As
      `selectorSources` são as mesmas do campo "item_selector" referenciado — duplicadas aqui de
      propósito para o diagrama não precisar de acesso ao schema de outras seções, só aos valores. */
  ishikawaSource?: {
    selectorFieldId: string;
    selectorSources: { fieldId: string; itemLabel: string; textColumnId: string }[];
    perItemSectionId: string;
    checklistFieldId: string;
  };
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
  /** Quando presente, a seção se repete uma vez por item MARCADO no campo "item_selector"
      referenciado (id do campo, ex.: "itens_selecionados") — diferente de repeatablePerItemOf, que
      repete para TODAS as linhas de uma tabela, sem etapa de seleção prévia. */
  repeatablePerSelectedItemOf?: string;
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
  ACR: "Registro de ACR — Análise de Causa Raiz",
  LONDRES_RAPIDO: "Protocolo de Londres — Investigação rápida",
  LONDRES_COMPLETO: "Protocolo de Londres — Investigação completa",
};

export const ANALISE_FLOW_LABEL: Record<AnaliseFlowId, string> = {
  acr: "Registro de ACR — Análise de Causa Raiz",
  londres_rapido: "Protocolo de Londres — Investigação rápida",
  londres_completo: "Protocolo de Londres — Investigação completa",
};

export const METODOLOGIA_TO_FLOW: Record<MetodologiaAbordagem, AnaliseFlowId> = {
  ACR: "acr",
  LONDRES_RAPIDO: "londres_rapido",
  LONDRES_COMPLETO: "londres_completo",
};

/** Sentido inverso de METODOLOGIA_TO_FLOW — usado para preencher a metodologia automaticamente a
    partir do fluxo ativo, já que não existe mais uma etapa dedicada de "escolher metodologia"
    antes de iniciar a análise (ela fica implícita no fluxo que o usuário está de fato seguindo). */
export const FLOW_TO_METODOLOGIA: Record<AnaliseFlowId, MetodologiaAbordagem> = {
  acr: "ACR",
  londres_rapido: "LONDRES_RAPIDO",
  londres_completo: "LONDRES_COMPLETO",
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

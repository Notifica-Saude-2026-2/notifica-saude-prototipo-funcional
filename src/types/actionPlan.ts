// --------------------------------------------------------------------------
// Plano de ação (metodologia SMART) — tipos compartilhados entre o modal de
// registro/atualização e a persistência mockada (localStore).
// --------------------------------------------------------------------------

export type ActionStatus =
  | "Em andamento"
  | "Parcialmente concluído"
  | "Concluído"
  | "Atrasada"
  | "Cancelada";

export type ActionEffect = "" | "Sim" | "Parcialmente" | "Não";

export type ActionAttachment = { name: string; type: string; size: number; dataUrl: string };

/** Uma linha de "pedido + preço" do recurso necessário — mesmo formato genérico usado pelas
    tabelas repetíveis da Análise (ver TableField), pra reaproveitar aquele componente aqui. */
export type ResourceItem = Record<string, string>;

/** Uma linha da tabela "Quem será responsável?" — nome, função e setor (mesma lógica do condutor
    da análise). */
export type ResponsavelRow = Record<string, string>;

/** Limites de caracteres do plano de ação. */
export const PLANO_LIMITES = {
  /** Campos de texto longo (O que será feito, Como comprovar, Resultado esperado...). */
  textoLongo: 500,
  /** Campos de texto curto (Qual aprovação, Qual indicador, Quando verificar, Pedido/item). */
  textoCurto: 100,
  /** "Onde será feito?" quando escolhido "Outro". */
  ondeOutro: 50,
  /** Nome do responsável (igual ao condutor da análise). */
  nomeResponsavel: 50,
} as const;

export type ActionPlan = {
  id: string;
  what: string;
  where: string;
  /** Nomes dos responsáveis juntados (derivado de `responsaveis`) — usado nos cards/histórico. */
  responsible: string;
  /** Responsáveis pela ação (1 ou mais), com nome, função e setor. */
  responsaveis?: ResponsavelRow[];
  startDate: string;
  conclusionDate: string;
  resource: "Sim" | "Não";
  /** Itens de "pedido + preço" do recurso necessário (0 ou mais linhas). */
  resourceItems: ResourceItem[];
  approval: "Sim" | "Não";
  approvalDetail: string;
  proof: string;
  expectedResult: string;
  verification: string;
  verificationDate: string;
  indicator: "Sim" | "Não";
  indicatorDetail: string;
  status: ActionStatus;
  realStartDate: string;
  realConclusionDate: string;
  completionDescription: string;
  observedResult: string;
  effectiveness: ActionEffect;
  effectivenessReason: string;
  delayReason: string;
  newConclusionDate: string;
  cancellationReason: string;
  evidenceLocation: string;
  attachments: ActionAttachment[];
  updatedAt: string;
  /** Texto da recomendação (Análise ACR/Londres) que originou esta ação, quando aplicável. */
  origemRecomendacao?: string;
};

/**
 * Campos obrigatórios do plano de ação que ainda estão vazios (rótulos, na ordem do formulário).
 * Usado para validar o modal de registro/edição e para marcar como "Preenchimento pendente" as
 * ações pré-criadas a partir das recomendações da Análise (que chegam só com o "O que será feito").
 */
export function camposPendentesPlano(plan: ActionPlan): string[] {
  const faltando: string[] = [];
  const vazio = (v: string | undefined) => !(v ?? "").trim();
  if (vazio(plan.what)) faltando.push("O que será feito");
  if (vazio(plan.where)) faltando.push("Onde será feito");
  const responsaveis = plan.responsaveis ?? [];
  const responsaveisOk =
    responsaveis.length > 0
      ? responsaveis.every((r) => !vazio(r.nome) && !vazio(r.funcao) && !vazio(r.setor))
      : !vazio(plan.responsible); // dados antigos: responsável em texto livre
  if (!responsaveisOk) faltando.push("Responsável (nome, função e setor)");
  if (vazio(plan.startDate)) faltando.push("Previsão de início");
  if (vazio(plan.conclusionDate)) faltando.push("Previsão de conclusão");
  if (
    plan.resource === "Sim" &&
    !(
      plan.resourceItems.length > 0 &&
      plan.resourceItems.every((item) => (item.pedido ?? "").trim() && (item.preco ?? "").trim())
    )
  )
    faltando.push("Recurso (qual e quanto irá custar)");
  if (plan.approval === "Sim" && vazio(plan.approvalDetail))
    faltando.push("Aprovação da Alta Gestão");
  if (vazio(plan.proof)) faltando.push("Como comprovar que foi feito");
  if (vazio(plan.expectedResult)) faltando.push("Resultado esperado");
  if (vazio(plan.verification)) faltando.push("Como saber se funcionou");
  if (vazio(plan.verificationDate)) faltando.push("Quando verificar o resultado");
  if (plan.indicator === "Sim" && vazio(plan.indicatorDetail)) faltando.push("Indicador");
  return faltando;
}

export function planoCompleto(plan: ActionPlan): boolean {
  return camposPendentesPlano(plan).length === 0;
}

/** Nomes dos responsáveis para exibição ("Ana Souza, João Lima"). */
export function nomesResponsaveis(plan: ActionPlan): string {
  const nomes = (plan.responsaveis ?? []).map((r) => (r.nome ?? "").trim()).filter(Boolean);
  return nomes.length > 0 ? nomes.join(", ") : plan.responsible;
}

/** A previsão de início não pode ser posterior à previsão de conclusão (datas ISO aaaa-mm-dd). */
export function datasPlanoInvalidas(plan: ActionPlan): boolean {
  return !!plan.startDate && !!plan.conclusionDate && plan.startDate > plan.conclusionDate;
}

/** Textos acima do limite de caracteres (rótulo + limite + tamanho atual). `opcoes` = valores
    fixos dos menus com "Outro" (o que não estiver na lista é texto de "Outro"). */
export function limitesExcedidosPlano(
  plan: ActionPlan,
  opcoes: { funcao: string[]; setor: string[]; outroMax: number },
): string[] {
  const L = PLANO_LIMITES;
  const msgs: string[] = [];
  const checar = (rotulo: string, v: string | undefined, max: number) => {
    const n = (v ?? "").length;
    if (n > max) msgs.push(`${rotulo} (máx. ${max}, atual ${n})`);
  };
  checar("O que será feito", plan.what, L.textoLongo);
  checar("Onde será feito", plan.where, L.ondeOutro);
  (plan.responsaveis ?? []).forEach((r, i) => {
    checar(`Responsável ${i + 1} — Nome`, r.nome, L.nomeResponsavel);
    if (r.funcao && !opcoes.funcao.includes(r.funcao))
      checar(`Responsável ${i + 1} — Função (Outro)`, r.funcao, opcoes.outroMax);
    if (r.setor && !opcoes.setor.includes(r.setor))
      checar(`Responsável ${i + 1} — Setor (Outro)`, r.setor, opcoes.outroMax);
  });
  if (plan.resource === "Sim")
    plan.resourceItems.forEach((item, i) =>
      checar(`Recurso ${i + 1} — Pedido/item`, item.pedido, L.textoCurto),
    );
  if (plan.approval === "Sim") checar("Qual aprovação", plan.approvalDetail, L.textoCurto);
  checar("Como comprovar que foi feito", plan.proof, L.textoLongo);
  checar("Resultado esperado", plan.expectedResult, L.textoLongo);
  checar("Como saber se funcionou", plan.verification, L.textoLongo);
  checar("Quando verificar o resultado", plan.verificationDate, L.textoCurto);
  if (plan.indicator === "Sim") checar("Qual indicador", plan.indicatorDetail, L.textoCurto);
  return msgs;
}

/**
 * Plano de ação em branco (metodologia SMART) — usado tanto pelo modal de registro manual quanto
 * pela pré-criação automática a partir da última seção da Análise (ver localStore.ts). Centralizado
 * aqui pra não ter duas cópias do mesmo objeto de 25 campos podendo divergir com o tempo.
 */
export function createEmptyActionPlan(): ActionPlan {
  return {
    id: "",
    what: "",
    where: "",
    responsible: "",
    responsaveis: [],
    startDate: "",
    conclusionDate: "",
    resource: "Não",
    resourceItems: [],
    approval: "Não",
    approvalDetail: "",
    proof: "",
    expectedResult: "",
    verification: "",
    verificationDate: "",
    indicator: "Não",
    indicatorDetail: "",
    status: "Em andamento",
    realStartDate: "",
    realConclusionDate: "",
    completionDescription: "",
    observedResult: "",
    effectiveness: "",
    effectivenessReason: "",
    delayReason: "",
    newConclusionDate: "",
    cancellationReason: "",
    evidenceLocation: "",
    attachments: [],
    updatedAt: "",
  };
}

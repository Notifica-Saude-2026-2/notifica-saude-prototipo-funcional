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

export type ActionAttachment = { name: string; type: string; size: number };

/** Uma linha de "pedido + preço" do recurso necessário — mesmo formato genérico usado pelas
    tabelas repetíveis da Análise (ver TableField), pra reaproveitar aquele componente aqui. */
export type ResourceItem = Record<string, string>;

export type ActionPlan = {
  id: string;
  what: string;
  where: string;
  responsible: string;
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

export type StatusColorSet = { bg: string; text: string; bar: string };

export const STATUS_COLORS: Record<string, StatusColorSet> = {
  // Azul — notificação recém-registrada
  NOVA: { bg: "#dbeafe", text: "#1d4ed8", bar: "#2563eb" },
  // Âmbar — classificação definida, aguardando escolha de quem analisa
  CLASSIFICADA: { bg: "#fff8e1", text: "#c8850a", bar: "#f59e0b" },
  // Roxo — encaminhada ao setor responsável, aguardando análise
  ENCAMINHADA_SETOR: { bg: "#f3e5f5", text: "#6a1b9a", bar: "#6a1b9a" },
  // Índigo — formulário de análise sendo preenchido
  EM_ANALISE: { bg: "#e8eaf6", text: "#283593", bar: "#3949ab" },
  // Teal — análise concluída, aguardando plano de ação
  ANALISADA: { bg: "#e0f2f1", text: "#00695c", bar: "#00897b" },
  // Verde — plano(s) de ação em andamento
  EM_ACAO: { bg: "#e8f5e9", text: "#2e7d32", bar: "#43a047" },
  // Cinza — estado final, sem novas alterações permitidas
  ARQUIVADA: { bg: "#f5f5f5", text: "#616161", bar: "#9e9e9e" },
};

export const DEFAULT_STATUS_COLORS: StatusColorSet = {
  bg: "#f5f5f5",
  text: "#616161",
  bar: "#bdbdbd",
};

export function getStatusColors(statusRaw: string): StatusColorSet {
  return STATUS_COLORS[statusRaw] ?? DEFAULT_STATUS_COLORS;
}

export type GrauDanoColorSet = { bg: string; text: string };

export const GRAU_DANO_COLORS: Record<string, GrauDanoColorSet> = {
  LEVE: { bg: "#e0f2f1", text: "#00695c" },
  MODERADO: { bg: "#fff8e1", text: "#c8850a" },
  GRAVE: { bg: "#ffebee", text: "#c62828" },
  OBITO: { bg: "#212121", text: "#ffffff" },
  NEVER_EVENT: { bg: "#7f0000", text: "#ffffff" },
};

/** Mesmas cores acima, mas indexadas pelo texto já traduzido do grau do dano (ex.: "Leve") — usado
    onde só temos o label pronto (NotificacaoDetalheDTO.classificacao.grauDano), sem o código bruto
    (LEVE, MODERADO...) que indexa GRAU_DANO_COLORS. */
const GRAU_DANO_COLORS_BY_LABEL: Record<string, GrauDanoColorSet> = {
  Leve: GRAU_DANO_COLORS.LEVE,
  Moderado: GRAU_DANO_COLORS.MODERADO,
  Grave: GRAU_DANO_COLORS.GRAVE,
  Óbito: GRAU_DANO_COLORS.OBITO,
  "Never Event": GRAU_DANO_COLORS.NEVER_EVENT,
};

export function getGrauDanoColorByLabel(label: string | null | undefined): GrauDanoColorSet | null {
  if (!label) return null;
  return GRAU_DANO_COLORS_BY_LABEL[label] ?? null;
}

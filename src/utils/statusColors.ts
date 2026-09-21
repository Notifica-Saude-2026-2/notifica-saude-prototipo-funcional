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
  // Verde forte — incidente concluído (todas as ações finalizadas)
  CONCLUIDA: { bg: "#dcfce7", text: "#15803d", bar: "#16a34a" },
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

// --------------------------------------------------------------------------
// Prazo da análise (cartão de listagem) — só faz sentido enquanto a análise
// ainda não foi concluída (classificado, encaminhado ou em análise).
// --------------------------------------------------------------------------

export type PrazoInfo = { label: string; bg: string; text: string };

const PRAZO_PENDENTE_STATUSES = new Set(["CLASSIFICADA", "ENCAMINHADA_SETOR", "EM_ANALISE"]);

export function getPrazoInfo(
  dataValidadeIso: string | null | undefined,
  statusRaw: string,
): PrazoInfo | null {
  if (!dataValidadeIso || !PRAZO_PENDENTE_STATUSES.has(statusRaw)) return null;

  const validade = new Date(dataValidadeIso).getTime();
  if (Number.isNaN(validade)) return null;

  const diffDias = Math.ceil((validade - Date.now()) / 86_400_000);

  if (diffDias < 0) {
    const dias = Math.abs(diffDias);
    return {
      label: `Vencido há ${dias} dia${dias === 1 ? "" : "s"}`,
      bg: "#fee4e2",
      text: "#b42318",
    };
  }
  if (diffDias === 0) {
    return { label: "Vence hoje", bg: "#fff2cc", text: "#946200" };
  }
  if (diffDias <= 3) {
    return {
      label: `Vence em ${diffDias} dia${diffDias === 1 ? "" : "s"}`,
      bg: "#fff2cc",
      text: "#946200",
    };
  }
  return {
    label: `Até ${new Date(dataValidadeIso).toLocaleDateString("pt-BR")}`,
    bg: "#e8f5e9",
    text: "#2e7d32",
  };
}

export type StatusColorSet = { bg: string; text: string; bar: string };

export const STATUS_COLORS: Record<string, StatusColorSet> = {
  // Azul — notificação recém-registrada
  NOVA:              { bg: "#dbeafe", text: "#1d4ed8", bar: "#2563eb" },
  // Âmbar — classificação definida, aguardando análise
  CLASSIFICADA:      { bg: "#fff8e1", text: "#c8850a", bar: "#f59e0b" },
  // Teal — em processo de análise
  ANALISADA:         { bg: "#e0f2f1", text: "#00695c", bar: "#00897b" },
  // Roxo — encaminhada ao setor responsável
  ENCAMINHADA_SETOR: { bg: "#f3e5f5", text: "#6a1b9a", bar: "#6a1b9a" },
  // Cinza — estado final, sem novas alterações permitidas
  ARQUIVADA:         { bg: "#f5f5f5", text: "#616161", bar: "#9e9e9e" },
};

export const DEFAULT_STATUS_COLORS: StatusColorSet = {
  bg: "#f5f5f5", text: "#616161", bar: "#bdbdbd",
};

export function getStatusColors(statusRaw: string): StatusColorSet {
  return STATUS_COLORS[statusRaw] ?? DEFAULT_STATUS_COLORS;
}

export type GrauDanoColorSet = { bg: string; text: string };

export const GRAU_DANO_COLORS: Record<string, GrauDanoColorSet> = {
  LEVE:     { bg: "#e0f2f1", text: "#00695c" },
  MODERADO: { bg: "#fff8e1", text: "#c8850a" },
  GRAVE:    { bg: "#ffebee", text: "#c62828" },
  OBITO:    { bg: "#212121", text: "#ffffff" },
};

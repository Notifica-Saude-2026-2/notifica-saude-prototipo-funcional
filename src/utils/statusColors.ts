export type StatusColorSet = { bg: string; text: string; bar: string };

export const STATUS_COLORS: Record<string, StatusColorSet> = {
  NOVA:              { bg: "#e3f2fd", text: "#1565c0", bar: "#1565c0" },
  CLASSIFICADA:      { bg: "#e8eaf6", text: "#283593", bar: "#3949ab" },
  ANALISADA:         { bg: "#fff8e1", text: "#e65100", bar: "#f58220" },
  ENCAMINHADA_SETOR: { bg: "#f3e5f5", text: "#6a1b9a", bar: "#6a1b9a" },
  ARQUIVADA:         { bg: "#e8f5e9", text: "#2e7d32", bar: "#3FA35C" },
};

export const DEFAULT_STATUS_COLORS: StatusColorSet = {
  bg: "#f5f5f5", text: "#616161", bar: "#bdbdbd",
};

export function getStatusColors(statusRaw: string): StatusColorSet {
  return STATUS_COLORS[statusRaw] ?? DEFAULT_STATUS_COLORS;
}

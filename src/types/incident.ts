export type DamageLevel =
  | "SEM_CLASSIFICACAO"
  | "LEVE"
  | "MODERADO"
  | "GRAVE"
  | "OBITO"
  | "NEVER_EVENT";

export type IncidentStatus = "Novo" | "Classificado" | "Em análise" | "Encaminhado" | "Resolvido";

export type Incident = {
  id: string;
  date: string;
  status: IncidentStatus;
  description: string;
  sector: string;
  damageLevel: DamageLevel;
  responsavel?: string | null;
};

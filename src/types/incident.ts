export type IncidentStatus = "Novo" | "Classificado" | "Em análise" | "Encaminhado" | "Arquivado";

export type Incident = {
  id: string;
  codigo: string;
  statusRaw: string;
  date: string;
  status: IncidentStatus;
  description: string;
  sector: string;
  responsavel?: string | null;
  grauDano?: string | null;
};

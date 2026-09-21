export type IncidentStatus =
  | "Novo"
  | "Classificado"
  | "Encaminhado"
  | "Em análise"
  | "Analisado"
  | "Em ação"
  | "Concluído"
  | "Arquivado";

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
  /** Tipo(s) de incidente (ex.: "Queda", "Erro de medicação") — já rotulado(s) e unido(s) por ", ",
      pronto pra exibir. Vem de classificacao.tipos_incidentes. */
  tipoIncidente?: string | null;
  /** Prazo para conclusão da análise (ISO 8601), quando a classificação já define um — usado para
      montar o aviso de urgência no cartão da listagem (ver utils/statusColors.ts#getPrazoInfo). */
  dataValidade?: string | null;
};

// --------------------------------------------------------------------------
// Tipos que espelham a resposta do GET /api/notificacoes (payload bruto)
// --------------------------------------------------------------------------

export type OpcaoSelecionadaRaw = {
  id: string;
  valor: string;
};

export type RespostaItemRaw = {
  id: string;
  campo_id: string;
  label_original: string;
  valor_texto: string | null;
  valor_opcao_id: string | null;
  valor_entidade_id: string | null;
  valor_entidade_label: string | null;
  opcao_selecionada: OpcaoSelecionadaRaw | null;
};

export type ClassificacaoRaw = {
  id: string;
  notificacao_id: string;
  profissional_nsp_id: string;
  profissional_nsp_nome?: string | null;
  tipo_incidente: string | null;
  tipo_especifico: string | null;
  envolvidos: string[];
  grau_dano: string | null;
  observacoes: string | null;
  rascunho: boolean;
  data_classificacao: string;
  data_validade: string | null;
  outro_envolvido: string | null;
};

export type NotificacaoRaw = {
  id: string;
  status: string;
  data_incidente: string;
  data_registro: string;
  updated_at: string;
  descricao: string | null;
  anonima: boolean;
  tenant_id: string;
  unidade_id: string;
  setor_id: string;
  notificante_id: string | null;
  unidade: { nome: string } | null;
  setor: { nome: string } | null;
  classificacao: ClassificacaoRaw | null;
  respostas: RespostaItemRaw[];
};

// --------------------------------------------------------------------------
// DTO mapeado para o consumo da UI
// --------------------------------------------------------------------------

export type PacienteDTO = {
  envolvido: boolean;
  idade: string | null;
  sexo: string | null;
};

export type ClassificacaoDTO = {
  tipoIncidente: string | null;
  tipoEspecifico: string | null;
  envolvidos: string[];
  grauDano: string | null;
  observacoes: string | null;
  rascunho: boolean;
  dataClassificacao: string;
  dataValidade: string | null;
  outroEnvolvido: string | null;
};

export type NotificacaoDetalheDTO = {
  id: string;
  statusRaw: string;
  statusLabel: string;
  dataIncidente: string;
  dataCadastro: string;
  dataAtualizacao: string; // Nova propriedade para incluir hora
  descricao: string | null;
  anonima: boolean;
  unidade: string;
  setor: string;
  turno: string | null;
  papel: string | null;
  paciente: PacienteDTO;
  classificacao: ClassificacaoDTO | null;
};

// IDs fixos dos campos do formulário (conforme seed.ts do backend)
export const CAMPO_IDS = {
  INSTITUICAO: "55555555-5555-4555-b555-000000000010",
  ENV_PACIENTE: "55555555-5555-4555-b555-000000000000",
  IDADE: "55555555-5555-4555-b555-000000000001",
  SEXO: "55555555-5555-4555-b555-000000000002",
  DATA_INC: "55555555-5555-4555-b555-000000000008",
  TURNO: "55555555-5555-4555-b555-000000000009",
  SETOR: "55555555-5555-4555-b555-000000000003",
  DESCRICAO: "55555555-5555-4555-b555-000000000004",
  PAPEL: "55555555-5555-4555-b555-000000000005",
  NOME_OPC: "55555555-5555-4555-b555-000000000006",
  CONTATO_OPC: "55555555-5555-4555-b555-000000000007",
} as const;

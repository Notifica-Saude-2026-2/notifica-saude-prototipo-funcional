import type { AnaliseRaw, MetodologiaAbordagem } from "./analise";
import type { ActionPlan } from "./actionPlan";

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
  tipos_incidentes: string[];
  envolvidos: string[];
  grau_dano: string | null;
  observacoes: string | null;
  rascunho: boolean;
  data_classificacao: string;
  data_validade: string | null;
  outro_envolvido: string | null;
  outro_tipo_incidente: string | null;
};

export type NotificacaoRaw = {
  id: string;
  codigo: number;
  codigo_formatado?: string;
  status: string;
  data_incidente: string;
  data_registro: string;
  updated_at: string;
  descricao: string | null;
  /** Promovido a coluna própria na criação, igual a `descricao` — ver CAMPO_IDS.CONDUTA_IMEDIATA. */
  condutaImediata?: string | null;
  anonima: boolean;
  tenant_id: string;
  unidade_id: string;
  setor_id: string;
  notificante_id: string | null;
  unidade: { nome: string } | null;
  setor: { nome: string } | null;
  classificacao: ClassificacaoRaw | null;
  respostas: RespostaItemRaw[];
  metodologia_analise?: MetodologiaAbordagem | null;
  analise?: AnaliseRaw | null;
  /** true = análise feita direto pelo núcleo (sem encaminhamento prévio); false = veio de um encaminhamento. */
  analise_via_encaminhamento?: boolean | null;
  planos_acao?: ActionPlan[];
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
  tiposIncidentes: string[];
  envolvidos: string[];
  grauDano: string | null;
  observacoes: string | null;
  rascunho: boolean;
  dataClassificacao: string;
  dataValidade: string | null;
  diasValidade: number | null;
  outroEnvolvido: string | null;
  outroTipoIncidente: string | null;
  /** Responsável pelo incidente — regra de negócio: é sempre quem registrou a classificação
      (profissional do NSP). Não há atribuição manual de responsável em nenhum outro momento. */
  responsavelNome: string | null;
};

export type NotificacaoDetalheDTO = {
  id: string;
  codigo: string;
  statusRaw: string;
  statusLabel: string;
  dataIncidente: string;
  dataCadastro: string;
  dataCadastroCompleto: string;
  dataAtualizacao: string; // Nova propriedade para incluir hora
  descricao: string | null;
  condutaImediata: string | null;
  anonima: boolean;
  unidade: string;
  setor: string;
  turno: string | null;
  horario: string | null;
  papel: string | null;
  paciente: PacienteDTO;
  notificante: {
    nome: string | null;
    contato: string | null;
  };
  classificacao: ClassificacaoDTO | null;
  metodologiaAnalise: MetodologiaAbordagem | null;
  analise: AnaliseRaw | null;
  /** true quando o núcleo concluiu a análise sozinho e ainda precisa decidir se encaminha ou justifica. */
  aguardandoDecisaoEncaminhamento: boolean;
  planosAcao: ActionPlan[];
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
  // ⚠️ PROVISÓRIOS — não existem no seed.ts do backend ainda. Campos novos pedidos pela proponente
  // (fluxo de Investigação ajustado). Confirmar com o backend os IDs definitivos antes de integrar
  // de verdade; por ora servem só para o protótipo front-end funcionar de ponta a ponta.
  CONDUTA_IMEDIATA: "55555555-5555-4555-b555-000000000011",
  HORARIO: "55555555-5555-4555-b555-000000000012",
} as const;

export type TipoCampo =
  | "TEXTO"
  | "NUMERO"
  | "DATA"
  | "AREA"
  | "EMAIL"
  | "TELEFONE"
  | "ARQUIVO"
  | "BOOLEAN"
  | "SELECT"
  | "MULTISELECT"
  | "RADIO"
  | "CHECKBOX";

export type OpcaoCampo = {
  id: string;
  valor: string;
};

export type CampoDinamico = {
  id: string;
  label: string;
  tipo: TipoCampo;
  obrigatorio: boolean;
  placeholder?: string;
  opcoes?: OpcaoCampo[];
  ordem?: number;
  secao?: string;
  /** Número da etapa — derivado de secao no frontend se não fornecido diretamente */
  etapa?: number;
  entidade_relacional?: string;
};

export type RespostaCampo = {
  campo_id: string;
  valor?: string;
  valor_opcao_id?: string;
  valores_opcoes_ids?: string[];
  /** Campos relacionais (C_INSTITUICAO, C_SETOR): UUID da entidade selecionada */
  valor_entidade_id?: string;
  valor_entidade_label?: string;
};

export type NotificacaoPayload = {
  anonima: boolean;
  unidade_id: string;
  setor_id: string;
  data_incidente: string;
  respostas: RespostaCampo[];
};

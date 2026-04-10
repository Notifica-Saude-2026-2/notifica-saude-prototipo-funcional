export type TipoCampo =
  | 'TEXTO'
  | 'NUMERO'
  | 'DATA'
  | 'AREA'
  | 'EMAIL'
  | 'TELEFONE'
  | 'ARQUIVO'
  | 'BOOLEAN'
  | 'SELECT'
  | 'MULTISELECT'
  | 'RADIO'
  | 'CHECKBOX';

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
  /** Agrupamento por tela vindo do backend (ex: "Tela 1 - Abertura") */
  secao?: string;
  /** Número da etapa — derivado de secao no frontend se não fornecido diretamente */
  etapa?: number;
};

export type RespostaCampo = {
  campo_id: string;
  valor?: string;
  valor_opcao_id?: string;
};

export type NotificacaoPayload = {
  unidade_id: string;
  setor_id: string;
  data_incidente: string;
  descricao: string;
  anonima: boolean;
  respostas: RespostaCampo[];
};

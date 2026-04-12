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
  /** Usado para TEXTO, AREA, DATA, NUMERO, BOOLEAN ou especificações de "Outro" */
  valor?: string;
  /** Usado para RADIO e SELECT */
  valor_opcao_id?: string;
  /** NOVO: Necessário para MULTISELECT e CHECKBOX conforme o Zod do backend */
  valores_opcoes_ids?: string[];
};

/**
 * REFATORADO: A estrutura agora é focada no anonimato e nas respostas dinâmicas.
 * As propriedades unidade_id, setor_id, etc., foram removidas pois o backend
 * as extrai automaticamente do array 'respostas'.
 */
export type NotificacaoPayload = {
  anonima: boolean;
  respostas: RespostaCampo[];
};
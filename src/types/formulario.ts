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
  /**
   * Número da etapa do StepForm onde este campo deve aparecer.
   * Se não fornecido pelo backend, todos os campos são exibidos na etapa 1.
   */
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

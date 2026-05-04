export type DamageLevel =
  | 'SEM_CLASSIFICACAO'
  | 'SEM_DANO'
  | 'MODERADO'
  | 'GRAVE'
  | 'CATASTROFICO';

export type Incident = {
  id: string;
  date: string;
  status: 'Novo' | 'Em análise' | 'Encaminhado' | 'Resolvido';
  description: string;
  sector: string;
  damageLevel: DamageLevel;
};

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: '#22030',
    date: '20/03/2026',
    status: 'Em análise',
    description:
      'Atrasos recorrentes na triagem de pacientes durante períodos de alta demanda, gerando filas e insatisfação geral no atendimento.',
    sector: 'Pronto-socorro',
    damageLevel: 'SEM_CLASSIFICACAO',
  },
  {
    id: '#22031',
    date: '22/03/2026',
    status: 'Novo',
    description:
      'Falhas intermitentes no sistema de registro eletrônico impedindo a atualização correta dos dados dos pacientes em atendimento.',
    sector: 'TI Hospitalar',
    damageLevel: 'MODERADO',
  },
  {
    id: '#22032',
    date: '24/03/2026',
    status: 'Resolvido',
    description:
      'Problema de sincronização entre módulos do sistema que ocasionava duplicidade de registros em agendamentos de consultas.',
    sector: 'Agendamento',
    damageLevel: 'SEM_DANO',
  },
  {
    id: '#22033',
    date: '25/03/2026',
    status: 'Novo',
    description:
      'Equipamento médico apresentando falhas de calibração durante procedimentos, impactando a confiabilidade dos resultados obtidos.',
    sector: 'Diagnóstico por Imagem',
    damageLevel: 'GRAVE',
  },
  {
    id: '#22034',
    date: '27/03/2026',
    status: 'Em análise',
    description:
      'Tentativas de acesso não autorizado a informações sensíveis de pacientes, indicando possível falha nos controles de segurança do sistema.',
    sector: 'Segurança da Informação',
    damageLevel: 'CATASTROFICO',
  },
  {
    id: '#22035',
    date: '28/03/2026',
    status: 'Encaminhado',
    description:
      'Medicamento dispensado com dosagem incorreta para paciente, identificado antes da administração pelo enfermeiro responsável.',
    sector: 'Farmácia',
    damageLevel: 'GRAVE',
  },
  {
    id: '#22036',
    date: '29/03/2026',
    status: 'Novo',
    description:
      'Queda de paciente idoso durante transferência entre leitos devido à falta de procedimento padronizado de movimentação.',
    sector: 'Enfermaria',
    damageLevel: 'MODERADO',
  },
  {
    id: '#22037',
    date: '01/04/2026',
    status: 'Em análise',
    description:
      'Resultado de exame laboratorial entregue ao paciente errado, gerando confusão e necessidade de recoleta urgente.',
    sector: 'Laboratório',
    damageLevel: 'GRAVE',
  },
  {
    id: '#22038',
    date: '02/04/2026',
    status: 'Resolvido',
    description:
      'Falha no sistema de ar-condicionado da UTI resultou em temperatura acima do limite recomendado por aproximadamente 2 horas.',
    sector: 'Infraestrutura',
    damageLevel: 'MODERADO',
  },
  {
    id: '#22039',
    date: '03/04/2026',
    status: 'Novo',
    description:
      'Alergia a contraste iodado não registrada no prontuário eletrônico, paciente recebeu contraste antes de verificação manual.',
    sector: 'Radiologia',
    damageLevel: 'CATASTROFICO',
  },
  {
    id: '#22040',
    date: '04/04/2026',
    status: 'Encaminhado',
    description:
      'Descarte inadequado de resíduo infectante em coletora comum, identificado pela equipe de higienização durante ronda.',
    sector: 'Limpeza e Higienização',
    damageLevel: 'SEM_DANO',
  },
];

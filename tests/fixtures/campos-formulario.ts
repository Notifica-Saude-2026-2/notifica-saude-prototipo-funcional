import type { CampoDinamico } from '../../src/types/formulario';

export const camposFormularioMock: CampoDinamico[] = [
  // ── Tela 1 ────────────────────────────────────────────────────────────────
  {
    id: 'campo-instituicao',
    label: 'Instituição',
    tipo: 'SELECT',
    secao: 'Tela 1 - Abertura',
    obrigatorio: true,
    opcoes: [
      { id: 'inst-humap', valor: 'Hospital Universitário Maria Aparecida Pedrossian – HUMAP' },
      { id: 'inst-santa-casa', valor: 'Hospital Santa Casa de Campo Grande de Mato Grosso do Sul' },
      { id: 'inst-regional', valor: 'Hospital Regional de Mato Grosso do Sul' },
    ],
  },
  {
    id: 'campo-paciente',
    label: 'Envolve paciente?',
    tipo: 'RADIO',
    secao: 'Tela 1 - Abertura',
    obrigatorio: true,
    opcoes: [
      { id: 'paciente-sim', valor: 'Sim' },
      { id: 'paciente-nao', valor: 'Não' },
    ],
  },

  // ── Tela 2 (só exibida se Sim) ────────────────────────────────────────────
  {
    id: 'campo-faixa-etaria',
    label: 'Faixa etária',
    tipo: 'RADIO',
    secao: 'Tela 2 - Informações sobre o Paciente',
    obrigatorio: true,
    opcoes: [
      { id: 'idade-menor-18', valor: 'Menos de 18 anos' },
      { id: 'idade-18-59', valor: '18–59 anos' },
      { id: 'idade-60-mais', valor: '60 anos ou mais' },
    ],
  },
  {
    id: 'campo-sexo',
    label: 'Sexo',
    tipo: 'RADIO',
    secao: 'Tela 2 - Informações sobre o Paciente',
    obrigatorio: true,
    opcoes: [
      { id: 'sexo-feminino', valor: 'Feminino' },
      { id: 'sexo-masculino', valor: 'Masculino' },
      { id: 'sexo-outro', valor: 'Outro' },
    ],
  },

  // ── Tela 3 ────────────────────────────────────────────────────────────────
  {
    id: 'campo-data',
    label: 'Data do incidente',
    tipo: 'DATA',
    secao: 'Tela 3 - Momento e Local do Incidente',
    obrigatorio: true,
  },
  {
    id: 'campo-turno',
    label: 'Turno',
    tipo: 'RADIO',
    secao: 'Tela 3 - Momento e Local do Incidente',
    obrigatorio: true,
    opcoes: [
      { id: 'turno-manha', valor: 'Manhã' },
      { id: 'turno-tarde', valor: 'Tarde' },
      { id: 'turno-noite', valor: 'Noite' },
    ],
  },
  {
    id: 'campo-setor',
    label: 'Setor',
    tipo: 'RADIO',
    secao: 'Tela 3 - Momento e Local do Incidente',
    obrigatorio: true,
    opcoes: [
      { id: 'setor-uti', valor: 'UTI' },
      { id: 'setor-pronto', valor: 'Pronto atendimento / emergência' },
      { id: 'setor-imagem', valor: 'Diagnóstico por imagem' },
      { id: 'setor-outro', valor: 'Outro' },
    ],
  },

  // ── Tela 4 ────────────────────────────────────────────────────────────────
  {
    id: 'campo-descricao',
    label: 'Descrição do incidente',
    tipo: 'AREA',
    secao: 'Tela 4 - Descrição do Incidente e Papel do Notificador',
    obrigatorio: true,
    placeholder: 'Descreva o incidente...',
  },
  {
    id: 'campo-papel',
    label: 'Papel do notificador',
    tipo: 'RADIO',
    secao: 'Tela 4 - Descrição do Incidente e Papel do Notificador',
    obrigatorio: true,
    opcoes: [
      { id: 'papel-enfermeiro', valor: 'Enfermeiro' },
      { id: 'papel-medico', valor: 'Médico' },
      { id: 'papel-familiar', valor: 'Familiar / acompanhante' },
      { id: 'papel-residente', valor: 'Residente' },
    ],
  },

  // ── Tela 5 (opcional) ─────────────────────────────────────────────────────
  {
    id: 'campo-nome',
    label: 'Nome',
    tipo: 'TEXTO',
    secao: 'Identificação opcional do notificador',
    obrigatorio: false,
    placeholder: 'Seu nome',
  },
  {
    id: 'campo-contato',
    label: 'Contato',
    tipo: 'TELEFONE',
    secao: 'Identificação opcional do notificador',
    obrigatorio: false,
    placeholder: '(00) 00000-0000',
  },
];

export function todayISO(): string {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

export function futureDateISO(daysAhead = 1): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

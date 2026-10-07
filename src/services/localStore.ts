import type { CampoDinamico, NotificacaoPayload, RespostaCampo } from "../types/formulario";
import type {
  ClassificacaoRaw,
  NotificacaoRaw,
  RespostaItemRaw,
} from "../types/notificacaoDetalhe";
import type { ClassificarPayload, UpdateNotificacaoPayload } from "./notificacaoDetalheService";
import type { ActionPlan } from "../types/actionPlan";
import { camposPendentesPlano, createEmptyActionPlan } from "../types/actionPlan";
import type { AnaliseRaw, AnaliseValues, RecomendacaoExtraida } from "../types/analise";

const NOTIFICACOES_KEY = "notifica_saude_prototipo_notificacoes";
const HISTORICO_KEY = "notifica_saude_prototipo_historico";
const SEED_VERSION_KEY = "notifica_saude_prototipo_seed_versao";

// "4": removida a noção de metodologia da análise (campos metodologia_analise / metodologia /
// flowAtivo) — o seed é recriado para não sobrar dado antigo com esses campos.
// "5": análises do seed preenchidas (#1004 e #1005), novos registros concluído (#1003) e
// arquivado (#1006) e histórico inicial.
const SEED_VERSION = "5";

export const unidades = [
  { id: "unidade-hospital-regional", nome: "Hospital Regional de Mato Grosso do Sul" },
  { id: "unidade-hospital-universitario", nome: "Hospital Universitário" },
];

export const setores = [
  { id: "setor-emergencia", nome: "Emergência" },
  { id: "setor-enfermaria", nome: "Enfermaria" },
  { id: "setor-uti", nome: "UTI" },
  { id: "setor-centro-cirurgico", nome: "Centro cirúrgico" },
];

const option = (id: string, valor: string) => ({ id, valor });
export const camposFormulario: CampoDinamico[] = [
  {
    id: "55555555-5555-4555-b555-000000000000",
    label: "O incidente envolve paciente?",
    tipo: "RADIO",
    obrigatorio: true,
    secao: "Tela 1 - Abertura",
    opcoes: [option("paciente-sim", "Sim"), option("paciente-nao", "Não")],
  },
  {
    id: "55555555-5555-4555-b555-000000000001",
    label: "Faixa etária do paciente",
    tipo: "SELECT",
    obrigatorio: true,
    secao: "Tela 2 - Informações sobre o Paciente",
    opcoes: [
      option("idade-0-17", "0 a 17 anos"),
      option("idade-18-59", "18 a 59 anos"),
      option("idade-60", "60 anos ou mais"),
    ],
  },
  {
    id: "55555555-5555-4555-b555-000000000002",
    label: "Sexo do paciente",
    tipo: "RADIO",
    obrigatorio: true,
    secao: "Tela 2 - Informações sobre o Paciente",
    opcoes: [
      option("sexo-f", "Feminino"),
      option("sexo-m", "Masculino"),
      option("sexo-o", "Outro"),
    ],
  },
  {
    id: "55555555-5555-4555-b555-000000000008",
    label: "Data do incidente",
    tipo: "DATA",
    obrigatorio: true,
    secao: "Tela 3 - Momento e Local do Incidente",
  },
  {
    id: "55555555-5555-4555-b555-000000000009",
    label: "Turno",
    tipo: "SELECT",
    obrigatorio: true,
    secao: "Tela 3 - Momento e Local do Incidente",
    opcoes: [
      option("turno-manha", "Manhã"),
      option("turno-tarde", "Tarde"),
      option("turno-noite", "Noite"),
    ],
  },
  // ⚠️ PROVISÓRIO — ver CAMPO_IDS.HORARIO em types/notificacaoDetalhe.ts.
  {
    id: "55555555-5555-4555-b555-000000000012",
    label: "Horário do incidente",
    tipo: "HORA",
    obrigatorio: true,
    secao: "Tela 3 - Momento e Local do Incidente",
  },
  {
    id: "55555555-5555-4555-b555-000000000010",
    label: "Instituição",
    tipo: "SELECT",
    obrigatorio: true,
    secao: "Tela 3 - Momento e Local do Incidente",
    entidade_relacional: "UnidadeSaude",
    opcoes: unidades.map((u) => option(u.id, u.nome)),
  },
  {
    id: "55555555-5555-4555-b555-000000000003",
    label: "Setor",
    tipo: "SELECT",
    obrigatorio: true,
    secao: "Tela 3 - Momento e Local do Incidente",
    entidade_relacional: "SETOR",
    opcoes: setores.map((s) => option(s.id, s.nome)),
  },
  {
    id: "55555555-5555-4555-b555-000000000004",
    label: "Descreva o incidente",
    tipo: "AREA",
    obrigatorio: true,
    secao: "Tela 4 - Descrição do Incidente e Papel do Notificador",
    placeholder: "Descreva o que aconteceu",
  },
  {
    id: "55555555-5555-4555-b555-000000000005",
    label: "Papel do notificante",
    tipo: "SELECT",
    obrigatorio: true,
    secao: "Tela 4 - Descrição do Incidente e Papel do Notificador",
    opcoes: [
      option("papel-profissional", "Profissional de saúde"),
      option("papel-acompanhante", "Familiar/acompanhante"),
      option("papel-outro", "Outro"),
    ],
  },
  {
    id: "55555555-5555-4555-b555-000000000006",
    label: "Nome",
    tipo: "TEXTO",
    obrigatorio: false,
    secao: "Identificação opcional do notificador",
  },
  {
    id: "55555555-5555-4555-b555-000000000007",
    label: "Celular/E-mail",
    tipo: "TEXTO",
    obrigatorio: false,
    secao: "Identificação opcional do notificador",
  },
];

type Historico = {
  id: string;
  campo_alterado: string;
  valor_anterior: string | null;
  valor_novo: string | null;
  data_alteracao: string;
  usuario: { nome: string } | null;
};
const now = () => new Date().toISOString();

/** RN-14 — dias para análise por grau do dano; sem dano (grau vazio) segue o prazo do dano leve. */
const PRAZO_ANALISE_DIAS: Record<string, number> = {
  LEVE: 10,
  MODERADO: 7,
  GRAVE: 4,
  OBITO: 2,
  NEVER_EVENT: 2,
};
const PRAZO_ANALISE_PADRAO_DIAS = 10;

/** Data-limite para análise: data de registro da notificação + dias conforme o grau do dano. */
export function calcularPrazoAnalise(
  dataRegistroIso: string | null | undefined,
  grauDano: string | null | undefined,
): string {
  const base = dataRegistroIso ? new Date(dataRegistroIso) : new Date();
  const inicio = Number.isNaN(base.getTime()) ? new Date() : base;
  const dias = PRAZO_ANALISE_DIAS[grauDano ?? ""] ?? PRAZO_ANALISE_PADRAO_DIAS;
  inicio.setDate(inicio.getDate() + dias);
  return inicio.toISOString();
}
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/** Funciona também em ambientes HTTP/IP, onde crypto.randomUUID pode não existir. */
export function newLocalId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

function resposta(campo_id: string, valor_texto: string | null, valor?: string): RespostaItemRaw {
  return {
    id: newLocalId(),
    campo_id,
    label_original: "",
    valor_texto,
    valor_opcao_id: valor ? newLocalId() : null,
    valor_entidade_id: null,
    valor_entidade_label: null,
    opcao_selecionada: valor ? { id: newLocalId(), valor } : null,
  };
}

/** Linha do histórico já pronta para o seed (ver seedHistorico). */
const evento = (campo_alterado: string, data_alteracao: string): Historico => ({
  id: newLocalId(),
  campo_alterado,
  valor_anterior: null,
  valor_novo: null,
  data_alteracao,
  usuario: { nome: "Administrador" },
});

/** Histórico inicial das notificações do seed que já passaram por alguma etapa (mais recente
    primeiro, como o addHistorico grava). */
function seedHistorico(): Record<string, Historico[]> {
  return {
    "notificacao-2": [evento("classificação registrada", "2026-08-22T14:30:00.000Z")],
    "notificacao-3": [
      evento("concluiu o incidente", "2026-09-10T15:00:00.000Z"),
      evento(
        "plano de ação atualizado: Realizar mudança de decúbito a cada 2 horas, com registro em impresso próprio à beira do leito. (Concluído)",
        "2026-09-08T11:00:00.000Z",
      ),
      evento(
        "plano de ação atualizado: Adquirir colchões pneumáticos para os leitos de pacientes com alto risco de lesão por pressão. (Concluído)",
        "2026-09-05T16:20:00.000Z",
      ),
      evento(
        "plano de ação completado: Adquirir colchões pneumáticos para os leitos de pacientes com alto risco de lesão por pressão.",
        "2026-08-11T10:10:00.000Z",
      ),
      evento(
        "plano de ação completado: Realizar mudança de decúbito a cada 2 horas, com registro em impresso próprio à beira do leito.",
        "2026-08-11T09:40:00.000Z",
      ),
      evento(
        "2 ações criadas no plano de ação a partir das recomendações da análise",
        "2026-08-08T17:00:00.000Z",
      ),
      evento("análise concluída", "2026-08-08T17:00:00.000Z"),
      evento("notificação encaminhada para UTI analisar", "2026-08-05T10:00:00.000Z"),
      evento("classificação registrada", "2026-08-05T09:30:00.000Z"),
    ],
    "notificacao-4": [
      evento(
        "plano de ação completado: Implementar dupla checagem de identificação do paciente antes de procedimentos.",
        "2026-08-24T16:30:00.000Z",
      ),
      evento(
        "1 ação criada no plano de ação a partir das recomendações da análise",
        "2026-08-24T16:00:00.000Z",
      ),
      evento("análise concluída", "2026-08-24T16:00:00.000Z"),
      evento("notificação encaminhada para Centro cirúrgico analisar", "2026-08-22T15:00:00.000Z"),
      evento("classificação registrada", "2026-08-22T14:30:00.000Z"),
    ],
    "notificacao-5": [
      evento(
        "1 ação criada no plano de ação a partir das recomendações da análise",
        "2026-08-27T15:00:00.000Z",
      ),
      evento("análise concluída", "2026-08-27T15:00:00.000Z"),
      evento("classificação registrada", "2026-08-22T14:30:00.000Z"),
    ],
    "notificacao-6": [evento("notificação arquivada", "2026-08-29T09:15:00.000Z")],
  };
}

function seed(): NotificacaoRaw[] {
  const respostasDe = (
    faixaEtaria: string,
    sexo: string,
    turno: string,
    horario: string,
    papel: string,
    nome?: string,
    contato?: string,
  ): RespostaItemRaw[] => [
    resposta("55555555-5555-4555-b555-000000000000", null, "Sim"),
    resposta("55555555-5555-4555-b555-000000000001", null, faixaEtaria),
    resposta("55555555-5555-4555-b555-000000000002", null, sexo),
    resposta("55555555-5555-4555-b555-000000000009", null, turno),
    resposta("55555555-5555-4555-b555-000000000012", horario),
    resposta("55555555-5555-4555-b555-000000000005", null, papel),
    ...(nome ? [resposta("55555555-5555-4555-b555-000000000006", nome)] : []),
    ...(contato ? [resposta("55555555-5555-4555-b555-000000000007", contato)] : []),
  ];
  const base = (
    id: string,
    codigo: number,
    status: string,
    descricao: string,
    setor: (typeof setores)[number],
    classificacao: ClassificacaoRaw | null,
    extras: Partial<NotificacaoRaw> = {},
  ): NotificacaoRaw => ({
    id,
    codigo,
    codigo_formatado: String(codigo).padStart(4, "0"),
    status,
    data_incidente: "2026-08-20T00:00:00.000Z",
    data_registro: "2026-08-21T12:00:00.000Z",
    updated_at: "2026-08-22T14:30:00.000Z",
    descricao,
    anonima: false,
    tenant_id: "prototipo",
    unidade_id: unidades[0].id,
    setor_id: setor.id,
    notificante_id: null,
    unidade: { nome: unidades[0].nome },
    setor: { nome: setor.nome },
    classificacao,
    respostas: respostasDe(
      "60 anos ou mais",
      "Feminino",
      "Manhã",
      "22:25",
      "Profissional de saúde",
      "Maria da Silva",
      "maria@exemplo.com",
    ),
    ...extras,
  });
  const classificada: ClassificacaoRaw = {
    id: "classificacao-2",
    notificacao_id: "notificacao-2",
    profissional_nsp_id: "usuario-demo",
    profissional_nsp_nome: "Administrador",
    tipo_incidente: "EVENTO_ADVERSO",
    tipo_especifico: null,
    tipos_incidentes: ["QUEDA"],
    envolvidos: ["PACIENTE"],
    grau_dano: "LEVE",
    observacoes: "Paciente avaliado pela equipe.",
    rascunho: false,
    data_classificacao: "2026-08-22T14:30:00.000Z",
    // RN-14: data de registro (21/08) + 10 dias do dano leve.
    data_validade: calcularPrazoAnalise("2026-08-21T12:00:00.000Z", "LEVE"),
    outro_envolvido: null,
    outro_tipo_incidente: null,
  };
  const porques = (pares: [string, string][]) =>
    pares.map(([pergunta, resposta]) => ({ pergunta, resposta }));
  const plano = (id: string, dados: Partial<ActionPlan>): ActionPlan => ({
    ...createEmptyActionPlan(),
    id,
    origemRecomendacao: dados.what,
    ...dados,
  });

  // ---------------------------------------------------------------- #1003 — Concluído
  const REC_3_A =
    "Realizar mudança de decúbito a cada 2 horas, com registro em impresso próprio à beira do leito.";
  const REC_3_B =
    "Adquirir colchões pneumáticos para os leitos de pacientes com alto risco de lesão por pressão.";
  const analise3: AnaliseValues = {
    incidente_investigado: "Lesão por pressão em região sacral durante internação na UTI",
    condutor_analise: [
      {
        nome: "Paulo Azevedo",
        formacao: "Enfermagem",
        funcao: "Coordenador(a)",
        setor: "UTI",
      },
    ],
    membros_participantes: [
      {
        nome: "Ana Mendes",
        formacao: "Enfermagem",
        funcao: "Gestor(a) de Qualidade e Segurança",
        setor: "Qualidade e Segurança do Paciente",
      },
      { nome: "Lívia Prado", formacao: "Fisioterapia", funcao: "Fisioterapeuta", setor: "UTI" },
    ],
    fontes_consultadas: {
      selected: ["Prontuário", "Protocolo/POP", "Relato da equipe"],
      outro: "",
    },
    alguem_precisa_ser_ouvido: "Sim",
    registro_entrevistas: [
      {
        data: "2026-08-06",
        nome: "Técnica de enfermagem do plantão noturno",
        funcao: "Técnico(a) de Enfermagem",
        relato:
          "Relatou que, nas noites de 01 e 02/08, havia duas técnicas para dez leitos e que a mudança de decúbito foi feita apenas quando havia outra pessoa disponível para ajudar.",
        problemas_percebidos:
          "Equipe reduzida no período noturno e ausência de um local visível para registrar o horário da última mudança de decúbito.",
      },
    ],
    cronologia: [
      {
        data: "2026-07-28",
        hora: "10:00",
        fato: "Paciente é admitido na UTI, sedado e em ventilação mecânica. Avaliação de risco (escala de Braden) indica alto risco para lesão por pressão.",
        fonte: "Prontuário",
        status: "Confirmado",
      },
      {
        data: "2026-07-28",
        hora: "10:30",
        fato: "Enfermeira prescreve mudança de decúbito a cada 2 horas.",
        fonte: "Prontuário",
        status: "Confirmado",
      },
      {
        data: "2026-08-01",
        hora: "19:00",
        fato: "A partir deste plantão, os registros de mudança de decúbito passam a ter intervalos de 5 a 6 horas.",
        fonte: "Prontuário",
        status: "Confirmado",
      },
      {
        data: "2026-08-02",
        hora: "23:00",
        fato: "Técnica de enfermagem relata que a mudança de decúbito não foi realizada por falta de uma segunda pessoa para mobilizar o paciente.",
        fonte: "Entrevista",
        status: "Provável",
      },
      {
        data: "2026-08-03",
        hora: "08:15",
        fato: "Durante o banho no leito, a equipe identifica lesão por pressão estágio 2 em região sacral.",
        fonte: "Prontuário",
        status: "Confirmado",
      },
      {
        data: "2026-08-03",
        hora: "09:00",
        fato: "Enfermeira realiza curativo, comunica o médico plantonista e reforça a prescrição de mudança de decúbito.",
        fonte: "Prontuário",
        status: "Confirmado",
      },
    ],
    ppc: [
      {
        problema: "Mudança de decúbito não realizada no intervalo prescrito",
        esperado:
          "O paciente deveria ter sido reposicionado a cada 2 horas, conforme prescrição de enfermagem e protocolo de prevenção de lesão por pressão.",
        ocorrido:
          "Entre 01 e 03/08, o paciente permaneceu de 5 a 6 horas na mesma posição em pelo menos quatro ocasiões.",
      },
    ],
    fatores_por_ppc: {
      "ppc#0": {
        checked: { fatores_paciente: true, fatores_ambiente: true, fatores_tarefas: true },
        details: {
          fatores_paciente: {
            achado:
              "Paciente sedado, em ventilação mecânica e com alto risco na escala de Braden, sem condições de se movimentar sozinho.",
            fonte: "Prontuário",
          },
          fatores_ambiente: {
            achado:
              "No plantão noturno havia duas técnicas de enfermagem para dez leitos, e a UTI não dispunha de colchão pneumático para o leito do paciente.",
            fonte: "Entrevista; Observação",
          },
          fatores_tarefas: {
            achado:
              "A mudança de decúbito era registrada apenas na evolução, sem um controle de horários visível à beira do leito.",
            fonte: "Prontuário; Protocolo/documento",
          },
        },
        porques: {
          fatores_ambiente: porques([
            [
              "Por que a mudança de decúbito não foi feita a cada 2 horas?",
              "Não havia uma segunda pessoa disponível para mobilizar o paciente",
            ],
            [
              "Por que não havia uma segunda pessoa disponível?",
              "O plantão noturno estava com duas técnicas para dez leitos",
            ],
            [
              "Por que o plantão estava com duas técnicas?",
              "Um afastamento não foi coberto na escala daquela semana",
            ],
          ]),
        },
      },
    },
    recomendacoes: [{ recomendacao: REC_3_A }, { recomendacao: REC_3_B }],
  };

  // ---------------------------------------------------------------- #1004 — Em ação
  const REC_4 = "Implementar dupla checagem de identificação do paciente antes de procedimentos.";
  const analise4: AnaliseValues = {
    incidente_investigado: "Medicação pré-anestésica administrada a paciente com pulseira trocada",
    condutor_analise: [
      {
        nome: "Renata Farias",
        formacao: "Enfermagem",
        funcao: "Coordenador(a)",
        setor: "Centro Cirúrgico",
      },
    ],
    membros_participantes: [
      {
        nome: "Ana Mendes",
        formacao: "Enfermagem",
        funcao: "Gestor(a) de Qualidade e Segurança",
        setor: "Qualidade e Segurança do Paciente",
      },
      {
        nome: "Carlos Nogueira",
        formacao: "Medicina",
        funcao: "Médico(a)",
        setor: "Centro Cirúrgico",
      },
    ],
    fontes_consultadas: {
      selected: ["Prontuário", "Protocolo/POP", "Relato da equipe"],
      outro: "",
    },
    alguem_precisa_ser_ouvido: "Sim",
    registro_entrevistas: [
      {
        data: "2026-08-23",
        nome: "Técnico de enfermagem da admissão",
        funcao: "Técnico(a) de Enfermagem",
        relato:
          "Relatou que duas pacientes com o mesmo primeiro nome chegaram juntas à sala de preparo e que as pulseiras foram impressas em sequência e colocadas sem conferência com o documento.",
        problemas_percebidos:
          "Pulseiras impressas em lote e colocadas com pressa, por causa do atraso no mapa cirúrgico.",
      },
    ],
    cronologia: [
      {
        data: "2026-08-20",
        hora: "06:40",
        fato: "Duas pacientes com o mesmo primeiro nome são admitidas na sala de preparo do centro cirúrgico.",
        fonte: "Prontuário",
        status: "Confirmado",
      },
      {
        data: "2026-08-20",
        hora: "06:50",
        fato: "As pulseiras de identificação das duas pacientes são impressas em sequência e colocadas pelo técnico de enfermagem.",
        fonte: "Entrevista",
        status: "Provável",
      },
      {
        data: "2026-08-20",
        hora: "07:20",
        fato: "Medicação pré-anestésica prescrita para outra paciente é administrada, após conferência apenas da pulseira.",
        fonte: "Prontuário",
        status: "Confirmado",
      },
      {
        data: "2026-08-20",
        hora: "07:45",
        fato: "Na checagem antes da indução anestésica, a paciente informa nome completo e data de nascimento diferentes dos que constam na pulseira.",
        fonte: "Prontuário",
        status: "Confirmado",
      },
      {
        data: "2026-08-20",
        hora: "07:50",
        fato: "O procedimento é suspenso, as pulseiras das duas pacientes são corrigidas e o anestesista é comunicado.",
        fonte: "Prontuário",
        status: "Confirmado",
      },
      {
        data: "2026-08-20",
        hora: "10:00",
        fato: "A paciente permanece em observação com sonolência leve; a cirurgia é remarcada para o período da tarde.",
        fonte: "Prontuário",
        status: "Confirmado",
      },
    ],
    ppc: [
      {
        problema: "Pulseira de identificação colocada na paciente errada",
        esperado:
          "A pulseira deveria ter sido conferida com o documento e confirmada com a própria paciente (nome completo e data de nascimento) no momento da colocação.",
        ocorrido:
          "As pulseiras de duas pacientes foram impressas juntas e colocadas sem conferência, ficando trocadas.",
      },
      {
        problema: "Administração de medicação sem conferência de dois identificadores",
        esperado:
          "Antes de administrar a medicação, o profissional deveria ter confirmado dois identificadores com a paciente e comparado com a prescrição.",
        ocorrido: "A conferência foi feita apenas pela leitura da pulseira, que estava trocada.",
      },
    ],
    fatores_por_ppc: {
      "ppc#0": {
        checked: { fatores_tarefas: true, fatores_ambiente: true },
        details: {
          fatores_tarefas: {
            achado:
              "O procedimento de admissão não define em que momento a pulseira deve ser conferida nem quem é o responsável pela conferência.",
            fonte: "Protocolo/documento; Entrevista",
          },
          fatores_ambiente: {
            achado:
              "Duas admissões simultâneas, com atraso no mapa cirúrgico, levaram à impressão das pulseiras em lote.",
            fonte: "Entrevista",
          },
        },
        porques: {
          fatores_tarefas: porques([
            [
              "Por que a pulseira foi colocada na paciente errada?",
              "As pulseiras foram impressas juntas e colocadas sem conferência",
            ],
            [
              "Por que foram colocadas sem conferência?",
              "O procedimento de admissão não exige conferir a pulseira com o documento",
            ],
            [
              "Por que o procedimento não exige essa conferência?",
              "Ele não foi revisado desde a adoção do protocolo de identificação",
            ],
          ]),
        },
      },
      "ppc#1": {
        checked: { fatores_equipe: true, fatores_organizacionais: true },
        details: {
          fatores_equipe: {
            achado:
              "A equipe confia na pulseira como única fonte de identificação e não tem o hábito de confirmar os dados com a paciente.",
            fonte: "Entrevista; Observação",
          },
          fatores_organizacionais: {
            achado:
              "O último treinamento sobre o protocolo de identificação do paciente no setor foi realizado há mais de dois anos.",
            fonte: "Protocolo/documento",
          },
        },
        porques: {},
      },
    },
    recomendacoes: [{ recomendacao: REC_4 }],
  };

  // ---------------------------------------------------------------- #1005 — Em análise
  const REC_5 =
    "Revisar o processo de passagem de plantão para conferência de horários de medicação.";
  const analise5: AnaliseValues = {
    incidente_investigado: "Antibiótico administrado com 4 horas de atraso na troca de plantão",
    condutor_analise: [
      {
        nome: "Ana Mendes",
        formacao: "Enfermagem",
        funcao: "Gestor(a) de Qualidade e Segurança",
        setor: "Qualidade e Segurança do Paciente",
      },
    ],
    membros_participantes: [
      {
        nome: "Juliana Tavares",
        formacao: "Farmácia",
        funcao: "Farmacêutico(a)",
        setor: "Farmácia Hospitalar",
      },
    ],
    fontes_consultadas: { selected: ["Prontuário", "Relato da equipe"], outro: "" },
    alguem_precisa_ser_ouvido: "Não",
    cronologia: [
      {
        data: "2026-08-20",
        hora: "12:00",
        fato: "Antibiótico endovenoso prescrito de 6 em 6 horas é administrado no horário.",
        fonte: "Prontuário",
        status: "Confirmado",
      },
      {
        data: "2026-08-20",
        hora: "18:00",
        fato: "Horário previsto para a dose seguinte. Não há registro de administração na prescrição.",
        fonte: "Prontuário",
        status: "Confirmado",
      },
      {
        data: "2026-08-20",
        hora: "19:00",
        fato: "Passagem de plantão é feita verbalmente, no posto de enfermagem. A dose pendente das 18h não é mencionada.",
        fonte: "Outro",
        status: "Provável",
      },
      {
        data: "2026-08-20",
        hora: "22:00",
        fato: "Na conferência da prescrição, a enfermeira do plantão noturno identifica a dose das 18h em aberto e administra o antibiótico.",
        fonte: "Prontuário",
        status: "Confirmado",
      },
      {
        data: "2026-08-20",
        hora: "22:25",
        fato: "Paciente apresenta pico febril de 38,4 °C. O médico plantonista é comunicado e os horários das doses seguintes são reaprazados.",
        fonte: "Prontuário",
        status: "Confirmado",
      },
    ],
    ppc: [
      {
        problema: "Dose de antibiótico administrada fora do horário prescrito",
        esperado: "A dose das 18h deveria ter sido administrada no horário aprazado na prescrição.",
        ocorrido: "A dose foi administrada às 22h, com 4 horas de atraso.",
      },
    ],
    fatores_por_ppc: {
      "ppc#0": {
        checked: { fatores_equipe: true, fatores_tarefas: true, fatores_ambiente: true },
        details: {
          fatores_equipe: {
            achado:
              "A passagem de plantão foi apenas verbal e não incluiu as medicações com horário próximo à troca de turno.",
            fonte: "Entrevista",
          },
          fatores_tarefas: {
            achado:
              "Não existe um roteiro de passagem de plantão com um item para medicações pendentes ou com horário crítico.",
            fonte: "Protocolo/documento",
          },
          fatores_ambiente: {
            achado:
              "Às 18h a equipe atendia uma intercorrência em outro leito, e o horário coincide com o fim do turno.",
            fonte: "Prontuário; Entrevista",
          },
        },
        porques: {
          fatores_equipe: porques([
            [
              "Por que a dose das 18h não foi administrada no horário?",
              "A equipe da tarde atendia uma intercorrência e a dose ficou pendente",
            ],
            [
              "Por que a pendência não foi resolvida na troca de plantão?",
              "Ela não foi informada à equipe da noite na passagem de plantão",
            ],
            [
              "Por que não foi informada?",
              "A passagem é verbal e não segue um roteiro com as medicações pendentes",
            ],
          ]),
        },
      },
    },
    recomendacoes: [{ recomendacao: REC_5 }],
  };

  return [
    base(
      "notificacao-1",
      1001,
      "NOVA",
      "Paciente apresentou risco de queda durante transferência para o leito.",
      setores[0],
      null,
    ),
    base(
      "notificacao-2",
      1002,
      "CLASSIFICADA",
      "Queda sem dano durante deslocamento no corredor.",
      setores[1],
      classificada,
    ),
    {
      ...base(
        "notificacao-3",
        1003,
        "CONCLUIDA",
        "Paciente internado na UTI há seis dias apresentou lesão por pressão em região sacral, identificada durante o banho no leito.",
        setores[2],
        {
          ...classificada,
          id: "classificacao-3",
          notificacao_id: "notificacao-3",
          tipos_incidentes: ["LESAO_PRESSAO"],
          observacoes:
            "Lesão por pressão estágio 2, com necessidade de curativo. Encaminhada à UTI para análise.",
          data_classificacao: "2026-08-05T09:30:00.000Z",
          data_validade: calcularPrazoAnalise("2026-08-04T09:00:00.000Z", "LEVE"),
        },
        {
          data_incidente: "2026-08-03T00:00:00.000Z",
          data_registro: "2026-08-04T09:00:00.000Z",
          updated_at: "2026-09-10T15:00:00.000Z",
          respostas: respostasDe(
            "60 anos ou mais",
            "Masculino",
            "Manhã",
            "08:15",
            "Profissional de saúde",
            "João Pereira",
            "joao.pereira@exemplo.com",
          ),
        },
      ),
      analise_via_encaminhamento: true,
      analise: {
        id: "analise-3",
        notificacao_id: "notificacao-3",
        concluida: true,
        valores: analise3,
        recomendacoes: [{ texto: REC_3_A }, { texto: REC_3_B }],
        data_inicio: "2026-08-06T09:00:00.000Z",
        data_conclusao: "2026-08-08T17:00:00.000Z",
        responsavel_nome: "Administrador",
      } as AnaliseRaw,
      planos_acao: [
        plano("plano-3-1", {
          what: REC_3_A,
          where: "UTI",
          responsible: "Paulo Azevedo",
          responsaveis: [{ nome: "Paulo Azevedo", funcao: "Coordenador(a)", setor: "UTI" }],
          startDate: "2026-08-11",
          conclusionDate: "2026-09-05",
          proof: "Impresso de controle de mudança de decúbito preenchido em todos os leitos.",
          expectedResult: "Nenhuma nova lesão por pressão adquirida na UTI.",
          verification:
            "Auditoria semanal dos impressos e inspeção de pele dos pacientes de risco.",
          verificationDate: "05/09/2026",
          indicator: "Sim",
          indicatorDetail: "Nº de novas lesões por pressão na UTI por mês.",
          status: "Concluído",
          realStartDate: "2026-08-11",
          realConclusionDate: "2026-09-04",
          completionDescription:
            "Impresso implantado nos dez leitos e equipes dos três turnos orientadas.",
          observedResult:
            "Adesão de 96% nas auditorias e nenhuma nova lesão por pressão no período.",
          effectiveness: "Sim",
          effectivenessReason:
            "Os intervalos entre as mudanças de decúbito passaram a ser cumpridos.",
          evidenceLocation: "Pasta de auditorias da coordenação de enfermagem da UTI.",
          updatedAt: "2026-09-08T11:00:00.000Z",
        }),
        plano("plano-3-2", {
          what: REC_3_B,
          where: "UTI",
          responsible: "Paulo Azevedo",
          responsaveis: [{ nome: "Paulo Azevedo", funcao: "Coordenador(a)", setor: "UTI" }],
          startDate: "2026-08-11",
          conclusionDate: "2026-09-05",
          resource: "Sim",
          resourceItems: [{ pedido: "4 colchões pneumáticos", preco: "6.400,00" }],
          approval: "Sim",
          approvalDetail: "Aprovação da diretoria administrativa para a compra.",
          proof: "Nota fiscal e colchões instalados nos leitos.",
          expectedResult: "Todos os pacientes de alto risco em colchão pneumático.",
          verification: "Conferência dos leitos de pacientes com alto risco na escala de Braden.",
          verificationDate: "05/09/2026",
          indicator: "Não",
          status: "Concluído",
          realStartDate: "2026-08-12",
          realConclusionDate: "2026-09-02",
          completionDescription: "Quatro colchões adquiridos e instalados.",
          observedResult: "Todos os pacientes de alto risco passaram a usar colchão pneumático.",
          effectiveness: "Sim",
          effectivenessReason: "Não houve nova lesão por pressão após a instalação.",
          evidenceLocation: "Setor de patrimônio (nota fiscal) e leitos da UTI.",
          updatedAt: "2026-09-05T16:20:00.000Z",
        }),
      ],
    },
    {
      ...base(
        "notificacao-4",
        1004,
        "EM_ACAO",
        "Paciente recebeu a medicação pré-anestésica de outra paciente porque as pulseiras de identificação estavam trocadas. A troca foi percebida na checagem antes da anestesia.",
        setores[3],
        {
          ...classificada,
          id: "classificacao-4",
          notificacao_id: "notificacao-4",
          tipos_incidentes: ["FALHA_IDENTIFICACAO"],
          observacoes:
            "Paciente apresentou sonolência leve e a cirurgia foi remarcada. Encaminhada ao centro cirúrgico para análise.",
        },
        {
          respostas: respostasDe(
            "18 a 59 anos",
            "Feminino",
            "Manhã",
            "07:20",
            "Profissional de saúde",
            "Maria da Silva",
            "maria@exemplo.com",
          ),
        },
      ),
      analise_via_encaminhamento: true,
      analise: {
        id: "analise-4",
        notificacao_id: "notificacao-4",
        concluida: true,
        valores: analise4,
        recomendacoes: [{ texto: REC_4 }],
        data_inicio: "2026-08-23T10:00:00.000Z",
        data_conclusao: "2026-08-24T16:00:00.000Z",
        responsavel_nome: "Administrador",
      } as AnaliseRaw,
      planos_acao: [
        plano("plano-4-1", {
          what: REC_4,
          where: "Centro Cirúrgico",
          responsible: "Renata Farias",
          responsaveis: [
            { nome: "Renata Farias", funcao: "Coordenador(a)", setor: "Centro Cirúrgico" },
          ],
          startDate: "2026-08-25",
          conclusionDate: "2026-09-25",
          proof: "Checklist de dupla checagem assinado e anexado ao prontuário.",
          expectedResult: "Nenhum erro de identificação de paciente no centro cirúrgico.",
          verification: "Auditoria mensal de prontuários.",
          verificationDate: "25/10/2026",
          indicator: "Sim",
          indicatorDetail: "Nº de eventos de identificação incorreta por mês.",
          status: "Em andamento",
          updatedAt: "2026-08-24T16:30:00.000Z",
        }),
      ],
    },
    {
      ...base(
        "notificacao-5",
        1005,
        "EM_ANALISE",
        "Medicamento administrado em horário incorreto durante troca de plantão.",
        setores[1],
        {
          ...classificada,
          id: "classificacao-5",
          notificacao_id: "notificacao-5",
          tipos_incidentes: ["ERRO_MEDICACAO"],
          observacoes: "Núcleo optou por analisar diretamente, sem encaminhar ao setor.",
        },
        {
          respostas: respostasDe(
            "60 anos ou mais",
            "Feminino",
            "Noite",
            "22:25",
            "Profissional de saúde",
            "Maria da Silva",
            "maria@exemplo.com",
          ),
        },
      ),
      analise_via_encaminhamento: false,
      analise: {
        id: "analise-5",
        notificacao_id: "notificacao-5",
        concluida: true,
        valores: analise5,
        recomendacoes: [{ texto: REC_5 }],
        data_inicio: "2026-08-27T09:00:00.000Z",
        data_conclusao: "2026-08-27T15:00:00.000Z",
        responsavel_nome: "Administrador",
      } as AnaliseRaw,
      // Como no fluxo real: ao concluir a análise, a recomendação vira uma ação pré-criada,
      // ainda com preenchimento pendente (ver concluirAnaliseLocal).
      planos_acao: [plano("plano-5-1", { what: REC_5, updatedAt: "2026-08-27T15:00:00.000Z" })],
    },
    // Registro que não é um incidente de segurança do paciente (reclamação de atendimento):
    // arquivado pelo núcleo sem classificação.
    base(
      "notificacao-6",
      1006,
      "ARQUIVADA",
      "Minha mãe está internada e apertei a campainha do quarto várias vezes para pedir um cobertor. Demoraram quase uma hora para aparecer, e quando fui até o posto as enfermeiras estavam conversando e rindo. Acho um descaso com os pacientes.",
      setores[1],
      null,
      {
        data_incidente: "2026-08-27T00:00:00.000Z",
        data_registro: "2026-08-28T08:40:00.000Z",
        updated_at: "2026-08-29T09:15:00.000Z",
        anonima: true,
        respostas: respostasDe(
          "60 anos ou mais",
          "Feminino",
          "Tarde",
          "15:30",
          "Familiar/acompanhante",
        ),
      },
    ),
  ];
}

export function getNotificacoes(): NotificacaoRaw[] {
  try {
    const versaoSalva = localStorage.getItem(SEED_VERSION_KEY);
    if (versaoSalva !== SEED_VERSION) {
      const fresh = seed();
      localStorage.setItem(NOTIFICACOES_KEY, JSON.stringify(fresh));
      localStorage.setItem(HISTORICO_KEY, JSON.stringify(seedHistorico()));
      localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
      return clone(fresh);
    }
    const saved = localStorage.getItem(NOTIFICACOES_KEY);
    if (!saved) return seed();
    const itens = clone(JSON.parse(saved)) as NotificacaoRaw[];
    // Classificações salvas antes do cálculo do prazo (RN-14) ficaram sem data-limite: completa aqui.
    for (const n of itens) {
      const c = n.classificacao;
      if (c && !c.rascunho && !c.data_validade)
        c.data_validade = calcularPrazoAnalise(n.data_registro, c.grau_dano);
    }
    return itens;
  } catch {
    return seed();
  }
}
export function saveNotificacoes(items: NotificacaoRaw[]) {
  localStorage.setItem(NOTIFICACOES_KEY, JSON.stringify(items));
}
export function getHistorico(id: string): Historico[] {
  try {
    const all = JSON.parse(localStorage.getItem(HISTORICO_KEY) ?? "{}");
    return clone(all[id] ?? []);
  } catch {
    return [];
  }
}
export function addHistorico(
  id: string,
  campo: string,
  anterior: string | null = null,
  novo: string | null = null,
) {
  const all = JSON.parse(localStorage.getItem(HISTORICO_KEY) ?? "{}");
  all[id] = [
    {
      id: newLocalId(),
      campo_alterado: campo,
      valor_anterior: anterior,
      valor_novo: novo,
      data_alteracao: now(),
      usuario: { nome: "Administrador" },
    },
    ...(all[id] ?? []),
  ];
  localStorage.setItem(HISTORICO_KEY, JSON.stringify(all));
}

export function criarLocal(payload: NotificacaoPayload): NotificacaoRaw {
  const items = getNotificacoes();
  const id = newLocalId();
  // Maior código existente + 1 — contar os itens repetia códigos (o seed não é sequencial).
  const proximoCodigo = Math.max(1000, ...items.map((n) => n.codigo ?? 0)) + 1;
  const valueFor = (r: RespostaCampo) =>
    r.valor ??
    camposFormulario
      .find((c) => c.id === r.campo_id)
      ?.opcoes?.find((o) => o.id === (r.valor_opcao_id ?? r.valores_opcoes_ids?.[0]))?.valor ??
    null;
  const respostas = payload.respostas.map((r) => ({
    id: newLocalId(),
    campo_id: r.campo_id,
    label_original: camposFormulario.find((c) => c.id === r.campo_id)?.label ?? "",
    valor_texto: r.valor ?? null,
    valor_opcao_id: r.valor_opcao_id ?? null,
    valor_entidade_id: r.valor_entidade_id ?? null,
    valor_entidade_label: r.valor_entidade_label ?? null,
    opcao_selecionada: r.valor_opcao_id ? { id: r.valor_opcao_id, valor: valueFor(r) ?? "" } : null,
  }));
  const descricao =
    valueFor(payload.respostas.find((r) => r.campo_id.endsWith("000004")) ?? { campo_id: "" }) ??
    "Sem descrição";
  const item: NotificacaoRaw = {
    id,
    codigo: proximoCodigo,
    codigo_formatado: String(proximoCodigo),
    status: "NOVA",
    data_incidente: payload.data_incidente,
    data_registro: now(),
    updated_at: now(),
    descricao,
    anonima: payload.anonima,
    tenant_id: "prototipo",
    unidade_id: payload.unidade_id,
    setor_id: payload.setor_id,
    notificante_id: null,
    unidade: { nome: unidades.find((u) => u.id === payload.unidade_id)?.nome ?? "Instituição" },
    setor: { nome: setores.find((s) => s.id === payload.setor_id)?.nome ?? "Setor" },
    classificacao: null,
    respostas,
  };
  saveNotificacoes([item, ...items]);
  addHistorico(id, "notificação criada");
  return clone(item);
}

function requireNotificacao(id: string) {
  const items = getNotificacoes();
  const index = items.findIndex((item) => item.id === id);
  if (index < 0) throw new Error("Notificação não encontrada.");
  return { items, index, item: items[index] };
}

function optionLabel(campoId: string, optionId: string, fallback: string | null) {
  const campo = camposFormulario.find((item) => item.id === campoId);
  const fromForm = campo?.opcoes?.find((option) => option.id === optionId)?.valor;
  if (fromForm) return fromForm;
  const editOptions: Record<string, string> = {
    "66666666-6666-4666-b666-000000000017": "Manhã (07h-13h)",
    "66666666-6666-4666-b666-000000000018": "Tarde (13h-19h)",
    "66666666-6666-4666-b666-000000000019": "Noite (19h-07h)",
    "66666666-6666-4666-b666-000000000020": "Não sei informar",
    "66666666-6666-4666-b666-000000000006": "Recém-nascido",
    "66666666-6666-4666-b666-000000000007": "0-1 ano",
    "66666666-6666-4666-b666-000000000008": "2-12 anos",
    "66666666-6666-4666-b666-000000000009": "13-17 anos",
    "66666666-6666-4666-b666-000000000010": "18-59 anos",
    "66666666-6666-4666-b666-000000000011": "60 anos ou mais",
    "66666666-6666-4666-b666-000000000012": "Não sei informar",
    "66666666-6666-4666-b666-000000000013": "Feminino",
    "66666666-6666-4666-b666-000000000014": "Masculino",
    "66666666-6666-4666-b666-000000000015": "Outro",
    "66666666-6666-4666-b666-000000000016": "Não sei informar",
  };
  return editOptions[optionId] ?? fallback ?? "Não informado";
}

export function atualizarLocal(id: string, payload: UpdateNotificacaoPayload): NotificacaoRaw {
  const { items, index, item } = requireNotificacao(id);
  const updated = clone(item);
  const changed: string[] = [];
  if (payload.data_incidente && payload.data_incidente !== updated.data_incidente) {
    updated.data_incidente = payload.data_incidente;
    changed.push("data do incidente");
  }
  if (payload.unidade_id && payload.unidade_id !== updated.unidade_id) {
    updated.unidade_id = payload.unidade_id;
    updated.unidade = {
      nome: unidades.find((u) => u.id === payload.unidade_id)?.nome ?? "Instituição",
    };
    changed.push("instituição");
  }
  if (payload.setor_id && payload.setor_id !== updated.setor_id) {
    updated.setor_id = payload.setor_id;
    updated.setor = { nome: setores.find((s) => s.id === payload.setor_id)?.nome ?? "Setor" };
    changed.push("setor");
  }
  for (const respostaPayload of payload.respostas ?? []) {
    const existing = updated.respostas.find((r) => r.campo_id === respostaPayload.campo_id);
    const label = optionLabel(
      respostaPayload.campo_id,
      respostaPayload.valor_opcao_id ?? "",
      respostaPayload.valor ?? null,
    );
    const next: RespostaItemRaw = {
      id: existing?.id ?? newLocalId(),
      campo_id: respostaPayload.campo_id,
      label_original:
        existing?.label_original ??
        camposFormulario.find((c) => c.id === respostaPayload.campo_id)?.label ??
        "",
      valor_texto:
        respostaPayload.valor ??
        (respostaPayload.valor_opcao_id ? null : (existing?.valor_texto ?? null)),
      valor_opcao_id: respostaPayload.valor_opcao_id ?? existing?.valor_opcao_id ?? null,
      valor_entidade_id: null,
      valor_entidade_label: null,
      opcao_selecionada: respostaPayload.valor_opcao_id
        ? { id: respostaPayload.valor_opcao_id, valor: label }
        : (existing?.opcao_selecionada ?? null),
    };
    if (existing) Object.assign(existing, next);
    else updated.respostas.push(next);
    changed.push(next.label_original || "informação geral");
  }
  updated.updated_at = now();
  items[index] = updated;
  saveNotificacoes(items);
  addHistorico(
    id,
    `informações atualizadas: ${[...new Set(changed)].join(", ") || "sem alterações"}`,
  );
  return clone(updated);
}

export function classificarLocal(id: string, payload: ClassificarPayload): ClassificacaoRaw {
  const { items, index, item } = requireNotificacao(id);
  const data = now();
  const classificacao: ClassificacaoRaw = {
    id: item.classificacao?.id ?? newLocalId(),
    notificacao_id: id,
    profissional_nsp_id: "usuario-demo",
    profissional_nsp_nome: "Administrador",
    tipo_incidente: payload.tipo_incidente ?? null,
    tipo_especifico: payload.tipo_especifico ?? null,
    tipos_incidentes: payload.tipos_incidentes ?? [],
    envolvidos: payload.envolvidos ?? [],
    grau_dano: payload.grau_dano ?? null,
    observacoes: payload.observacoes ?? null,
    rascunho: false,
    data_classificacao: data,
    data_validade: calcularPrazoAnalise(item.data_registro, payload.grau_dano),
    outro_envolvido: payload.outro_envolvido ?? null,
    outro_tipo_incidente: payload.outro_tipo_incidente ?? null,
  };
  items[index] = { ...item, classificacao, status: "CLASSIFICADA", updated_at: data };
  saveNotificacoes(items);
  addHistorico(id, "classificação registrada");
  return clone(classificacao);
}

/** Encaminha a notificação para o setor ANTES da análise (setor é quem vai analisar). */
export function encaminharLocal(id: string, setorDestinoId?: string) {
  const { items, index, item } = requireNotificacao(id);
  if (!item.classificacao || item.classificacao.rascunho)
    throw new Error("Classifique a notificação antes de encaminhá-la.");
  items[index] = { ...item, status: "ENCAMINHADA_SETOR", updated_at: now() };
  saveNotificacoes(items);
  addHistorico(
    id,
    `notificação encaminhada para ${setores.find((s) => s.id === setorDestinoId)?.nome ?? "o setor responsável"} analisar`,
  );
  return clone(items[index]);
}

export function salvarAnaliseRascunhoLocal(id: string, valores: AnaliseValues): AnaliseRaw {
  const { items, index, item } = requireNotificacao(id);

  const viaEncaminhamento = item.status === "ENCAMINHADA_SETOR";
  const analiseViaEncaminhamento = item.analise
    ? item.analise_via_encaminhamento
    : viaEncaminhamento;
  const novoStatus =
    item.status === "CLASSIFICADA" || item.status === "ENCAMINHADA_SETOR"
      ? "EM_ANALISE"
      : item.status;

  const analise: AnaliseRaw = {
    id: item.analise?.id ?? newLocalId(),
    notificacao_id: id,
    concluida: false,
    valores,
    recomendacoes: item.analise?.recomendacoes ?? [],
    data_inicio: item.analise?.data_inicio ?? now(),
    data_conclusao: null,
    responsavel_nome: "Administrador",
  };
  items[index] = {
    ...item,
    analise,
    status: novoStatus,
    analise_via_encaminhamento: analiseViaEncaminhamento,
    updated_at: now(),
  };
  saveNotificacoes(items);
  return clone(analise);
}

/** Plano de ação já vem pré-carregado com as recomendações registradas na última seção da
    Análise (RN-13/CA10) — não existe mais uma seção própria de "Plano de Ação" no assistente,
    já que o plano é preenchido e gerenciado direto na tela de detalhe da notificação. */
function extrairPlanosDeAcaoPreenchidos(recomendacoes: RecomendacaoExtraida[]): ActionPlan[] {
  return recomendacoes
    .filter((r) => r.texto.trim().length > 0)
    .map((r) => ({
      ...createEmptyActionPlan(),
      id: newLocalId(),
      what: r.texto.trim(),
      origemRecomendacao: r.texto.trim(),
      updatedAt: now(),
    }));
}

export function concluirAnaliseLocal(
  id: string,
  valores: AnaliseValues,
  recomendacoes: RecomendacaoExtraida[],
): { notificacao: NotificacaoRaw; analise: AnaliseRaw } {
  const { items, index, item } = requireNotificacao(id);
  const analise: AnaliseRaw = {
    id: item.analise?.id ?? newLocalId(),
    notificacao_id: id,
    concluida: true,
    valores,
    recomendacoes,
    data_inicio: item.analise?.data_inicio ?? now(),
    data_conclusao: now(),
    responsavel_nome: "Administrador",
  };

  const status = item.analise_via_encaminhamento ? "ANALISADA" : "EM_ANALISE";
  const planosPreCriados = extrairPlanosDeAcaoPreenchidos(recomendacoes);
  const planosAcao = [...(item.planos_acao ?? []), ...planosPreCriados];
  items[index] = {
    ...item,
    analise,
    status,
    planos_acao: planosAcao,
    updated_at: now(),
  };
  saveNotificacoes(items);
  addHistorico(id, "análise concluída");
  if (planosPreCriados.length > 0) {
    addHistorico(
      id,
      `${planosPreCriados.length} ${planosPreCriados.length === 1 ? "ação criada" : "ações criadas"} no plano de ação a partir das recomendações da análise`,
    );
  }
  return { notificacao: clone(items[index]), analise: clone(analise) };
}

export function decidirEncaminhamentoPosAnaliseLocal(
  id: string,
  decisao:
    | { encaminhar: true; setorDestinoId?: string; mensagem?: string }
    | { encaminhar: false; justificativa: string },
): NotificacaoRaw {
  const { items, index, item } = requireNotificacao(id);
  if (!item.analise?.concluida)
    throw new Error("Conclua a análise antes de registrar esta decisão.");
  items[index] = { ...item, status: "ANALISADA", updated_at: now() };
  saveNotificacoes(items);
  if (decisao.encaminhar) {
    addHistorico(
      id,
      `análise encaminhada para ${setores.find((s) => s.id === decisao.setorDestinoId)?.nome ?? "o setor responsável"}` +
        (decisao.mensagem?.trim() ? ` — ${decisao.mensagem.trim()}` : ""),
    );
  } else {
    addHistorico(id, `análise não encaminhada ao setor — motivo: ${decisao.justificativa}`);
  }
  return clone(items[index]);
}

export function registrarPlanoAcaoLocal(id: string, plan: ActionPlan): NotificacaoRaw {
  const { items, index, item } = requireNotificacao(id);
  if (item.status !== "ANALISADA" && item.status !== "EM_ACAO")
    throw new Error("A análise precisa estar concluída para registrar um plano de ação.");
  const planos = [...(item.planos_acao ?? []), plan];
  items[index] = { ...item, planos_acao: planos, status: "EM_ACAO", updated_at: now() };
  saveNotificacoes(items);
  addHistorico(id, `plano de ação registrado: ${plan.what}`);
  return clone(items[index]);
}

export function atualizarPlanoAcaoLocal(id: string, plano: ActionPlan): NotificacaoRaw {
  const { items, index, item } = requireNotificacao(id);
  const anterior = (item.planos_acao ?? []).find((p) => p.id === plano.id);
  const planos = (item.planos_acao ?? []).map((p) => (p.id === plano.id ? plano : p));
  // Completar uma ação pré-criada pela Análise equivale a registrá-la: a notificação entra em ação.
  const completou =
    !!anterior &&
    camposPendentesPlano(anterior).length > 0 &&
    camposPendentesPlano(plano).length === 0;
  const status = completou && item.status === "ANALISADA" ? "EM_ACAO" : item.status;
  items[index] = { ...item, planos_acao: planos, status, updated_at: now() };
  saveNotificacoes(items);
  addHistorico(
    id,
    completou
      ? `plano de ação completado: ${plano.what}`
      : `plano de ação atualizado: ${plano.what} (${plano.status})`,
  );
  return clone(items[index]);
}

export function excluirPlanoAcaoLocal(id: string, planoId: string): NotificacaoRaw {
  const { items, index, item } = requireNotificacao(id);
  const alvo = (item.planos_acao ?? []).find((p) => p.id === planoId);
  const planos = (item.planos_acao ?? []).filter((p) => p.id !== planoId);
  items[index] = { ...item, planos_acao: planos, updated_at: now() };
  saveNotificacoes(items);
  addHistorico(id, `plano de ação excluído${alvo ? `: ${alvo.what}` : ""}`);
  return clone(items[index]);
}

export function arquivarLocal(id: string) {
  const { items, index, item } = requireNotificacao(id);
  items[index] = { ...item, status: "ARQUIVADA", updated_at: now() };
  saveNotificacoes(items);
  addHistorico(id, "notificação arquivada");
  return clone(items[index]);
}

export function concluirIncidenteLocal(id: string) {
  const { items, index, item } = requireNotificacao(id);
  if (item.status !== "ANALISADA" && item.status !== "EM_ACAO")
    throw new Error("Só é possível concluir o incidente depois que a análise foi registrada.");
  items[index] = { ...item, status: "CONCLUIDA", updated_at: now() };
  saveNotificacoes(items);
  addHistorico(id, "concluiu o incidente");
  return clone(items[index]);
}

import type { CampoDinamico, NotificacaoPayload, RespostaCampo } from "../types/formulario";
import type {
  ClassificacaoRaw,
  NotificacaoRaw,
  RespostaItemRaw,
} from "../types/notificacaoDetalhe";
import type { ClassificarPayload, UpdateNotificacaoPayload } from "./notificacaoDetalheService";
import type { ActionPlan } from "../types/actionPlan";
import { createEmptyActionPlan } from "../types/actionPlan";
import type {
  AnaliseFlowId,
  AnaliseRaw,
  AnaliseValues,
  MetodologiaAbordagem,
  RecomendacaoExtraida,
} from "../types/analise";
import { FLOW_TO_METODOLOGIA, METODOLOGIA_LABEL } from "../types/analise";

const NOTIFICACOES_KEY = "notifica_saude_prototipo_notificacoes";
const HISTORICO_KEY = "notifica_saude_prototipo_historico";
const SEED_VERSION_KEY = "notifica_saude_prototipo_seed_versao";

const SEED_VERSION = "2";

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
  // ⚠️ PROVISÓRIO — ver CAMPO_IDS.CONDUTA_IMEDIATA em types/notificacaoDetalhe.ts.
  {
    id: "55555555-5555-4555-b555-000000000011",
    label: "Conduta imediata adotada",
    tipo: "AREA",
    obrigatorio: false,
    secao: "Tela 4 - Descrição do Incidente e Papel do Notificador",
    placeholder: "Ex.: avaliação médica, analgesia, exame de imagem, comunicação à família",
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

function seed(): NotificacaoRaw[] {
  const base = (
    id: string,
    codigo: number,
    status: string,
    descricao: string,
    setor: (typeof setores)[number],
    classificacao: ClassificacaoRaw | null,
  ): NotificacaoRaw => ({
    id,
    codigo,
    codigo_formatado: String(codigo).padStart(4, "0"),
    status,
    data_incidente: "2026-08-20T00:00:00.000Z",
    data_registro: "2026-08-21T12:00:00.000Z",
    updated_at: "2026-08-22T14:30:00.000Z",
    descricao,
    condutaImediata: "Avaliação médica, analgesia, exame de imagem e comunicação à família.",
    anonima: false,
    tenant_id: "prototipo",
    unidade_id: unidades[0].id,
    setor_id: setor.id,
    notificante_id: null,
    unidade: { nome: unidades[0].nome },
    setor: { nome: setor.nome },
    classificacao,
    respostas: [
      resposta("55555555-5555-4555-b555-000000000000", null, "Sim"),
      resposta("55555555-5555-4555-b555-000000000001", null, "60 anos ou mais"),
      resposta("55555555-5555-4555-b555-000000000002", null, "Feminino"),
      resposta("55555555-5555-4555-b555-000000000009", null, "Manhã"),
      resposta("55555555-5555-4555-b555-000000000012", "22:25"),
      resposta("55555555-5555-4555-b555-000000000005", null, "Profissional de saúde"),
      resposta("55555555-5555-4555-b555-000000000006", "Maria da Silva"),
      resposta("55555555-5555-4555-b555-000000000007", "maria@exemplo.com"),
    ],
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
    data_validade: "2026-09-21T14:30:00.000Z",
    outro_envolvido: null,
    outro_tipo_incidente: null,
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
        "notificacao-4",
        1004,
        "EM_ACAO",
        "Análise concluída após falha na identificação do paciente.",
        setores[3],
        {
          ...classificada,
          id: "classificacao-4",
          notificacao_id: "notificacao-4",
          tipos_incidentes: ["FALHA_IDENTIFICACAO"],
          observacoes: "Análise concluída e ações corretivas necessárias foram definidas.",
        },
      ),
      metodologia_analise: "ACR" as MetodologiaAbordagem,
      analise_via_encaminhamento: true,
      analise: {
        id: "analise-4",
        notificacao_id: "notificacao-4",
        metodologia: "ACR",
        flowAtivo: "acr",
        concluida: true,
        valores: {},
        recomendacoes: [
          {
            texto:
              "Implementar dupla checagem de identificação do paciente antes de procedimentos.",
          },
        ],
        data_inicio: "2026-08-23T10:00:00.000Z",
        data_conclusao: "2026-08-24T16:00:00.000Z",
        responsavel_nome: "Administrador",
      } as AnaliseRaw,
      planos_acao: [
        {
          id: "plano-4-1",
          what: "Implementar dupla checagem de identificação do paciente antes de procedimentos.",
          where: "Setor de Enfermagem",
          responsible: "Coordenação de Enfermagem",
          startDate: "2026-08-25",
          conclusionDate: "2026-09-25",
          resource: "Não",
          resourceItems: [],
          approval: "Não",
          approvalDetail: "",
          proof: "Checklist assinado em prontuário.",
          expectedResult: "Redução de erros de identificação a zero no setor.",
          verification: "Auditoria mensal de prontuários.",
          verificationDate: "2026-10-25",
          indicator: "Sim",
          indicatorDetail: "Nº de eventos de identificação incorreta por mês.",
          status: "Em andamento",
          realStartDate: "",
          realConclusionDate: "",
          completionDescription: "",
          observedResult: "",
          effectiveness: "",
          effectivenessReason: "",
          delayReason: "",
          newConclusionDate: "",
          cancellationReason: "",
          evidenceLocation: "",
          attachments: [],
          updatedAt: "2026-08-24T16:30:00.000Z",
          origemRecomendacao:
            "Implementar dupla checagem de identificação do paciente antes de procedimentos.",
        },
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
      ),
      metodologia_analise: "ACR" as MetodologiaAbordagem,
      analise_via_encaminhamento: false,
      analise: {
        id: "analise-5",
        notificacao_id: "notificacao-5",
        metodologia: "ACR",
        flowAtivo: "acr",
        concluida: true,
        valores: {},
        recomendacoes: [
          {
            texto:
              "Revisar o processo de passagem de plantão para conferência de horários de medicação.",
          },
        ],
        data_inicio: "2026-08-27T09:00:00.000Z",
        data_conclusao: "2026-08-27T15:00:00.000Z",
        responsavel_nome: "Administrador",
      } as AnaliseRaw,
    },
  ];
}

export function getNotificacoes(): NotificacaoRaw[] {
  try {
    const versaoSalva = localStorage.getItem(SEED_VERSION_KEY);
    if (versaoSalva !== SEED_VERSION) {
      const fresh = seed();
      localStorage.setItem(NOTIFICACOES_KEY, JSON.stringify(fresh));
      localStorage.setItem(HISTORICO_KEY, "{}");
      localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
      return clone(fresh);
    }
    const saved = localStorage.getItem(NOTIFICACOES_KEY);
    if (!saved) return seed();
    return clone(JSON.parse(saved)) as NotificacaoRaw[];
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
  const condutaImediata = valueFor(
    payload.respostas.find((r) => r.campo_id.endsWith("000011")) ?? { campo_id: "" },
  );
  const item: NotificacaoRaw = {
    id,
    codigo: 1000 + items.length + 1,
    codigo_formatado: String(1000 + items.length + 1),
    status: "NOVA",
    data_incidente: payload.data_incidente,
    data_registro: now(),
    updated_at: now(),
    descricao,
    condutaImediata,
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
    data_validade: null,
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

export function salvarAnaliseRascunhoLocal(
  id: string,
  flowAtivo: AnaliseFlowId,
  valores: AnaliseValues,
): AnaliseRaw {
  const { items, index, item } = requireNotificacao(id);
  // Não existe mais uma etapa dedicada de "escolher metodologia" antes de iniciar a análise — ela
  // fica implícita no fluxo que o usuário está de fato seguindo (ver FLOW_TO_METODOLOGIA).
  const metodologia = item.metodologia_analise ?? FLOW_TO_METODOLOGIA[flowAtivo];

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
    metodologia,
    flowAtivo,
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
    metodologia_analise: metodologia,
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
  flowAtivo: AnaliseFlowId,
  valores: AnaliseValues,
  recomendacoes: RecomendacaoExtraida[],
): { notificacao: NotificacaoRaw; analise: AnaliseRaw } {
  const { items, index, item } = requireNotificacao(id);
  // Idem salvarAnaliseRascunhoLocal: sem etapa dedicada de escolha, a metodologia é implícita no
  // fluxo seguido (normalmente já persistida desde o primeiro rascunho, mas o default cobre o
  // caso de concluir num único passo, sem rascunho intermediário).
  const metodologia = item.metodologia_analise ?? FLOW_TO_METODOLOGIA[flowAtivo];
  const analise: AnaliseRaw = {
    id: item.analise?.id ?? newLocalId(),
    notificacao_id: id,
    metodologia,
    flowAtivo,
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
    metodologia_analise: metodologia,
    updated_at: now(),
  };
  saveNotificacoes(items);
  addHistorico(id, `análise concluída (${METODOLOGIA_LABEL[metodologia]})`);
  if (planosPreCriados.length > 0) {
    addHistorico(
      id,
      `${planosPreCriados.length} ${planosPreCriados.length === 1 ? "plano de ação pré-criado" : "planos de ação pré-criados"} a partir do plano de ação preenchido na análise`,
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
  const planos = (item.planos_acao ?? []).map((p) => (p.id === plano.id ? plano : p));
  items[index] = { ...item, planos_acao: planos, updated_at: now() };
  saveNotificacoes(items);
  addHistorico(id, `plano de ação atualizado: ${plano.what} (${plano.status})`);
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

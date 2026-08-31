import {
  addHistorico,
  arquivarLocal,
  atualizarLocal,
  classificarLocal,
  encaminharLocal,
  getHistorico,
  getNotificacoes,
  newLocalId,
  setores,
} from "./localStore";
import {
  CAMPO_IDS,
  type NotificacaoRaw,
  type RespostaItemRaw,
  type NotificacaoDetalheDTO,
  type ClassificacaoDTO,
  type ClassificacaoRaw,
} from "../types/notificacaoDetalhe";
import { formatDateOnly, formatDateTime } from "../utils/formatDate";

// --------------------------------------------------------------------------
// Labels de exibição
// --------------------------------------------------------------------------

export const STATUS_LABEL: Record<string, string> = {
  NOVA: "Novo",
  CLASSIFICADA: "Classificada",
  ANALISADA: "Em análise",
  ENCAMINHADA_SETOR: "Encaminhado",
  ARQUIVADA: "Arquivado",
};

export const GRAU_DANO_LABEL: Record<string, string> = {
  LEVE: "Leve",
  MODERADO: "Moderado",
  GRAVE: "Grave",
  OBITO: "Óbito",
  NEVER_EVENT: "Never Event",
};

export const TIPO_INCIDENTE_LABEL: Record<string, string> = {
  NEAR_MISS: "Near Miss",
  CIRCUNSTANCIA_NOTIFICAVEL: "Circunstância notificável",
  EVENTO_ADVERSO: "Evento adverso",
  INCIDENTE_SEM_DANO: "Incidente sem dano",
};

export const TIPO_ESPECIFICO_LABEL: Record<string, string> = {
  ALTA_LIBERACAO_PACIENTE_INCAPAZ_PESSOA_NAO_AUTORIZADA:
    "Alta ou liberação de paciente incapaz para pessoa não autorizada",
  CONTAMINACAO_O2_GASES_MEDICINAIS: "Contaminação na administração de O2 ou gases medicinais",
  DESAPARECIMENTO_CORPO_RECEM_NASCIDO_OBITO:
    "Desaparecimento do corpo do recém-nascido que foi a óbito",
  EXODONTIA_DENTE_ERRADO: "Exodontia de dente errado",
  GAS_ERRADO_O2_GASES_MEDICINAIS: "Gás errado na administração de O2 ou gases medicinais",
  INSEMINACAO_FERTILIZACAO_ESPERMA_OVULO_ERRADO:
    "Inseminação artificial ou fertilização in vitro com esperma ou óvulo errado",
  LESAO_GRAVE_QUEDA_DURANTE_CUIDADOS:
    "Lesão grave associada à queda do paciente durante prestação de cuidados",
  LESAO_PRESSAO_ESTAGIO_3: "Lesão por Pressão estágio 3 (perda total da espessura da pele)",
  LESAO_PRESSAO_ESTAGIO_4:
    "Lesão por Pressão estágio 4 (perda total da espessura da pele e perda tissular)",
  LESAO_PRESSAO_NAO_CLASSIFICAVEL:
    "Lesão por Pressão Não Classificável (perda tissular não visível)",
  OBITO_QUEDA_DURANTE_CUIDADOS: "Óbito associado à queda do paciente durante prestação de cuidados",
  OBITO_INTRAOPERATORIO_POS_OPERATORIO_ASA_CLASSE_1:
    "Óbito intraoperatório ou pós-operatório em paciente ASA Classe 1",
  OBITO_LESAO_GRAVE_FUGA_PACIENTE: "Óbito ou lesão grave associado à fuga do paciente",
  OBITO_LESAO_GRAVE_CHOQUE_ELETRICO:
    "Óbito ou lesão grave por choque elétrico durante a assistência",
  OBITO_LESAO_GRAVE_OBJETO_METALICO_RESSONANCIA_MAGNETICA:
    "Óbito ou lesão grave por objeto metálico em área de Ressonância Magnética",
  OBITO_LESAO_GRAVE_CONTENCAO_FISICA_GRADES:
    "Óbito ou lesão grave por uso de contenção física ou grades da cama",
  OBITO_LESAO_GRAVE_QUEIMADURA: "Óbito ou lesão grave por queimadura durante a assistência",
  OBITO_LESAO_GRAVE_PERDA_AMOSTRA_BIOLOGICA:
    "Óbito ou lesão grave por perda irrecuperável de amostra biológica",
  OBITO_LESAO_GRAVE_RECEM_NASCIDO_PARTO_BAIXO_RISCO:
    "Óbito ou lesão grave de recém-nascido em parto de baixo risco",
  OBITO_LESAO_GRAVE_FALHA_EXAMES_LABORATORIAIS:
    "Óbito ou lesão grave por falha no acompanhamento de exames laboratoriais",
  OBITO_LESAO_GRAVE_FALHA_EXAMES_RADIOLOGICOS:
    "Óbito ou lesão grave por falha no acompanhamento de exames radiológicos",
  OBITO_LESAO_MATERNA_PARTO_BAIXO_RISCO: "Óbito ou lesão materna grave em parto de baixo risco",
  PROCEDIMENTO_CIRURGICO_LOCAL_ERRADO: "Procedimento cirúrgico realizado em local errado",
  PROCEDIMENTO_CIRURGICO_LADO_ERRADO: "Procedimento cirúrgico realizado no lado errado do corpo",
  PROCEDIMENTO_CIRURGICO_PACIENTE_ERRADO: "Procedimento cirúrgico realizado no paciente errado",
  QUEDA_RECEM_NASCIDO_PARTO: "Queda do recém-nascido durante o parto",
  CIRURGIA_ERRADA_PACIENTE: "Realização de cirurgia errada em um paciente",
  RETENCAO_CORPO_ESTRANHO_APOS_CIRURGIA:
    "Retenção não intencional de corpo estranho após a cirurgia",
  SUICIDIO_TENTATIVA_DANO_AUTO_INFLIGIDO:
    "Suicídio, tentativa ou dano auto infligido com lesão grave durante a assistência",
  TROCA_BEBES: "Troca de bebês",
};

export const CATEGORIA_INCIDENTE_LABEL: Record<string, string> = {
  ERRO_MEDICACAO: "Erro de medicação",
  FALHA_IDENTIFICACAO: "Falha na identificação do paciente",
  QUEDA: "Queda",
  LESAO_PRESSAO: "Lesão por pressão",
  INFECCAO_ASSISTENCIA: "Infecção relacionada à assistência",
  PROCEDIMENTO_CIRURGICO: "Procedimento cirúrgico",
  EQUIPAMENTO_DISPOSITIVO: "Equipamento ou dispositivo médico",
  FALHA_DIAGNOSTICO: "Falha de diagnóstico",
  COMUNICACAO: "Comunicação",
  TRANSFUSAO_SANGUINEA: "Transfusão sanguínea",
  DOCUMENTACAO_PRONTUARIO: "Documentação / prontuário",
  OUTRO: "Outro",
};

export const PROTOCOLO_INVESTIGACAO_LABEL: Record<string, string> = {
  INVESTIGACAO_DIRETA: "Investigação Direta (ACR + Ishikawa + 5 Porquês + SMART)",
  INVESTIGACAO_SISTEMICA_PROFUNDA: "Investigação Sistêmica Profunda (Protocolo de Londres + SMART)",
};

export const ENVOLVIDO_LABEL: Record<string, string> = {
  PROFISSIONAL_SAUDE: "Profissional de saúde",
  PACIENTE: "Paciente",
  FAMILIAR_ACOMPANHANTE: "Familiar/acompanhante",
  EQUIPAMENTO: "Equipamento",
  SISTEMA: "Sistema",
  AMBIENTE_FISICO: "Ambiente físico",
  MEDICAMENTO: "Medicamento",
  DISPOSITIVO_MEDICO: "Dispositivo médico",
  OUTRO: "Outro",
};

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function getRespostaValor(respostas: RespostaItemRaw[], campoId: string): string | null {
  const r = respostas.find((item) => item.campo_id === campoId);
  if (!r) return null;
  if (r.opcao_selecionada) return r.opcao_selecionada.valor;
  if (r.valor_entidade_label) return r.valor_entidade_label;
  return r.valor_texto ?? null;
}

function getRespostaTexto(respostas: RespostaItemRaw[], campoId: string): string | null {
  return respostas.find((r) => r.campo_id === campoId)?.valor_texto ?? null;
}

// --------------------------------------------------------------------------
// Mapper: raw → DTO
// --------------------------------------------------------------------------

export function mapToNotificacaoDetalhe(raw: NotificacaoRaw): NotificacaoDetalheDTO {
  const respostas = raw.respostas ?? [];

  const envolveValor = getRespostaValor(respostas, CAMPO_IDS.ENV_PACIENTE);
  const envolvido = envolveValor?.toLowerCase() === "sim";

  const rawClassificacao = raw.classificacao;
  const classificacao: ClassificacaoDTO | null = rawClassificacao
    ? {
        // Quando o backend retorna tipo_incidente nulo em Never Events, inferimos "Evento adverso"
        // pois Never Event é sempre uma subcategoria de Evento Adverso
        tipoIncidente: rawClassificacao.tipo_incidente
          ? (TIPO_INCIDENTE_LABEL[rawClassificacao.tipo_incidente] ??
            rawClassificacao.tipo_incidente)
          : rawClassificacao.grau_dano === "NEVER_EVENT"
            ? TIPO_INCIDENTE_LABEL["EVENTO_ADVERSO"]
            : null,
        tipoEspecifico: rawClassificacao.tipo_especifico
          ? (TIPO_ESPECIFICO_LABEL[rawClassificacao.tipo_especifico] ??
            rawClassificacao.tipo_especifico)
          : null,
        tiposIncidentes: (rawClassificacao.tipos_incidentes ?? []).map((t) => {
          if (t === "OUTRO" && rawClassificacao.outro_tipo_incidente) {
            return `Outro - ${rawClassificacao.outro_tipo_incidente}`;
          }
          return CATEGORIA_INCIDENTE_LABEL[t] ?? t;
        }),
        envolvidos: (rawClassificacao.envolvidos ?? []).map((e) => {
          if (e === "OUTRO" && rawClassificacao.outro_envolvido) {
            return `Outro - ${rawClassificacao.outro_envolvido}`;
          }
          return ENVOLVIDO_LABEL[e] ?? e;
        }),
        grauDano: rawClassificacao.grau_dano
          ? (GRAU_DANO_LABEL[rawClassificacao.grau_dano] ?? rawClassificacao.grau_dano)
          : null,
        observacoes: rawClassificacao.observacoes,
        protocoloInvestigacao: rawClassificacao.protocolo_investigacao
          ? (PROTOCOLO_INVESTIGACAO_LABEL[rawClassificacao.protocolo_investigacao] ??
            rawClassificacao.protocolo_investigacao)
          : null,
        rascunho: rawClassificacao.rascunho,
        // @db.Timestamptz — ISO 8601 com timezone
        dataClassificacao: formatDateTime(rawClassificacao.data_classificacao),
        // @db.Timestamptz — exibe data e hora exatas do vencimento
        dataValidade: rawClassificacao.data_validade
          ? formatDateTime(rawClassificacao.data_validade)
          : null,
        diasValidade: null,
        outroEnvolvido: rawClassificacao.outro_envolvido,
        outroTipoIncidente: rawClassificacao.outro_tipo_incidente,
      }
    : null;

  return {
    id: raw.id,
    codigo: raw.codigo_formatado ?? raw.codigo.toString().padStart(4, "0"),
    statusRaw: raw.status,
    statusLabel: STATUS_LABEL[raw.status] ?? raw.status,
    // @db.Date — Prisma serializa como UTC midnight; formatDateOnly extrai a parte da data sem converter timezone
    dataIncidente: formatDateOnly(raw.data_incidente),
    // @db.Date — exibe apenas a data de criação, sem horário
    dataCadastro: formatDateOnly(raw.data_registro),
    // @db.Timestamptz — ISO 8601 com timezone; usado no histórico para mostrar data e hora
    dataCadastroCompleto: formatDateTime(raw.data_registro),
    // @db.Timestamptz — ISO 8601 com timezone
    dataAtualizacao: formatDateTime(raw.updated_at ?? raw.data_registro),
    descricao: raw.descricao,
    anonima: raw.anonima,
    unidade: raw.unidade?.nome ?? "(Não informado)",
    setor: (() => {
      const nome = raw.setor?.nome ?? "(Não informado)";
      const outroText = getRespostaTexto(respostas, CAMPO_IDS.SETOR);
      return nome.toLowerCase() === "outro" && outroText?.trim()
        ? `Outro - ${outroText.trim()}`
        : nome;
    })(),
    turno: getRespostaValor(respostas, CAMPO_IDS.TURNO),
    papel: getRespostaValor(respostas, CAMPO_IDS.PAPEL),
    paciente: {
      envolvido,
      idade: envolvido ? getRespostaValor(respostas, CAMPO_IDS.IDADE) : null,
      sexo: envolvido
        ? (() => {
            const sexoValor = getRespostaValor(respostas, CAMPO_IDS.SEXO);
            if (sexoValor?.toLowerCase() === "outro") {
              const outroText = getRespostaTexto(respostas, CAMPO_IDS.SEXO);
              return outroText?.trim() ? `Outro - ${outroText.trim()}` : sexoValor;
            }
            return sexoValor;
          })()
        : null,
    },
    notificante: {
      nome: getRespostaValor(respostas, CAMPO_IDS.NOME_OPC),
      contato: getRespostaValor(respostas, CAMPO_IDS.CONTATO_OPC),
    },
    classificacao,
  };
}

// --------------------------------------------------------------------------
// Tipos do formulário de edição
// --------------------------------------------------------------------------

export type UpdateNotificacaoPayload = {
  unidade_id?: string;
  setor_id?: string;
  data_incidente?: string;
  tipo_incidente?: string;
  grau_dano?: string;
  observacoes?: string;
  respostas?: {
    campo_id: string;
    valor?: string;
    valor_opcao_id?: string;
  }[];
};

// --------------------------------------------------------------------------
// Update — PUT /api/notificacoes/:id — retorna a notificação atualizada
// --------------------------------------------------------------------------

export async function getNotificacaoById(id: string): Promise<NotificacaoRaw> {
  const item = getNotificacoes().find((notificacao) => notificacao.id === id);
  if (!item) throw new Error("Notificação não encontrada.");
  return item;
}

export async function updateNotificacao(
  id: string,
  payload: UpdateNotificacaoPayload,
): Promise<NotificacaoRaw> {
  return atualizarLocal(id, payload);
}

export type HistoricoItemAPI = {
  id: string;
  campo_alterado: string;
  valor_anterior: string | null;
  valor_novo: string | null;
  data_alteracao: string;
  usuario: { nome: string } | null;
};

export async function getNotificacaoHistorico(id: string): Promise<HistoricoItemAPI[]> {
  return getHistorico(id);
}

// --------------------------------------------------------------------------
// Tipos do modal de classificação
// --------------------------------------------------------------------------

export type ClassificarPayload = {
  tipo_incidente?: string | null;
  tipo_especifico?: string | null;
  tipos_incidentes?: string[];
  envolvidos?: string[];
  grau_dano?: string | null;
  observacoes?: string | null;
  protocolo_investigacao?: string | null;
  outro_envolvido?: string | null;
  outro_tipo_incidente?: string | null;
};

// --------------------------------------------------------------------------
// Classificar — POST /api/notificacoes/:id/classificacao (cria rascunho ou finaliza)
// --------------------------------------------------------------------------

export async function classificarNotificacao(
  id: string,
  payload: ClassificarPayload,
): Promise<ClassificacaoRaw> {
  return classificarLocal(id, payload);
}

// --------------------------------------------------------------------------
// Encaminhar — POST /api/notificacoes/:id/encaminhamento
// --------------------------------------------------------------------------

export type EncaminhamentoResponse = {
  encaminhamento: {
    id: string;
    notificacao_id: string;
    setor_destino_id: string;
    responsavel_nsp_id: string;
    mensagem: string | null;
    data_envio: string;
  };
  notificacao: { id: string; status: string };
};

export async function encaminharNotificacao(
  id: string,
  payload: { mensagem?: string; setor_destino_id?: string } = {},
): Promise<EncaminhamentoResponse> {
  const notificacao = encaminharLocal(id, payload.setor_destino_id);
  return {
    encaminhamento: {
      id: newLocalId(),
      notificacao_id: id,
      setor_destino_id: payload.setor_destino_id ?? notificacao.setor_id,
      responsavel_nsp_id: "usuario-demo",
      mensagem: payload.mensagem ?? null,
      data_envio: new Date().toISOString(),
    },
    notificacao: { id, status: notificacao.status },
  };
}

// --------------------------------------------------------------------------
// Arquivar — POST /api/notificacoes/:id/arquivar
// --------------------------------------------------------------------------

export async function arquivarNotificacao(
  id: string,
  motivo?: string | null,
): Promise<{ id: string; status: string }> {
  const notificacao = arquivarLocal(id);
  if (motivo?.trim()) addHistorico(id, "motivo do arquivamento", null, motivo.trim());
  return { id: notificacao.id, status: notificacao.status };
}

// --------------------------------------------------------------------------
// Atualizar rascunho — PUT /api/notificacoes/:id/classificacao
// --------------------------------------------------------------------------

export async function getSetoresDisponiveis(): Promise<{ id: string; nome: string }[]> {
  return setores;
}

export async function atualizarClassificacao(
  id: string,
  payload: ClassificarPayload,
): Promise<ClassificacaoRaw> {
  return classificarLocal(id, payload);
}

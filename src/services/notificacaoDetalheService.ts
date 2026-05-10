import { apiFetch } from "./api";
import {
  CAMPO_IDS,
  type NotificacaoRaw,
  type RespostaItemRaw,
  type NotificacaoDetalheDTO,
  type ClassificacaoDTO,
  type ClassificacaoRaw,
} from "../types/notificacaoDetalhe";

// --------------------------------------------------------------------------
// Labels de exibição
// --------------------------------------------------------------------------

export const STATUS_LABEL: Record<string, string> = {
  REGISTRADA: "Registrada",
  CLASSIFICADA: "Classificada",
  ENVIADA_SETOR_RESPONSAVEL: "Encaminhada ao setor",
  EM_INVESTIGACAO: "Em investigação",
  EM_ANALISE: "Em análise",
  ARQUIVADA: "Arquivada",
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
  CIRCUNSTANCIA_RISCO: "Circunstância notificável",
  EVENTO_ADVERSO: "Evento adverso",
  INCIDENTE_SEM_DANO: "Incidente sem dano",
};

export const TIPO_ESPECIFICO_LABEL: Record<string, string> = {
  CIRURGIA_PARTE_ERRADA: "Cirurgia em parte errada do corpo",
  CIRURGIA_PACIENTE_ERRADO: "Cirurgia em paciente errado",
  CIRURGIA_PROCEDIMENTO_ERRADO: "Procedimento cirúrgico errado",
  RETENCAO_CORPO_ESTRANHO: "Retenção não intencional de corpo estranho",
  EMBOLIA_GASOSA: "Embolia gasosa",
  TRANSFUSAO_INCOMPATIVEL: "Incompatibilidade sanguínea (transfusão)",
  MORTE_MATERNA: "Morte ou lesão grave materna (parto)",
  MORTE_NEONATAL: "Morte ou lesão grave neonatal (parto de baixo risco)",
  SUICIDIO_HOSPITALAR: "Suicídio ou tentativa no ambiente hospitalar",
  VIOLACAO_SEXUAL: "Abuso ou violação sexual no hospital",
  FUGA_PACIENTE: "Fuga de paciente com dano grave ou morte",
  QUEDA_MORTE: "Queda que resultou em morte",
  ERROS_MEDICAMENTOS_MORTE: "Morte por erro de medicação",
  HIPER_HIPOGLICEMIA_MORTE: "Morte por hiper/hipoglicemia severa",
  ALTA_TENSAO_MORTE: "Morte por alta tensão ou queimadura grave",
  REACAO_ADVERSA_VACINA_MORTE: "Morte por reação adversa a vacina",
  INFECCAO_HOSPITALAR_GRAVE: "Infecção hospitalar grave ou óbito por infecção",
  DISPOSITIVO_MEDICO_MORTE: "Morte ou lesão grave por dispositivo médico",
  ESCARAS_GRAVES: "Lesão por pressão Grau 3 ou 4 (adquirida no hospital)",
  IDENTIFICACAO_ERRADA: "Identificação errada do paciente",
  COMUNICACAO_FALHA: "Falha na comunicação (dano grave)",
  QUEDA_LESAO_GRAVE: "Queda que resultou em lesão grave",
  INTERVENCAO_NEONATAL: "Morte ou lesão grave por intervenção em neonato",
  COMPLICACAO_ANESTESIA: "Complicação por anestesia",
  REACAO_TRANSFUSIONAL: "Reação transfusional grave",
  CORPO_ESTRANHO_NEONATO: "Retenção de corpo estranho em neonato",
  PNEUMOTORAX_NEONATO: "Pneumotórax iatrogênico em neonato",
  ENTEROCOLITE_NEONATO: "Enterocolite necrotizante em neonato",
  PARALISIA_BRAQUIAL_NEONATO: "Paralisia braquial obstétrica",
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

function formatDate(isoString: string): string {
  const [year, month, day] = isoString.split("T")[0].split("-");
  return `${day}/${month}/${year}`;
}

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  const d = date.toLocaleDateString("pt-BR");
  const t = date.toLocaleTimeString("pt-BR");
  return `${d} - ${t}`;
}

// --------------------------------------------------------------------------
// Mapper: raw → DTO
// --------------------------------------------------------------------------

export function mapToNotificacaoDetalhe(raw: NotificacaoRaw): NotificacaoDetalheDTO {
  const respostas = raw.respostas ?? [];

  const envolveValor = getRespostaValor(respostas, CAMPO_IDS.ENV_PACIENTE);
  const envolvido = envolveValor?.toLowerCase() === "sim";

  const classificacao: ClassificacaoDTO | null = raw.classificacao
    ? {
        tipoIncidente: raw.classificacao.tipo_incidente
          ? (TIPO_INCIDENTE_LABEL[raw.classificacao.tipo_incidente] ??
            raw.classificacao.tipo_incidente)
          : null,
        tipoEspecifico: raw.classificacao.tipo_especifico
          ? (TIPO_ESPECIFICO_LABEL[raw.classificacao.tipo_especifico] ??
            raw.classificacao.tipo_especifico)
          : null,
        envolvidos: raw.classificacao.envolvidos ?? [],
        grauDano: raw.classificacao.grau_dano
          ? (GRAU_DANO_LABEL[raw.classificacao.grau_dano] ?? raw.classificacao.grau_dano)
          : null,
        observacoes: raw.classificacao.observacoes,
        rascunho: raw.classificacao.rascunho,
        dataClassificacao: formatDate(raw.classificacao.data_classificacao),
        dataValidade: raw.classificacao.data_validade
          ? formatDate(raw.classificacao.data_validade)
          : null,
        outroEnvolvido: raw.classificacao.outro_envolvido,
      }
    : null;

  return {
    id: raw.id,
    statusRaw: raw.status,
    statusLabel: STATUS_LABEL[raw.status] ?? raw.status,
    dataIncidente: formatDate(raw.data_incidente),
    dataCadastro: formatDateTime(raw.data_registro),
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
  return apiFetch<NotificacaoRaw>(`/api/notificacoes/${id}`);
}

export async function updateNotificacao(
  id: string,
  payload: UpdateNotificacaoPayload,
): Promise<NotificacaoRaw> {
  return apiFetch<NotificacaoRaw>(`/api/notificacoes/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
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
  return apiFetch<HistoricoItemAPI[]>(`/api/notificacoes/${id}/historico`);
}

// --------------------------------------------------------------------------
// Tipos do modal de classificação
// --------------------------------------------------------------------------

export type ClassificarPayload = {
  tipo_incidente?: string | null;
  tipo_especifico?: string | null;
  envolvidos?: string[];
  grau_dano?: string | null;
  observacoes?: string | null;
  outro_envolvido?: string | null;
  rascunho?: boolean;
};

// --------------------------------------------------------------------------
// Classificar — POST /api/notificacoes/:id/classificacao (cria rascunho ou finaliza)
// --------------------------------------------------------------------------

export async function classificarNotificacao(
  id: string,
  payload: ClassificarPayload,
): Promise<ClassificacaoRaw> {
  return apiFetch<ClassificacaoRaw>(`/api/notificacoes/${id}/classificacao`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// --------------------------------------------------------------------------
// Atualizar rascunho — PUT /api/notificacoes/:id/classificacao
// --------------------------------------------------------------------------

export async function atualizarClassificacao(
  id: string,
  payload: ClassificarPayload,
): Promise<ClassificacaoRaw> {
  return apiFetch<ClassificacaoRaw>(`/api/notificacoes/${id}/classificacao`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

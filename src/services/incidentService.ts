import { apiFetch } from "./api";
import type { Incident, IncidentStatus } from "../types/incident";
import type { NotificacaoRaw } from "../types/notificacaoDetalhe";
import { CAMPO_IDS } from "../types/notificacaoDetalhe";

// --------------------------------------------------------------------------
// Tipos de resposta do backend
// --------------------------------------------------------------------------

type BackendNotificacao = NotificacaoRaw & {
  classificacao: {
    rascunho: boolean;
    grau_dano?: string | null;
    profissional_nsp?: { nome: string } | null;
  } | null;
};

export type ListNotificacoesResponse = {
  total: number;
  data: BackendNotificacao[];
};

// --------------------------------------------------------------------------
// Mapeamentos de enum
// --------------------------------------------------------------------------

const STATUS_MAP: Record<string, IncidentStatus> = {
  NOVA: "Novo",
  CLASSIFICADA: "Classificado",
  ANALISADA: "Em análise",
  ENCAMINHADA_SETOR: "Encaminhado",
  ARQUIVADA: "Arquivado",
};

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("pt-BR");
}

function mapToIncident(n: BackendNotificacao): Incident {
  return {
    id: n.id,
    codigo: n.codigo_formatado ?? n.codigo.toString().padStart(4, "0"),
    statusRaw: n.status,
    date: formatDate(n.data_registro),
    status: STATUS_MAP[n.status] ?? "Novo",
    description: n.descricao ?? "(Sem descrição)",
    sector: (() => {
      const nome = n.setor?.nome ?? "(Sem setor)";
      if (nome.toLowerCase() === "outro") {
        const outroText = n.respostas?.find((r) => r.campo_id === CAMPO_IDS.SETOR)?.valor_texto;
        return outroText?.trim() ? `Outro - ${outroText.trim()}` : nome;
      }
      return nome;
    })(),
    responsavel: n.classificacao?.profissional_nsp?.nome ?? null,
    grauDano: n.classificacao?.grau_dano ?? null,
  };
}

// --------------------------------------------------------------------------
// Service
// --------------------------------------------------------------------------

export type BackendStatus =
  | "NOVA"
  | "CLASSIFICADA"
  | "ANALISADA"
  | "ENCAMINHADA_SETOR"
  | "ARQUIVADA";

export type FetchIncidentsParams = {
  page?: number;
  limit?: number;
  status?: BackendStatus;
  unidade_id?: string;
  setor_id?: string;
  tipo_incidente?: string;
  grau_dano?: string;
  search?: string;
  sort?: "recente" | "antigo";
};

export type FetchIncidentsResult = {
  incidents: Incident[];
  rawItems: NotificacaoRaw[];
  total: number;
};

export async function fetchIncidents(
  params: FetchIncidentsParams = {},
): Promise<FetchIncidentsResult> {
  const {
    page = 1,
    limit = 50,
    status,
    unidade_id,
    setor_id,
    tipo_incidente,
    grau_dano,
    search,
    sort,
  } = params;

  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (status) query.set("status", status);
  if (unidade_id) query.set("unidade_id", unidade_id);
  if (setor_id) query.set("setor_id", setor_id);
  if (tipo_incidente) query.set("tipo_incidente", tipo_incidente);
  if (grau_dano) query.set("grau_dano", grau_dano);
  if (search) query.set("search", search);
  if (sort) query.set("sort", sort);

  const response = await apiFetch<ListNotificacoesResponse>(`/api/notificacoes?${query}`);

  return {
    incidents: response.data.map(mapToIncident),
    rawItems: response.data,
    total: response.total,
  };
}

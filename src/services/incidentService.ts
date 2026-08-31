import { getNotificacoes } from "./localStore";
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

  let data = getNotificacoes();
  if (status) data = data.filter((item) => item.status === status);
  if (unidade_id) data = data.filter((item) => item.unidade_id === unidade_id);
  if (setor_id) data = data.filter((item) => item.setor_id === setor_id);
  if (tipo_incidente)
    data = data.filter((item) => item.classificacao?.tipo_incidente === tipo_incidente);
  if (grau_dano) data = data.filter((item) => item.classificacao?.grau_dano === grau_dano);
  if (search) {
    const query = search.toLowerCase();
    data = data.filter(
      (item) =>
        item.descricao?.toLowerCase().includes(query) || item.codigo_formatado?.includes(query),
    );
  }
  data.sort((a, b) =>
    sort === "antigo"
      ? a.data_registro.localeCompare(b.data_registro)
      : b.data_registro.localeCompare(a.data_registro),
  );
  const total = data.length;
  data = data.slice((page - 1) * limit, page * limit);

  return {
    incidents: data.map(mapToIncident),
    rawItems: data,
    total,
  };
}

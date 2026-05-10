import { useEffect, useState } from "react";
import { fetchIncidents, type FetchIncidentsParams } from "../services/incidentService";
import type { Incident } from "../types/incident";
import type { NotificacaoRaw } from "../types/notificacaoDetalhe";

type State = {
  incidents: Incident[];
  rawItems: NotificacaoRaw[];
  total: number;
  loading: boolean;
  error: string | null;
};

export function useIncidents(params: FetchIncidentsParams = {}) {
  const [state, setState] = useState<State>({
    incidents: [],
    rawItems: [],
    total: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    fetchIncidents(params)
      .then(({ incidents, rawItems, total }) => {
        if (!cancelled) {
          setState({ incidents, rawItems, total, loading: false, error: null });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Erro ao carregar notificações.";
          setState({ incidents: [], rawItems: [], total: 0, loading: false, error: message });
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params.page,
    params.limit,
    params.status,
    params.unidade_id,
    params.setor_id,
    params.tipo_incidente,
    params.grau_dano,
    params.search,
    params.sort,
  ]);

  return state;
}

import { useEffect, useState } from "react";
import type { CampoDinamico, OpcaoCampo } from "../types/formulario";
import { getCamposFormularioAtivos } from "../services/camposFormulario.service";
import { apiFetch } from "../services/api";

type UseCamposFormularioReturn = {
  campos: CampoDinamico[];
  loading: boolean;
  error: string | null;
  retry: () => void;
};

/**
 * Remove campos com IDs duplicados (mantém a última ocorrência, que tende a ser
 * a mais completa) e remove opções duplicadas dentro de cada campo.
 * Proteção defensiva enquanto o backend não corrige os dados.
 */
function deduplicarCampos(data: CampoDinamico[]): CampoDinamico[] {
  const mapaId = new Map<string, CampoDinamico>();
  for (const campo of data) {
    const anterior = mapaId.get(campo.id);
    // Prefere o registro que tem mais opções (o mais completo)
    if (!anterior || (campo.opcoes?.length ?? 0) >= (anterior.opcoes?.length ?? 0)) {
      mapaId.set(campo.id, {
        ...campo,
        opcoes: deduplicarOpcoes(campo.opcoes ?? []),
      });
    }
  }
  return Array.from(mapaId.values());
}

function deduplicarOpcoes(opcoes: CampoDinamico["opcoes"]): CampoDinamico["opcoes"] {
  if (!opcoes) return opcoes;
  const vistos = new Set<string>();
  return opcoes.filter((opt) => {
    if (vistos.has(opt.id)) return false;
    vistos.add(opt.id);
    return true;
  });
}

// Rotas públicas para campos relacionais que podem ser carregados de forma independente
const RELATIONAL_ENDPOINTS: Record<string, string> = {
  'UnidadeSaude': '/api/public/unidades',
  // SETOR: pré-carrega os setores globais (todas as unidades têm os mesmos inicialmente).
  // O cascade em Notificacao.tsx refina por unidade ao selecionar a instituição.
  'SETOR': '/api/public/setores',
};

async function fetchRelationalOptions(entidade: string): Promise<OpcaoCampo[]> {
  const endpoint = RELATIONAL_ENDPOINTS[entidade];
  if (!endpoint) return [];

  try {
    const data = await apiFetch<{ id: string; nome?: string; valor?: string; label?: string }[]>(endpoint);
    return data.map(item => ({
      id: item.id,
      valor: item.nome || item.valor || item.label || 'Sem nome'
    }));
  } catch (error) {
    console.error(`Erro ao buscar opções para ${entidade}:`, error);
    return [];
  }
}

/**
 * Busca os setores de uma unidade específica.
 * Deve ser chamado no onChange do campo C_INSTITUICAO para popular o campo C_SETOR.
 */
export async function fetchSetoresParaUnidade(unidadeId: string): Promise<OpcaoCampo[]> {
  try {
    const data = await apiFetch<{ id: string; nome: string }[]>(
      `/api/public/unidades/${unidadeId}/setores`
    );
    return data.map(item => ({ id: item.id, valor: item.nome }));
  } catch (error) {
    console.error('Erro ao buscar setores da unidade:', error);
    return [];
  }
}

function toUserMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : "";
  if (msg === "Failed to fetch" || msg.includes("NetworkError") || msg.includes("network")) {
    return "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
  }
  return "Ocorreu um erro ao carregar o formulário. Tente novamente.";
}

export function useCamposFormulario(): UseCamposFormularioReturn {
  const [campos, setCampos] = useState<CampoDinamico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getCamposFormularioAtivos()
      .then(async (data) => {
        if (cancelled) return;

        // Busca opções para campos relacionais que não possuem opções pré-definidas
        const processedCampos = await Promise.all(data.map(async (campo) => {
          if (campo.entidade_relacional && (!campo.opcoes || campo.opcoes.length === 0)) {
            const options = await fetchRelationalOptions(campo.entidade_relacional);
            return { ...campo, opcoes: options };
          }
          return campo;
        }));

        setCampos(deduplicarCampos(processedCampos));
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(toUserMessage(err));
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = () => {
    setLoading(true);
    setError(null);
    setAttempt((n) => n + 1);
  };

  return { campos, loading, error, retry };
}

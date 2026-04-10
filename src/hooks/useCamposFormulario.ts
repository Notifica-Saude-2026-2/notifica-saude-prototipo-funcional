import { useEffect, useState } from 'react';
import type { CampoDinamico } from '../types/formulario';
import { getCamposFormularioAtivos } from '../services/camposFormulario.service';

type UseCamposFormularioReturn = {
  campos: CampoDinamico[];
  loading: boolean;
  error: string | null;
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

function deduplicarOpcoes(opcoes: CampoDinamico['opcoes']): CampoDinamico['opcoes'] {
  if (!opcoes) return opcoes;
  const vistos = new Set<string>();
  return opcoes.filter((opt) => {
    if (vistos.has(opt.id)) return false;
    vistos.add(opt.id);
    return true;
  });
}

export function useCamposFormulario(): UseCamposFormularioReturn {
  const [campos, setCampos] = useState<CampoDinamico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCamposFormularioAtivos()
      .then((data) => {
        setCampos(deduplicarCampos(data));
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Erro ao carregar campos')
      )
      .finally(() => setLoading(false));
  }, []);

  return { campos, loading, error };
}

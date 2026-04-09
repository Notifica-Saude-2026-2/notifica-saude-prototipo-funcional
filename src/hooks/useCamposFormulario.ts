import { useEffect, useState } from 'react';
import type { CampoDinamico } from '../types/formulario';
import { getCamposFormularioAtivos } from '../services/camposFormulario.service';

type UseCamposFormularioReturn = {
  campos: CampoDinamico[];
  loading: boolean;
  error: string | null;
};

export function useCamposFormulario(): UseCamposFormularioReturn {
  const [campos, setCampos] = useState<CampoDinamico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCamposFormularioAtivos()
      .then(setCampos)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Erro ao carregar campos')
      )
      .finally(() => setLoading(false));
  }, []);

  return { campos, loading, error };
}

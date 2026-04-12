import { useState, useCallback } from 'react';
import type { CampoDinamico, NotificacaoPayload, RespostaCampo } from '../types/formulario';
import { criarNotificacao } from '../services/notificacao.service';

export type FormMeta = {
  anonima: boolean;
};

type UseNotificacaoReturn = {
  formValues: Record<string, unknown>;
  formMeta: FormMeta;
  updateField: (fieldId: string, value: unknown) => void;
  updateMeta: <K extends keyof FormMeta>(key: K, value: FormMeta[K]) => void;
  submit: (campos: CampoDinamico[]) => Promise<void>;
  submitting: boolean;
  submitError: string | null;
};

/**
 * Constrói o array de respostas no formato exato esperado pelo backend (Zod).
 */
function buildRespostas(
  campos: CampoDinamico[],
  formValues: Record<string, unknown>
): RespostaCampo[] {
  return campos.reduce<RespostaCampo[]>((acc, campo) => {
    const value = formValues[campo.id];

    // Ignora campos vazios, nulos ou indefinidos
    if (value === undefined || value === null || String(value).trim() === '') {
      return acc;
    }

    // RADIO / SELECT -> Espera valor_opcao_id (string única)
    if (campo.tipo === 'SELECT' || campo.tipo === 'RADIO') {
      acc.push({ 
        campo_id: campo.id, 
        valor_opcao_id: String(value) 
      });
      return acc;
    }

    // MULTISELECT / CHECKBOX -> Espera valores_opcoes_ids (array de strings)
    // BUG CORRIGIDO: O Zod espera a chave `valores_opcoes_ids`, e não um map fragmentado.
    if (campo.tipo === 'MULTISELECT' || campo.tipo === 'CHECKBOX') {
      if (Array.isArray(value) && value.length > 0) {
        acc.push({ 
          campo_id: campo.id, 
          valores_opcoes_ids : value.map(String) 
        });
      }
      return acc;
    }

    // Demais tipos (TEXTO, AREA, DATA, NUMERO) -> Espera valor (texto livre)
    acc.push({ 
      campo_id: campo.id, 
      valor: String(value) 
    });

    return acc;
  }, []);
}

export function useNotificacao(): UseNotificacaoReturn {
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [formMeta, setFormMeta] = useState<FormMeta>({ anonima: true });
  
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // useCallback evita re-renderizações desnecessárias em formulários grandes
  const updateField = useCallback((fieldId: string, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  const updateMeta = useCallback(<K extends keyof FormMeta>(key: K, value: FormMeta[K]) => {
    setFormMeta((prev) => ({ ...prev, [key]: value }));
  }, []);

  const submit = useCallback(async (campos: CampoDinamico[]) => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload: NotificacaoPayload = {
        anonima: formMeta.anonima,
        respostas: buildRespostas(campos, formValues),
      };

      console.debug('[Notificacao] Payload montado:', payload);

      await criarNotificacao(payload);
      
    } catch (err: unknown) {
      console.error('[Notificacao] Erro no submit:', err);
      
      // Tenta extrair a mensagem de erro da resposta (se a função apiFetch não a engoliu)
      // Fazemos o cast defensivo seguro porque não sabemos como sua apiFetch lança o erro
      const customErr = err as any;
      const responseData = customErr?.response?.data || customErr?.data || customErr?.body;
      
      let errorMessage = 'Não foi possível registrar a notificação. Verifique os dados.';

      if (responseData) {
        // Formata os erros do Zod ou pega a mensagem de erro tratada do backend
        errorMessage = responseData.message || 
          (responseData.errors ? JSON.stringify(responseData.errors) : errorMessage);
      } else if (err instanceof Error) {
        // Fallback: se o apiFetch lançou apenas um Error("422 Unprocessable Entity")
        errorMessage = err.message; 
      }

      setSubmitError(`Falha na validação: ${errorMessage}`);
      throw err; // Repassa o erro para a UI parar o loading se necessário
    } finally {
      setSubmitting(false);
    }
  }, [formValues, formMeta]);

  return { 
    formValues, 
    formMeta, 
    updateField, 
    updateMeta, 
    submit, 
    submitting, 
    submitError 
  };
}
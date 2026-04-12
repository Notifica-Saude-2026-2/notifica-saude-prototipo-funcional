// src/hooks/useNotificacao.ts
import { useState, useCallback } from 'react';
import type { CampoDinamico, NotificacaoPayload, RespostaCampo } from '../types/formulario';
import { criarNotificacao } from '../services/notificacao.service';

// Constantes baseadas nos IDs do seu seed.ts
const CAMPO_NOME_ID = "55555555-5555-4555-b555-000000000006";
const CAMPO_CONTATO_ID = "55555555-5555-4555-b555-000000000007";

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

function buildRespostas(
  campos: CampoDinamico[],
  formValues: Record<string, unknown>
): RespostaCampo[] {
  return campos.reduce<RespostaCampo[]>((acc, campo) => {
    const value = formValues[campo.id];

    if (value === undefined || value === null || String(value).trim() === '') {
      return acc;
    }

    if (campo.tipo === 'SELECT' || campo.tipo === 'RADIO') {
      acc.push({ campo_id: campo.id, valor_opcao_id: String(value) });
      return acc;
    }

    if (campo.tipo === 'MULTISELECT' || campo.tipo === 'CHECKBOX') {
      if (Array.isArray(value) && value.length > 0) {
        acc.push({ campo_id: campo.id, valores_opcoes_ids: value.map(String) });
      }
      return acc;
    }

    acc.push({ campo_id: campo.id, valor: String(value) });
    return acc;
  }, []);
}

export function useNotificacao(): UseNotificacaoReturn {
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [formMeta, setFormMeta] = useState<FormMeta>({ anonima: true });
  
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
      // REGRA DE NEGÓCIO: Inferir anonimato baseado no preenchimento
      const nomePreenchido = Boolean(formValues[CAMPO_NOME_ID]?.toString().trim());
      const contatoPreenchido = Boolean(formValues[CAMPO_CONTATO_ID]?.toString().trim());
      
      // Se preencheu Nome OU Contato, a notificação NÃO é anônima.
      const isAnonima = !(nomePreenchido || contatoPreenchido);

      const payload: NotificacaoPayload = {
        anonima: isAnonima,
        respostas: buildRespostas(campos, formValues),
      };

      console.log("🚀 Payload pronto para envio:", JSON.stringify(payload, null, 2));

      await criarNotificacao(payload);
      
    } catch (err: unknown) {
      console.error("❌ Erro capturado no submit:", err);
      const customErr = err as any;
      const responseData = customErr?.response?.data || customErr?.data || customErr?.body;
      let errorMessage = 'Não foi possível registrar a notificação. Verifique os dados.';

      if (responseData) {
        errorMessage = responseData.message || 
          (responseData.errors ? JSON.stringify(responseData.errors) : errorMessage);
      } else if (err instanceof Error) {
        errorMessage = err.message; 
      }

      setSubmitError(`Falha na validação: ${errorMessage}`);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [formValues]); // formMeta foi removido da dependência pois 'anonima' agora é inferida no submt.

  return { formValues, formMeta, updateField, updateMeta, submit, submitting, submitError };
}
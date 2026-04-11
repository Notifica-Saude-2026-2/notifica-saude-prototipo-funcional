// src/hooks/useNotificacao.ts
import { useState } from 'react';
import type { CampoDinamico, NotificacaoPayload, RespostaCampo } from '../types/formulario';
import { criarNotificacao } from '../services/notificacao.service';

// 1. Removidos os campos estruturais (unidade_id, setor_id, etc.)
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
  return campos.flatMap((campo): RespostaCampo[] => {
    const value = formValues[campo.id];

    if (value === undefined || value === null || value === '') return [];

    if (campo.tipo === 'SELECT' || campo.tipo === 'RADIO') {
      return [{ campo_id: campo.id, valor_opcao_id: value as string }];
    }

    if (campo.tipo === 'MULTISELECT' || campo.tipo === 'CHECKBOX') {
      return (value as string[]).map((opcaoId) => ({
        campo_id: campo.id,
        valor_opcao_id: opcaoId,
      }));
    }

    return [{ campo_id: campo.id, valor: String(value) }];
  });
}

export function useNotificacao(): UseNotificacaoReturn {
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  
  // 2. Estado inicial limpo, mantendo apenas a flag de anonimato
  const [formMeta, setFormMeta] = useState<FormMeta>({
    anonima: true, 
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function updateField(fieldId: string, value: unknown) {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }));
  }

  function updateMeta<K extends keyof FormMeta>(key: K, value: FormMeta[K]) {
    setFormMeta((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(campos: CampoDinamico[]) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      // 3. Montagem do payload estritamente como o backend espera
      const payload = {
        anonima: formMeta.anonima,
        respostas: buildRespostas(campos, formValues),
      } as NotificacaoPayload; // Forçamos o tipo temporariamente caso o types/formulario.ts ainda tenha a tipagem antiga

      // LOG PARA DEBUG: Isso vai printar no console do navegador exatamente o que está saindo
      console.log("🚀 Payload pronto para envio:", JSON.stringify(payload, null, 2));

      await criarNotificacao(payload);
      
    } catch (err: any) {
      console.error("❌ Erro capturado no submit:", err);
      
      // 4. Captura inteligente de erro: tenta ler o erro específico do Zod/Backend via Axios
      const backendError = err?.response?.data;
      let errorMessage = 'Erro ao enviar notificação. Tente novamente.';

      if (backendError) {
        // Se o Zod mandar array de erros, ou o seu service mandar uma 'message'
        errorMessage = backendError.message 
          || (backendError.errors ? JSON.stringify(backendError.errors) : errorMessage);
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setSubmitError(errorMessage);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }

  return { formValues, formMeta, updateField, updateMeta, submit, submitting, submitError };
}
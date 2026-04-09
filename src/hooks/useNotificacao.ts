import { useState } from 'react';
import type { CampoDinamico, NotificacaoPayload, RespostaCampo } from '../types/formulario';
import { criarNotificacao } from '../services/notificacao.service';

export type FormMeta = {
  unidade_id: string;
  setor_id: string;
  data_incidente: string;
  descricao: string;
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
  const [formMeta, setFormMeta] = useState<FormMeta>({
    unidade_id: '',
    setor_id: '',
    data_incidente: '',
    descricao: '',
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
      const payload: NotificacaoPayload = {
        ...formMeta,
        respostas: buildRespostas(campos, formValues),
      };
      await criarNotificacao(payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao enviar notificação';
      setSubmitError(message);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }

  return { formValues, formMeta, updateField, updateMeta, submit, submitting, submitError };
}

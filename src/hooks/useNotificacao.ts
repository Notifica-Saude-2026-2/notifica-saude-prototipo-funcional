// src/hooks/useNotificacao.ts
import { useState, useCallback } from "react";
import type { CampoDinamico, NotificacaoPayload, RespostaCampo } from "../types/formulario";
import { criarNotificacao } from "../services/notificacao.service";
import { ApiError } from "../services/api";

const CAMPO_UNIDADE_ID = "55555555-5555-4555-b555-000000000010";
const CAMPO_SETOR_ID = "55555555-5555-4555-b555-000000000003";
const CAMPO_DATA_ID = "55555555-5555-4555-b555-000000000008";
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
  resetForm: () => void;
  submit: (campos: CampoDinamico[]) => Promise<void>;
  submitting: boolean;
  submitError: string | null;
};

function buildRespostas(
  campos: CampoDinamico[],
  formValues: Record<string, unknown>,
): RespostaCampo[] {
  return campos.reduce<RespostaCampo[]>((acc, campo) => {
    const value = formValues[campo.id];

    if (value === undefined || value === null || String(value).trim() === "") {
      return acc;
    }

    // Campos relacionais (C_INSTITUICAO, C_SETOR): enviam valor_entidade_id
    if (campo.entidade_relacional) {
      const label = campo.opcoes?.find((o) => o.id === String(value))?.valor;
      const outroOption = campo.opcoes?.find((o) => o.valor.toLowerCase() === "outro");
      const isOutro = outroOption != null && value === outroOption.id;
      const outroText = isOutro ? formValues[`${campo.id}_outro`] : undefined;
      acc.push({
        campo_id: campo.id,
        valor_entidade_id: String(value),
        ...(label ? { valor_entidade_label: label } : {}),
        ...(outroText && String(outroText).trim() ? { valor: String(outroText).trim() } : {}),
      });
      return acc;
    }

    if (campo.tipo === "SELECT" || campo.tipo === "RADIO") {
      const outroText = formValues[`${campo.id}_outro`];
      const resposta: RespostaCampo = {
        campo_id: campo.id,
        valor_opcao_id: String(value),
      };
      if (outroText && String(outroText).trim()) {
        resposta.valor = String(outroText).trim();
      }
      acc.push(resposta);
      return acc;
    }

    if (campo.tipo === "MULTISELECT" || campo.tipo === "CHECKBOX") {
      if (Array.isArray(value) && value.length > 0) {
        const outroText = formValues[`${campo.id}_outro`];
        const resposta: RespostaCampo = {
          campo_id: campo.id,
          valores_opcoes_ids: value.map(String),
        };
        if (outroText && String(outroText).trim()) {
          resposta.valor = String(outroText).trim();
        }
        acc.push(resposta);
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

  const submit = useCallback(
    async (campos: CampoDinamico[]) => {
      setSubmitting(true);
      setSubmitError(null);

      try {
        const nomePreenchido = Boolean(formValues[CAMPO_NOME_ID]?.toString().trim());
        const contatoPreenchido = Boolean(formValues[CAMPO_CONTATO_ID]?.toString().trim());

        const isAnonima = !(nomePreenchido || contatoPreenchido);

        // Extrai unidade_id e setor_id do que o usuário selecionou nos campos relacionais
        const unidadeId = formValues[CAMPO_UNIDADE_ID] as string | undefined;
        const setorId = formValues[CAMPO_SETOR_ID] as string | undefined;

        if (!unidadeId || !setorId) {
          throw new Error("Selecione a instituição e o setor antes de enviar.");
        }

        const payload: NotificacaoPayload = {
          anonima: isAnonima,
          unidade_id: unidadeId,
          setor_id: setorId,
          data_incidente: formValues[CAMPO_DATA_ID]
            ? new Date(`${formValues[CAMPO_DATA_ID]}T00:00:00.000Z`).toISOString()
            : new Date().toISOString(),
          respostas: buildRespostas(campos, formValues),
        };

        await criarNotificacao(payload);
      } catch (err: unknown) {
        let errorMessage = "Não foi possível registrar a notificação. Verifique os dados.";

        if (err instanceof ApiError) {
          const body = err.body as Record<string, unknown> | null;
          errorMessage =
            (body?.message as string) || (body?.errors ? JSON.stringify(body.errors) : err.message);
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        setSubmitError(`Falha na validação: ${errorMessage}`);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [formValues],
  );

  const resetForm = useCallback(() => {
    setFormValues({});
    setFormMeta({ anonima: true });
    setSubmitError(null);
  }, []);

  return {
    formValues,
    formMeta,
    updateField,
    updateMeta,
    resetForm,
    submit,
    submitting,
    submitError,
  };
}

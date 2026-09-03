import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  mapToNotificacaoDetalhe,
  updateNotificacao,
  getNotificacaoHistorico,
  getNotificacaoById,
  type UpdateNotificacaoPayload,
} from "../services/notificacaoDetalheService";
import type {
  NotificacaoRaw,
  NotificacaoDetalheDTO,
  ClassificacaoRaw,
} from "../types/notificacaoDetalhe";
import type { MetodologiaAbordagem } from "../types/analise";
import { ApiError } from "../services/api";
import { useEffect } from "react";

type UpdateState = {
  saving: boolean;
  saveError: string | null;
  saveSuccess: boolean;
};

export type HistoricoItem = {
  id: string;
  campo_alterado: string;
  valor_anterior: string | null;
  valor_novo: string | null;
  data_alteracao: string;
  usuario: { nome: string } | null;
};

type UseNotificacaoDetalheResult = {
  detalhe: NotificacaoDetalheDTO | null;
  rawData: NotificacaoRaw | null;
  hasData: boolean;
  loading: boolean;
  update: UpdateState;
  historico: { data: HistoricoItem[]; loading: boolean; error: string | null };
  salvar: (payload: UpdateNotificacaoPayload) => Promise<boolean>;
  onClassificacaoSuccess: (
    classificacao: ClassificacaoRaw,
    metodologia?: MetodologiaAbordagem,
  ) => void;
  onArquivarSuccess: () => void;
  onEncaminharSuccess: () => void;
  onDecisaoPosAnaliseSuccess: () => void;
  onMetodologiaEscolhida: (metodologia: MetodologiaAbordagem) => void;
  onPlanoAcaoRegistrado: (raw: NotificacaoRaw) => void;
  onPlanoAcaoAtualizado: (raw: NotificacaoRaw) => void;
};

export function useNotificacaoDetalhe(): UseNotificacaoDetalheResult {
  const { id: routeId } = useParams<{ id: string }>();
  const [rawData, setRawData] = useState<NotificacaoRaw | null>(null);
  const [loading, setLoading] = useState<boolean>(!!routeId);

  const [update, setUpdate] = useState<UpdateState>({
    saving: false,
    saveError: null,
    saveSuccess: false,
  });

  const [historico, setHistorico] = useState<{
    data: HistoricoItem[];
    loading: boolean;
    error: string | null;
  }>({
    data: [],
    loading: true,
    error: null,
  });

  const detalhe = rawData ? mapToNotificacaoDetalhe(rawData) : null;

  useEffect(() => {
    if (!routeId) return;
    let cancelled = false;
    setLoading(true);
    setRawData(null);
    getNotificacaoById(routeId)
      .then((data) => {
        if (!cancelled) {
          setRawData(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [routeId]);

  useEffect(() => {
    if (rawData?.id) {
      getNotificacaoHistorico(rawData.id)
        .then((data) => setHistorico({ data, loading: false, error: null }))
        .catch(() =>
          setHistorico({ data: [], loading: false, error: "Erro ao carregar histórico." }),
        );
    }
  }, [rawData?.id]);

  async function salvar(payload: UpdateNotificacaoPayload): Promise<boolean> {
    if (!detalhe) return false;

    setUpdate({ saving: true, saveError: null, saveSuccess: false });

    try {
      const updatedRaw = await updateNotificacao(detalhe.id, payload);
      setRawData(updatedRaw);
      setUpdate({ saving: false, saveError: null, saveSuccess: true });

      getNotificacaoHistorico(detalhe.id).then((data) => setHistorico((h) => ({ ...h, data })));

      return true;
    } catch (err) {
      let message = "Erro ao salvar alterações.";

      if (err instanceof ApiError) {
        if (err.status === 404 || err.status === 405) {
          message = "Esta funcionalidade ainda não está disponível no servidor.";
        } else if (err.status === 403) {
          message = "Você não tem permissão para editar esta notificação.";
        } else {
          message = `Erro ${err.status}: verifique os dados e tente novamente.`;
        }
      }

      setUpdate({ saving: false, saveError: message, saveSuccess: false });
      return false;
    }
  }

  function onClassificacaoSuccess(
    classificacao: ClassificacaoRaw,
    metodologia?: MetodologiaAbordagem,
  ) {
    if (!rawData) return;
    const updated: NotificacaoRaw = {
      ...rawData,
      status: classificacao.rascunho ? rawData.status : "CLASSIFICADA",
      classificacao,
      ...(metodologia ? { metodologia_analise: metodologia } : {}),
    };
    setRawData(updated);
    getNotificacaoHistorico(rawData.id).then((data) => setHistorico((h) => ({ ...h, data })));
  }

  function onArquivarSuccess() {
    if (!rawData) return;
    setRawData({ ...rawData, status: "ARQUIVADA" });
    getNotificacaoHistorico(rawData.id).then((data) => setHistorico((h) => ({ ...h, data })));
  }

  function onEncaminharSuccess() {
    if (!rawData) return;
    setRawData({ ...rawData, status: "ENCAMINHADA_SETOR" });
    getNotificacaoHistorico(rawData.id).then((data) => setHistorico((h) => ({ ...h, data })));
  }

  function onDecisaoPosAnaliseSuccess() {
    if (!rawData) return;
    setRawData({ ...rawData, status: "ANALISADA" });
    getNotificacaoHistorico(rawData.id).then((data) => setHistorico((h) => ({ ...h, data })));
  }

  function onMetodologiaEscolhida(metodologia: MetodologiaAbordagem) {
    if (!rawData) return;
    setRawData({ ...rawData, metodologia_analise: metodologia });
  }

  function onPlanoAcaoRegistrado(raw: NotificacaoRaw) {
    setRawData(raw);
    getNotificacaoHistorico(raw.id).then((data) => setHistorico((h) => ({ ...h, data })));
  }

  function onPlanoAcaoAtualizado(raw: NotificacaoRaw) {
    setRawData(raw);
  }

  return {
    detalhe,
    rawData,
    hasData: rawData !== null,
    loading,
    update,
    historico,
    salvar,
    onClassificacaoSuccess,
    onArquivarSuccess,
    onEncaminharSuccess,
    onDecisaoPosAnaliseSuccess,
    onMetodologiaEscolhida,
    onPlanoAcaoRegistrado,
    onPlanoAcaoAtualizado,
  };
}

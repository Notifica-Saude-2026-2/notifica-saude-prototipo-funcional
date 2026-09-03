import { useEffect, useState } from "react";
import type { NotificacaoDetalheDTO } from "../../../../types/notificacaoDetalhe";
import { ANALISE_FLOW_LABEL } from "../../../../types/analise";
import styles from "../NotificacaoDetalhe.module.css";

type HistoricoItem = {
  data_alteracao: string;
  usuario: { nome: string } | null;
  campo_alterado: string;
  valor_anterior: string | null;
  valor_novo: string | null;
};

type Props = {
  detalhe: NotificacaoDetalheDTO;
  historico: {
    data: HistoricoItem[];
    loading: boolean;
  };
  isOpen: boolean;
  onToggle: () => void;
};

const HISTORICO_PAGE_SIZE = 10;

type HistoricoGrupo = {
  key: string;
  data_alteracao: string;
  usuario: { nome: string } | null;
  campos: string[];
  val_anterior: string | null;
  isCreation?: boolean;
  formattedDate?: string;
};

export function HistoricoSection({ detalhe, historico, isOpen, onToggle }: Props) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [historico.data]);

  /** Troca o id técnico do fluxo (ex.: "londres_completo") pelo nome de verdade (ex.: "Protocolo
      de Londres — Investigação completa") — aplicado na exibição, então corrige também entradas
      de histórico já salvas antes desse mapeamento existir, sem precisar migrar dado nenhum. */
  const traduzirIdsTecnicos = (texto: string) =>
    Object.entries(ANALISE_FLOW_LABEL).reduce(
      (acc, [flowId, label]) => acc.replace(new RegExp(`\\b${flowId}\\b`, "g"), label),
      texto,
    );

  /** Deixa a 1ª letra maiúscula e garante o ponto final — sem mexer no resto do texto. */
  const formatAcao = (texto: string) => {
    const semPrefixo = traduzirIdsTecnicos(texto.replace("resposta_campo:", ""));
    const comMaiuscula = semPrefixo.charAt(0).toUpperCase() + semPrefixo.slice(1);
    return comMaiuscula.endsWith(".") ? comMaiuscula : `${comMaiuscula}.`;
  };

  function agruparHistorico(items: HistoricoItem[]): HistoricoGrupo[] {
    const map = new Map<string, HistoricoGrupo>();
    for (const h of items) {
      const key = `${h.data_alteracao}|${h.usuario?.nome ?? "Sistema"}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          data_alteracao: h.data_alteracao,
          usuario: h.usuario,
          campos: [],
          val_anterior: h.valor_anterior,
        });
      }
      map.get(key)!.campos.push(h.campo_alterado);
    }
    return Array.from(map.values());
  }

  // O histórico é gravado com o mais recente primeiro (ver addHistorico em localStore.ts);
  // aqui invertemos para exibir do mais antigo para o mais novo.
  const gruposFromApi = agruparHistorico(historico.data).sort(
    (a, b) => new Date(a.data_alteracao).getTime() - new Date(b.data_alteracao).getTime(),
  );
  const criacaoGrupo: HistoricoGrupo = {
    key: "criacao",
    data_alteracao: "",
    formattedDate: detalhe.dataCadastroCompleto,
    usuario: { nome: "Notificante" },
    campos: [],
    val_anterior: null,
    isCreation: true,
  };
  const grupos = [criacaoGrupo, ...gruposFromApi];

  const totalPages = Math.ceil(grupos.length / HISTORICO_PAGE_SIZE);
  const gruposPage = grupos.slice((page - 1) * HISTORICO_PAGE_SIZE, page * HISTORICO_PAGE_SIZE);

  return (
    <div className={styles.section}>
      <div
        className={styles.sectionHeader}
        onClick={onToggle}
        data-testid="section-historico-toggle"
      >
        Histórico de modificações
        <div className={`${styles.collapseIcon} ${isOpen ? styles.open : styles.closed}`} />
      </div>

      {isOpen && (
        <div className={styles.sectionContent}>
          {historico.loading ? (
            <span className={styles.metaText}>Carregando histórico...</span>
          ) : (
            <div className={styles.historyList}>
              {gruposPage.map((g) => {
                if (g.isCreation) {
                  return (
                    <div key={g.key} className={styles.historyItem}>
                      <span className={styles.historyTime}>{g.formattedDate}</span>
                      <span className={styles.authorBadge}>{g.usuario?.nome}</span>
                      <span className={styles.historyAction}>criou a notificação.</span>
                    </div>
                  );
                }

                const dateObj = new Date(g.data_alteracao);
                const fullDateTime = `${dateObj.toLocaleDateString("pt-BR")} - ${dateObj.toLocaleTimeString("pt-BR")}`;
                const acao = formatAcao(g.campos.join("; "));
                return (
                  <div key={g.key} className={styles.historyItem}>
                    <span className={styles.historyTime}>{fullDateTime}</span>
                    <span className={styles.authorBadge}>{g.usuario?.nome || "Sistema"}</span>
                    <span className={styles.historyAction}>{acao}</span>
                  </div>
                );
              })}

              {totalPages > 1 && (
                <div className={styles.historyPagination}>
                  <button
                    className={styles.histPageBtn}
                    data-testid="btn-historico-anterior"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    ‹ Anterior
                  </button>
                  <span className={styles.histPageInfo}>
                    {page} / {totalPages}
                  </span>
                  <button
                    className={styles.histPageBtn}
                    data-testid="btn-historico-proxima"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Próxima ›
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

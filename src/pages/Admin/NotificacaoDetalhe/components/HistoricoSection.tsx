import { useEffect, useState } from "react";
import type { NotificacaoDetalheDTO } from "../../../../types/notificacaoDetalhe";
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

const HISTORICO_PAGE_SIZE = 5;

type HistoricoGrupo = {
  key: string;
  data_alteracao: string;
  usuario: { nome: string } | null;
  campos: string[];
  val_anterior: string | null;
};

export function HistoricoSection({ detalhe, historico, isOpen, onToggle }: Props) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [historico.data]);

  const formatFieldName = (name: string) => {
    const cleanName = name.replace("resposta_campo:", "");
    const mapping: Record<string, string> = {
      setor_id: "Setor",
      unidade_id: "Instituição",
      data_incidente: "Data do Incidente",
      observacoes: "Observações",
      "Em qual Turno ocorreu o incidente?": "Turno",
      "Sexo:": "Sexo",
      "Idade:": "Idade",
    };
    return mapping[cleanName] || cleanName;
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

  const grupos = agruparHistorico(historico.data);
  const totalPages = Math.ceil(grupos.length / HISTORICO_PAGE_SIZE);
  const gruposPage = grupos.slice((page - 1) * HISTORICO_PAGE_SIZE, page * HISTORICO_PAGE_SIZE);

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={onToggle}>
        Histórico de modificações
        <div className={`${styles.collapseIcon} ${isOpen ? styles.open : styles.closed}`} />
      </div>

      {isOpen && (
        <div className={styles.sectionContent}>
          {historico.loading ? (
            <span className={styles.metaText}>Carregando histórico...</span>
          ) : (
            <div className={styles.historyList}>
              {/* Item fixo de criação */}
              <div className={styles.historyItem}>
                <span className={styles.historyTime}>{detalhe.dataCadastro}</span>
                <span className={styles.authorBadge}>Notificante</span>
                <span className={styles.historyAction}>criou a notificação.</span>
              </div>

              {gruposPage.map((g) => {
                const dateObj = new Date(g.data_alteracao);
                const fullDateTime = `${dateObj.toLocaleDateString("pt-BR")} - ${dateObj.toLocaleTimeString("pt-BR")}`;
                const camposLabel = g.campos.map(formatFieldName).join(", ");
                const acao =
                  g.val_anterior === null ? `criou ${camposLabel}.` : `alterou ${camposLabel}.`;
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

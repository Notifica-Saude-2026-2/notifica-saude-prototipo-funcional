import Tooltip from "@mui/material/Tooltip";
import { EditIcon } from "../../../../assets/icons/EditIcon";
import { LockClosedIcon } from "../../../../assets/icons/LockClosedIcon";
import { useAuth } from "../../../../hooks/useAuth";
import type { NotificacaoDetalheDTO } from "../../../../types/notificacaoDetalhe";
import styles from "../NotificacaoDetalhe.module.css";
import { STATUS_EDITAVEIS, motivoEdicaoBloqueada } from "../../../../constants/notificacaoStatus";
const PERFIS_CLASSIFICADORES = new Set(["NSP", "ADMINISTRADOR"]);

type Props = {
  detalhe: NotificacaoDetalheDTO;
  isOpen: boolean;
  onToggle: () => void;
  onClassificar: () => void;
};

export function ClassificacaoSection({ detalhe, isOpen, onToggle, onClassificar }: Props) {
  const { usuario } = useAuth();
  const temPermissao = PERFIS_CLASSIFICADORES.has(usuario?.perfil ?? "");
  const podeEditar = temPermissao && STATUS_EDITAVEIS.has(detalhe.statusRaw);
  const foiEncaminhada = !STATUS_EDITAVEIS.has(detalhe.statusRaw) && !!detalhe.classificacao;

  return (
    <div className={styles.section}>
      <div
        className={styles.sectionHeader}
        onClick={onToggle}
        data-testid="section-classificacao-toggle"
      >
        Classificação
        <div className={`${styles.collapseIcon} ${isOpen ? styles.open : styles.closed}`} />
      </div>

      {isOpen && (
        <div className={styles.sectionContent}>
          {!detalhe.classificacao ? (
            <>
              <span className={styles.sectionValue}>
                Esse incidente ainda está pendente de classificação.
              </span>
              {podeEditar && (
                <button
                  className={styles.primaryButton}
                  data-testid="btn-classificar-incidente"
                  onClick={onClassificar}
                >
                  <EditIcon width={15} stroke="ffffff" /> Classificar incidente
                </button>
              )}
            </>
          ) : (
            <>
              <div className={styles.metaRow}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}
                >
                  <span className={styles.metaText}>
                    Última classificação em: {detalhe.classificacao.dataClassificacao}
                  </span>
                  {detalhe.classificacao.rascunho && (
                    <span className={styles.rascunhoBadge}>Classificação em andamento</span>
                  )}
                  {!detalhe.classificacao.rascunho && detalhe.classificacao.dataValidade && (
                    <span className={styles.prazoBadge}>
                      Prazo para análise: {detalhe.classificacao.dataValidade}
                    </span>
                  )}
                </div>
                {podeEditar && (
                  <button
                    className={styles.editButton}
                    data-testid="btn-edit-classificacao"
                    onClick={onClassificar}
                  >
                    <EditIcon width={15} stroke="484848" /> Editar
                  </button>
                )}
                {foiEncaminhada && (
                  <Tooltip title={motivoEdicaoBloqueada(detalhe.statusRaw)} placement="left">
                    <span className={styles.bloqueadoBadge}>
                      <LockClosedIcon width={11} fill="c8850a" /> Edição bloqueada
                    </span>
                  </Tooltip>
                )}
              </div>

              <div className={styles.classificationGrid}>
                <div className={styles.infoItem}>
                  <div className={styles.fieldHeader}>Classificação</div>
                  <div className={styles.fieldValue}>
                    {detalhe.classificacao.tipoIncidente || "---"}
                  </div>
                </div>

                {detalhe.classificacao.grauDano && (
                  <div className={styles.infoItem}>
                    <div className={styles.fieldHeader}>Grau do dano</div>
                    <div className={styles.fieldValue}>{detalhe.classificacao.grauDano}</div>
                  </div>
                )}

                {detalhe.classificacao.tipoEspecifico && (
                  <div className={styles.infoItem}>
                    <div className={styles.fieldHeader}>Tipo específico (Never Event)</div>
                    <div className={styles.fieldValue}>{detalhe.classificacao.tipoEspecifico}</div>
                  </div>
                )}

                {!detalhe.classificacao.tipoEspecifico && (
                  <div className={styles.infoItem}>
                    <div className={styles.fieldHeader}>Tipo de incidente</div>
                    <div className={styles.fieldValue}>
                      {detalhe.classificacao.tiposIncidentes.length > 0
                        ? detalhe.classificacao.tiposIncidentes.join(", ")
                        : "---"}
                    </div>
                  </div>
                )}

                <div className={styles.infoItem}>
                  <div className={styles.fieldHeader}>Envolve</div>
                  <div className={styles.fieldValue}>
                    {detalhe.classificacao.envolvidos.length > 0
                      ? detalhe.classificacao.envolvidos.join(", ")
                      : "---"}
                  </div>
                </div>

                {detalhe.classificacao.observacoes && (
                  <div className={styles.infoItem}>
                    <div className={styles.fieldHeader}>Observações do NSP</div>
                    <div className={styles.fieldValue}>{detalhe.classificacao.observacoes}</div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

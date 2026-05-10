import { EditIcon } from "../../../../components/common/icons/EditIcon";
import type { NotificacaoDetalheDTO } from "../../../../types/notificacaoDetalhe";
import styles from "../NotificacaoDetalhe.module.css";

type Props = {
  detalhe: NotificacaoDetalheDTO;
  isOpen: boolean;
  onToggle: () => void;
  onClassificar: () => void;
};

export function ClassificacaoSection({ detalhe, isOpen, onToggle, onClassificar }: Props) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={onToggle}>
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
              <button className={styles.primaryButton} onClick={onClassificar}>
                <EditIcon width={15} stroke="ffffff" /> Classificar incidente
              </button>
            </>
          ) : (
            <>
              <div className={styles.metaRow}>
                <span className={styles.metaText}>
                  Última classificação em: {detalhe.classificacao.dataClassificacao}
                </span>
                {detalhe.classificacao.rascunho && (
                  <span className={styles.rascunhoBadge}>Classificação em andamento</span>
                )}
                {detalhe.classificacao.rascunho && (
                  <button className={styles.editButton} onClick={onClassificar}>
                    <EditIcon width={15} stroke="484848" /> Continuar classificação
                  </button>
                )}
              </div>

              <div className={styles.classificationGrid}>
                <div className={styles.infoItem}>
                  <div className={styles.fieldHeader}>Tipo</div>
                  <div className={styles.fieldValue}>
                    {detalhe.classificacao.tipoIncidente ?? (
                      <span className={styles.emptyValue}>—</span>
                    )}
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.fieldHeader}>Tipo específico</div>
                  <div className={styles.fieldValue}>
                    {detalhe.classificacao.tipoEspecifico ?? (
                      <span className={styles.emptyValue}>—</span>
                    )}
                  </div>
                </div>

                <div className={`${styles.infoItem} ${styles.infoItemFull}`}>
                  <div className={styles.fieldHeader}>Envolvidos</div>
                  <div className={styles.fieldValue}>
                    {detalhe.classificacao.envolvidos.length > 0
                      ? detalhe.classificacao.envolvidos.join(", ")
                      : "—"}
                  </div>
                </div>

                {detalhe.classificacao.grauDano && (
                  <div className={styles.infoItem}>
                    <div className={styles.fieldHeader}>Grau do dano</div>
                    <div className={styles.fieldValue}>{detalhe.classificacao.grauDano}</div>
                  </div>
                )}

                {detalhe.classificacao.observacoes && (
                  <div className={`${styles.infoItem} ${styles.infoItemFull}`}>
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

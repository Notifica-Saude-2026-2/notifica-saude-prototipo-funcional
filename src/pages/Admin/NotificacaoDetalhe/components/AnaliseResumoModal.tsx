import { useState } from "react";
import { ANALISE_FLOWS } from "../../../../constants/analiseSchema";
import { AnaliseSectionForm } from "../../../../components/analise/AnaliseSectionForm";
import { METODOLOGIA_LABEL } from "../../../../types/analise";
import type { AnaliseRaw } from "../../../../types/analise";
import type { NotificacaoDetalheDTO } from "../../../../types/notificacaoDetalhe";
import { ModalBase } from "./ModalBase";
import { getGrauDanoColorByLabel } from "../../../../utils/statusColors";
import analiseStyles from "../../../../components/analise/Analise.module.css";
import styles from "../NotificacaoDetalhe.module.css";

type Props = {
  analise: AnaliseRaw;
  detalhe: NotificacaoDetalheDTO;
  onClose: () => void;
};

/** onFieldChange é obrigatório em AnaliseSectionForm, mas não é usado em modo readOnly. */
function noop() {}

function ResumoNotificacao({ detalhe }: { detalhe: NotificacaoDetalheDTO }) {
  const grauDanoColor = getGrauDanoColorByLabel(detalhe.classificacao?.grauDano);
  return (
    <div>
      <p style={{ margin: "0 0 6px" }}>
        <strong>Notificação #{detalhe.codigo}</strong> — {detalhe.unidade} · {detalhe.setor}
      </p>
      <p style={{ margin: "0 0 6px" }}>{detalhe.descricao}</p>
      {detalhe.classificacao && (
        <p style={{ margin: 0 }}>
          Classificação: {detalhe.classificacao.tipoIncidente ?? "—"}
          {detalhe.classificacao.grauDano && (
            <>
              {" · Grau do dano: "}
              <span
                style={{
                  fontWeight: 700,
                  color: grauDanoColor?.text,
                  background: grauDanoColor?.bg,
                  padding: grauDanoColor ? "1px 8px" : undefined,
                  borderRadius: grauDanoColor ? 4 : undefined,
                }}
              >
                {detalhe.classificacao.grauDano}
              </span>
            </>
          )}
          {detalhe.classificacao.tiposIncidentes.length > 0
            ? ` · Tipo: ${detalhe.classificacao.tiposIncidentes.join(", ")}`
            : ""}
        </p>
      )}
    </div>
  );
}

/**
 * Visualização somente-leitura de uma análise já registrada (ACR / Protocolo de Londres), com
 * cada seção do formulário original disponível como um submenu colapsável — mesmo motor de
 * renderização usado no preenchimento (AnaliseSectionForm), então o layout dos campos é idêntico.
 */
export function AnaliseResumoModal({ analise, detalhe, onClose }: Props) {
  const flow = ANALISE_FLOWS[analise.flowAtivo];
  const [openSectionId, setOpenSectionId] = useState<string | null>(flow?.sections[0]?.id ?? null);

  return (
    <ModalBase onClose={onClose} ariaLabel="Análise completa" modalStyle={{ maxWidth: 880 }}>
      <>
        <div className={styles.modalHeader}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <h2 className={styles.modalTitle}>Análise completa</h2>
            <span className={styles.metaText}>
              Metodologia: {METODOLOGIA_LABEL[analise.metodologia]}
            </span>
          </div>
        </div>

        <div className={styles.modalBody}>
          {!flow ? (
            <p className={styles.modalError}>
              Não foi possível carregar o formulário desta análise.
            </p>
          ) : (
            flow.sections.map((section) => {
              const isOpen = openSectionId === section.id;
              return (
                <div className={styles.section} key={section.id}>
                  <div
                    className={styles.sectionHeader}
                    onClick={() => setOpenSectionId(isOpen ? null : section.id)}
                    data-testid={`resumo-analise-secao-${section.id}-toggle`}
                  >
                    {section.title}
                    <div
                      className={`${styles.collapseIcon} ${isOpen ? styles.open : styles.closed}`}
                    />
                  </div>
                  {isOpen && (
                    <div className={styles.sectionContent}>
                      <AnaliseSectionForm
                        section={section}
                        values={analise.valores}
                        onFieldChange={noop}
                        resumoNotificacao={<ResumoNotificacao detalhe={detalhe} />}
                        readOnly
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {analise.recomendacoes.length > 0 && (
            <div className={analiseStyles.infoBox}>
              <strong>Recomendações geradas</strong>
              <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
                {analise.recomendacoes.map((r, i) => (
                  <li key={i}>{r.texto}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button
            className={styles.cancelBtn}
            onClick={onClose}
            data-testid="resumo-analise-btn-fechar"
          >
            Fechar
          </button>
        </div>
      </>
    </ModalBase>
  );
}

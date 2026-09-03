import { useNavigate } from "react-router-dom";
import { PaperAirplaneIcon } from "../../../../assets/icons/PaperAirplaneIcon";
import { useAuth } from "../../../../hooks/useAuth";
import type { NotificacaoDetalheDTO } from "../../../../types/notificacaoDetalhe";
import { METODOLOGIA_LABEL } from "../../../../types/analise";
import styles from "../NotificacaoDetalhe.module.css";

type Props = {
  detalhe: NotificacaoDetalheDTO;
  isOpen: boolean;
  onToggle: () => void;
  /** Encaminha a notificação para o setor analisar (antes de qualquer análise — muda o status). */
  onEncaminhar: () => void;
  /** Núcleo já concluiu a própria análise e quer apenas avisar o setor (não muda quem analisa). */
  onEncaminharPosAnalise: () => void;
  /** Núcleo já concluiu a própria análise e decide não encaminhar — precisa justificar. */
  onJustificarNaoEncaminhar: () => void;
  /** Notificação classificada mas sem metodologia de investigação definida ainda. */
  onEscolherMetodologia: () => void;
  /** Abre a visualização completa (somente leitura) da análise já registrada. */
  onVerAnalise: () => void;
};

export function AnaliseSection({
  detalhe,
  isOpen,
  onToggle,
  onEncaminhar,
  onEncaminharPosAnalise,
  onJustificarNaoEncaminhar,
  onEscolherMetodologia,
  onVerAnalise,
}: Props) {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const podeGerenciar = usuario?.perfil === "NSP" || usuario?.perfil === "ADMINISTRADOR";

  // Logo após a Classificação (com metodologia já escolhida), o núcleo decide entre analisar
  // diretamente ou encaminhar o caso para o setor analisar primeiro.
  const podeEscolherCaminho = podeGerenciar && detalhe.statusRaw === "CLASSIFICADA";
  // Setor (ou núcleo) registrando a análise depois de um encaminhamento prévio.
  const podeAnalisarEncaminhada = podeGerenciar && detalhe.statusRaw === "ENCAMINHADA_SETOR";
  // Retomar/continuar um rascunho de análise já iniciado.
  const podeContinuarAnalise = podeGerenciar && detalhe.statusRaw === "EM_ANALISE";

  const temRascunhoAnalise = !!detalhe.analise && !detalhe.analise.concluida;
  const analiseConcluida =
    detalhe.statusRaw === "ANALISADA" ||
    detalhe.statusRaw === "EM_ACAO" ||
    detalhe.statusRaw === "ARQUIVADA";

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={onToggle} data-testid="section-analise-toggle">
        Análise
        <div className={`${styles.collapseIcon} ${isOpen ? styles.open : styles.closed}`} />
      </div>

      {isOpen && (
        <div className={styles.sectionContent}>
          {detalhe.metodologiaAnalise && (
            <div className={styles.metaRow}>
              <span className={styles.metaText}>
                Metodologia de investigação: {METODOLOGIA_LABEL[detalhe.metodologiaAnalise]}
              </span>
            </div>
          )}

          {/* ── Sem classificação: nada a fazer ainda ── */}
          {detalhe.statusRaw === "NOVA" && (
            <span className={styles.sectionValue}>
              Não é possível registrar análises em um incidente sem classificação.
            </span>
          )}

          {/* ── Classificado: bifurcação — analisar direto ou encaminhar pro setor ── */}
          {detalhe.statusRaw === "CLASSIFICADA" && (
            <>
              {detalhe.metodologiaAnalise ? (
                <>
                  {podeEscolherCaminho && (
                    <div className={styles.metaRow} style={{ gap: 10 }}>
                      <button
                        className={styles.primaryButton}
                        onClick={() => navigate(`/incident/${detalhe.id}/analise`)}
                        data-testid="btn-registrar-analise"
                      >
                        <PaperAirplaneIcon width={15} stroke="ffffff" /> Registrar análise
                      </button>
                      <button
                        className={styles.editButton}
                        onClick={onEncaminhar}
                        data-testid="btn-encaminhar-notificacao"
                      >
                        Encaminhar para o setor analisar
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <span className={styles.sectionValue}>
                    Classificação concluída. Escolha a metodologia de investigação para liberar a
                    análise.
                  </span>
                  {podeEscolherCaminho && (
                    <button
                      className={styles.primaryButton}
                      onClick={onEscolherMetodologia}
                      data-testid="btn-escolher-metodologia"
                    >
                      Escolher metodologia de investigação
                    </button>
                  )}
                </>
              )}
            </>
          )}

          {/* ── Encaminhado ao setor: aguardando o setor registrar a análise ── */}
          {detalhe.statusRaw === "ENCAMINHADA_SETOR" && (
            <>
              <span className={styles.sectionValue}>
                Esse incidente foi encaminhado ao setor{detalhe.setor ? ` (${detalhe.setor})` : ""}{" "}
                e está aguardando o registro da análise.
              </span>
              {podeAnalisarEncaminhada && (
                <button
                  className={styles.primaryButton}
                  onClick={() => navigate(`/incident/${detalhe.id}/analise`)}
                  data-testid="btn-iniciar-analise"
                >
                  <PaperAirplaneIcon width={15} stroke="ffffff" /> Registrar análise
                </button>
              )}
            </>
          )}

          {/* ── Em análise: rascunho em andamento, ou análise concluída aguardando decisão de encaminhar ── */}
          {detalhe.statusRaw === "EM_ANALISE" && (
            <>
              {detalhe.aguardandoDecisaoEncaminhamento ? (
                <>
                  <span className={styles.sectionValue}>
                    Análise concluída pelo núcleo. Deseja encaminhar o resultado ao setor?
                  </span>
                  {podeGerenciar && (
                    <div className={styles.metaRow} style={{ gap: 10 }}>
                      <button
                        className={styles.primaryButton}
                        onClick={onEncaminharPosAnalise}
                        data-testid="btn-encaminhar-pos-analise"
                      >
                        <PaperAirplaneIcon width={15} stroke="ffffff" /> Encaminhar ao setor
                      </button>
                      <button
                        className={styles.editButton}
                        onClick={onJustificarNaoEncaminhar}
                        data-testid="btn-nao-encaminhar"
                      >
                        Não encaminhar / justificar
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <span className={styles.sectionValue}>
                    {temRascunhoAnalise
                      ? "Há uma análise em andamento para este incidente."
                      : "Esse incidente está em análise."}
                  </span>
                  {podeContinuarAnalise && (
                    <button
                      className={styles.primaryButton}
                      onClick={() => navigate(`/incident/${detalhe.id}/analise`)}
                      data-testid="btn-continuar-analise"
                    >
                      <PaperAirplaneIcon width={15} stroke="ffffff" />{" "}
                      {temRascunhoAnalise ? "Continuar análise" : "Registrar análise"}
                    </button>
                  )}
                </>
              )}
            </>
          )}

          {/* ── Analisado / Em ação / Arquivado: análise concluída (somente leitura) ── */}
          {analiseConcluida && (
            <>
              <span className={styles.sectionValue}>A análise deste incidente foi concluída.</span>
              {detalhe.analise && detalhe.analise.recomendacoes.length > 0 && (
                <span className={styles.metaText}>
                  {detalhe.analise.recomendacoes.length} recomendação(ões) geradas — ver Plano de
                  ação abaixo.
                </span>
              )}
              {detalhe.analise && (
                <button
                  className={styles.editButton}
                  style={{ marginTop: 4, alignSelf: "flex-start" }}
                  onClick={onVerAnalise}
                  data-testid="btn-ver-analise-completa"
                >
                  Ver análise completa
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

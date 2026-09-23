import { useNavigate } from "react-router-dom";
import { SectionInfoBox } from "../../../../components/analise/SectionInfoBox";
import { useState } from "react";
import { PaperAirplaneIcon } from "../../../../assets/icons/PaperAirplaneIcon";
import { useAuth } from "../../../../hooks/useAuth";
import type { NotificacaoDetalheDTO } from "../../../../types/notificacaoDetalhe";
import type { AnaliseRaw } from "../../../../types/analise";
import { ANALISE_FLOWS } from "../../../../constants/analiseSchema";
import { AnaliseSectionForm } from "../../../../components/analise/AnaliseSectionForm";
import styles from "../NotificacaoDetalhe.module.css";
import analiseStyles from "../../../../components/analise/Analise.module.css";

/** onFieldChange é obrigatório em AnaliseSectionForm, mas não é usado em modo readOnly. */
function noop() {}

/**
 * Resumo somente-leitura da análise já registrada, direto dentro da seção "Análise" (sem modal):
 * cada seção do formulário original vira um submenu colapsável, mesmo motor de renderização usado
 * no preenchimento (AnaliseSectionForm), então o layout dos campos é idêntico.
 */
function AnaliseResumoInline({ analise }: { analise: AnaliseRaw }) {
  const flow = ANALISE_FLOWS[analise.flowAtivo];
  const [openSectionId, setOpenSectionId] = useState<string | null>(flow?.sections[0]?.id ?? null);

  if (!flow) return null;

  return (
    <div style={{ marginTop: 8 }}>
      {flow.sections.map((section) => {
        const isOpen = openSectionId === section.id;
        return (
          <div className={styles.section} key={section.id}>
            <div
              className={styles.sectionHeader}
              onClick={() => setOpenSectionId(isOpen ? null : section.id)}
              data-testid={`analise-resumo-secao-${section.id}-toggle`}
            >
              {section.title}
              <div className={`${styles.collapseIcon} ${isOpen ? styles.open : styles.closed}`} />
            </div>
            {isOpen && (
              <div className={styles.sectionContent}>
                <AnaliseSectionForm
                  section={section}
                  values={analise.valores}
                  onFieldChange={noop}
                  readOnly
                  allSections={flow.sections}
                />
              </div>
            )}
          </div>
        );
      })}

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
  );
}

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
};

export function AnaliseSection({
  detalhe,
  isOpen,
  onToggle,
  onEncaminhar,
  onEncaminharPosAnalise,
  onJustificarNaoEncaminhar,
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
    detalhe.statusRaw === "CONCLUIDA" ||
    detalhe.statusRaw === "ARQUIVADA";

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={onToggle} data-testid="section-analise-toggle">
        Análise
        <div className={`${styles.collapseIcon} ${isOpen ? styles.open : styles.closed}`} />
      </div>

      {isOpen && (
        <div className={styles.sectionContent}>
          {/* ── Sem classificação: nada a fazer ainda ── */}
          {detalhe.statusRaw === "NOVA" && (
            <span className={styles.sectionValue}>
              Não é possível registrar análises em um incidente sem classificação.
            </span>
          )}

          {/* ── Classificado: bifurcação — analisar direto ou encaminhar pro setor ── */}
          {detalhe.statusRaw === "CLASSIFICADA" && podeEscolherCaminho && (
            <>
              <span className={styles.sectionValue}>Analisar agora ou encaminhar ao setor?</span>
              <SectionInfoBox>
                Ao <strong>registrar a análise</strong>, ela é feita pelo próprio núcleo (NSP). Ao{" "}
                <strong>encaminhar</strong>, o profissional do setor passa a ter acesso ao incidente
                e fica responsável por registrar a análise — sem o encaminhamento, o setor não
                consegue registrá-la.
              </SectionInfoBox>
              <div className={styles.buttonRow}>
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
                  <SectionInfoBox>
                    As informações desta análise só poderão ser acessadas pelo setor conforme esta
                    decisão. Ao <strong>encaminhar</strong>, o setor responsável recebe o resultado
                    da análise e passa a ter acesso a este incidente. Se você{" "}
                    <strong>não encaminhar</strong>, o setor <strong>não terá acesso</strong> a este
                    incidente nem às informações da análise — eles ficam restritos ao núcleo, e é
                    preciso registrar uma justificativa.
                  </SectionInfoBox>
                  {podeGerenciar && (
                    <div className={styles.buttonRow}>
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
              {detalhe.analise && <AnaliseResumoInline analise={detalhe.analise} />}
            </>
          )}
        </div>
      )}
    </div>
  );
}

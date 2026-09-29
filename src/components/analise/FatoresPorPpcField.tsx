import { useEffect, useState } from "react";
import { FiChevronDown, FiPlus } from "react-icons/fi";
import type { AnaliseField, AnaliseValues } from "../../types/analise";
import { PPC_COLUMNS } from "../../constants/analiseSchema";
import { Button } from "../common/ui/Button";
import stepStyles from "../form/StepForm/StepForm.module.css";
import type { ChecklistState } from "./ChecklistWithDetailField";
import { FatoresChecklist } from "./FatoresChecklist";
import { selectorItemKey } from "./ItemSelectorField";
import type { TableRow } from "./TableField";
import styles from "./Analise.module.css";

type Props = {
  field: AnaliseField;
  values: AnaliseValues;
  onFieldChange: (fieldId: string, value: unknown) => void;
  readOnly?: boolean;
  /** Pendências da seção (ver validacao.ts) — as deste campo usam "<campo>:<ppc#i>". */
  pendencias?: Record<string, { message: string; cells?: string[] }[]>;
};

const COLUNAS_PPC = PPC_COLUMNS.filter((c) => c.type !== "auto-index");

function contarFatores(st: ChecklistState | undefined) {
  return Object.values(st?.checked ?? {}).filter(Boolean).length;
}

/**
 * Seção 4 — um cartão por PPC registrado na Seção 3. "Identificar fatores contribuintes" abre a
 * análise daquele PPC na própria linha (um PPC aberto por vez). No fim, "Adicionar PPC" permite
 * registrar um problema que ficou de fora — ele entra na mesma tabela de PPC da Seção 3.
 * Valores: `values[field.id]["ppc#<índice>"]` = checklist de fatores daquele PPC.
 */
export function FatoresPorPpcField({ field, values, onFieldChange, readOnly, pendencias }: Props) {
  const fonteId = field.ppcSourceFieldId ?? "ppc";
  const ppcs = (values[fonteId] as TableRow[] | undefined) ?? [];
  const porPpc = (values[field.id] as Record<string, ChecklistState> | undefined) ?? {};
  const [aberto, setAberto] = useState<string | null>(null);

  const pendenciasDoPpc = (key: string) => pendencias?.[`${field.id}:${key}`];
  const chavesComPendencia = ppcs
    .map((_, i) => selectorItemKey(fonteId, i))
    .filter((key) => pendenciasDoPpc(key));

  // Ao tentar avançar com pendências, abre o primeiro PPC que tem algo a corrigir.
  const primeiraPendente = chavesComPendencia[0];
  useEffect(() => {
    if (primeiraPendente) setAberto(primeiraPendente);
  }, [primeiraPendente]);

  function atualizarFatores(key: string, st: ChecklistState) {
    onFieldChange(field.id, { ...porPpc, [key]: st });
  }

  function adicionarPpc(novo: TableRow) {
    onFieldChange(fonteId, [...ppcs, novo]);
    setAberto(selectorItemKey(fonteId, ppcs.length));
  }

  return (
    <div className={styles.ppcLista}>
      {ppcs.length === 0 && (
        <p className={styles.helpText}>
          Nenhum PPC registrado na Seção 3. Adicione abaixo o problema na prestação do cuidado que
          será analisado.
        </p>
      )}

      {ppcs.map((ppc, i) => {
        const key = selectorItemKey(fonteId, i);
        const estaAberto = aberto === key;
        const erros = pendenciasDoPpc(key);
        const n = contarFatores(porPpc[key]);
        const alternar = () => setAberto(estaAberto ? null : key);
        return (
          <div
            key={key}
            className={`${styles.ppcCard} ${erros && !estaAberto ? styles.ppcCardErro : ""}`}
            data-pendencia={erros ? "true" : undefined}
            data-testid={`ppc-card-${i + 1}`}
          >
            <div className={styles.ppcCardTopo}>
              <span className={styles.ppcNumero}>{i + 1}</span>
              <div className={styles.ppcTextos}>
                {estaAberto && <span className={styles.ppcEmAnalise}>Em análise</span>}
                {/* Rascunhos anteriores à coluna "problema" usam o "ocorrido" como título. */}
                <p className={styles.ppcTitulo}>{ppc.problema || ppc.ocorrido}</p>
                <p className={styles.ppcLinha}>
                  <strong>Deveria:</strong> {ppc.esperado}
                </p>
                <p className={styles.ppcLinha}>
                  <strong>Aconteceu:</strong> {ppc.ocorrido}
                </p>
              </div>
              <div className={styles.ppcAcao}>
                {erros ? (
                  <span className={`${styles.collapseBadge} ${styles.collapseBadgeError}`}>
                    Pendências
                  </span>
                ) : (
                  n > 0 && (
                    <span className={styles.ppcContagem}>
                      {n === 1 ? "1 fator registrado" : `${n} fatores registrados`}
                    </span>
                  )
                )}
                {!readOnly && !estaAberto && (
                  <p className={styles.ppcDica}>
                    Clique para identificar quais condições podem ter contribuído para a ocorrência
                    deste PPC.
                  </p>
                )}
                {!readOnly && (
                  <Button
                    title="Identificar fatores contribuintes"
                    variant="contained"
                    color="primary"
                    onClick={alternar}
                    className={stepStyles.compactBtn}
                    data-testid={`ppc-card-${i + 1}-identificar`}
                  />
                )}
                <button
                  type="button"
                  className={styles.ppcChevron}
                  onClick={alternar}
                  aria-expanded={estaAberto}
                  aria-label={estaAberto ? "Recolher PPC" : "Abrir PPC"}
                >
                  <FiChevronDown
                    size={18}
                    aria-hidden="true"
                    className={`${styles.collapseChevron} ${
                      estaAberto ? styles.collapseChevronOpen : ""
                    }`}
                  />
                </button>
              </div>
            </div>

            {estaAberto && (
              <div className={styles.ppcCorpo}>
                <p className={styles.fieldLabel}>
                  Quais condições podem ter contribuído para a ocorrência deste PPC?
                </p>
                <FatoresChecklist
                  field={field}
                  value={porPpc[key]}
                  onChange={(st) => atualizarFatores(key, st)}
                  readOnly={readOnly}
                  invalidCells={erros?.flatMap((e) => e.cells ?? [])}
                  data-testid={`ppc-card-${i + 1}-fatores`}
                />
                {erros
                  ?.filter((e) => !e.cells?.length)
                  .map((e, j) => (
                    <p key={j} className={styles.fieldErrorMessage} role="alert">
                      {e.message}
                    </p>
                  ))}
              </div>
            )}
          </div>
        );
      })}

      {!readOnly && <AdicionarPpc onAdicionar={adicionarPpc} />}
    </div>
  );
}

function AdicionarPpc({ onAdicionar }: { onAdicionar: (novo: TableRow) => void }) {
  const [formAberto, setFormAberto] = useState(false);
  const [novo, setNovo] = useState<TableRow>({});
  const [erro, setErro] = useState(false);

  function confirmar() {
    const incompleto = COLUNAS_PPC.some((c) => !(novo[c.id] ?? "").trim());
    if (incompleto) {
      setErro(true);
      return;
    }
    onAdicionar(novo);
    setNovo({});
    setErro(false);
    setFormAberto(false);
  }

  return (
    <div className={styles.ppcAdicionar}>
      <div className={styles.ppcAdicionarTopo}>
        <span className={styles.ppcAdicionarIcone} aria-hidden="true">
          <FiPlus size={16} />
        </span>
        <div className={styles.ppcTextos}>
          <p className={styles.ppcTitulo}>Faltou algum problema na prestação do cuidado?</p>
          <p className={styles.ppcLinha}>
            Se, ao iniciar esta etapa, você perceber que um problema na prestação do cuidado ainda
            não foi registrado, é possível adicioná-lo aqui.
          </p>
        </div>
        {!formAberto && (
          <Button
            title="Adicionar PPC"
            variant="outlined"
            color="primary"
            startIcon={<FiPlus size={15} style={{ marginRight: 6 }} />}
            onClick={() => setFormAberto(true)}
            className={`${stepStyles.compactBtn} ${styles.ppcAdicionarBtn}`}
            data-testid="ppc-adicionar"
          />
        )}
      </div>

      {formAberto && (
        <div className={styles.ppcAdicionarForm}>
          {COLUNAS_PPC.map((col) => {
            const vazio = erro && !(novo[col.id] ?? "").trim();
            return (
              <label key={col.id} className={styles.fatorDetalhe}>
                <span className={styles.fatorDetalheLabel}>
                  {col.label}
                  <span className={styles.required}>*</span>
                </span>
                <textarea
                  className={
                    vazio ? `${styles.cellInput} ${styles.cellInputError}` : styles.cellInput
                  }
                  rows={2}
                  maxLength={col.maxLength}
                  placeholder={col.placeholder}
                  value={novo[col.id] ?? ""}
                  onChange={(e) => setNovo((n) => ({ ...n, [col.id]: e.target.value }))}
                  data-testid={`ppc-adicionar-${col.id}`}
                />
              </label>
            );
          })}
          {erro && (
            <p className={styles.fieldErrorMessage} role="alert">
              Preencha todos os campos do PPC.
            </p>
          )}
          <div className={styles.fatorAcoes}>
            <Button
              title="Cancelar"
              variant="outlined"
              color="gray"
              onClick={() => {
                setFormAberto(false);
                setNovo({});
                setErro(false);
              }}
              className={stepStyles.compactBtn}
            />
            <Button
              title="Adicionar PPC"
              variant="contained"
              color="primary"
              onClick={confirmar}
              className={stepStyles.compactBtn}
              data-testid="ppc-adicionar-confirmar"
            />
          </div>
        </div>
      )}
    </div>
  );
}

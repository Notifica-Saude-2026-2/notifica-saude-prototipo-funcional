import { useEffect, useState } from "react";
import { FiChevronDown, FiInfo, FiPlus, FiX } from "react-icons/fi";
import type { AnaliseField, DetailFieldDef } from "../../types/analise";
import { FIVE_WHYS_NIVEIS_COLUMNS } from "../../constants/analiseSchema";
import { PORQUES_MAX_NIVEIS } from "../../constants/limites";
import { Button } from "../common/ui/Button";
import stepStyles from "../form/StepForm/StepForm.module.css";
import type { ChecklistState } from "./ChecklistWithDetailField";
import type { TableRow } from "./TableField";
import styles from "./Analise.module.css";

/** Separador das opções marcadas num detalhe "checkboxes" (ex.: Fonte/evidência). */
export const OPCOES_SEPARADOR = "; ";

const EMPTY_STATE: ChecklistState = { checked: {}, details: {} };

const [COL_PERGUNTA, COL_RESPOSTA] = FIVE_WHYS_NIVEIS_COLUMNS.filter(
  (c) => c.type !== "auto-index",
);

type Props = {
  field: AnaliseField;
  value: ChecklistState | undefined;
  onChange: (value: ChecklistState) => void;
  readOnly?: boolean;
  /** Campos com pendência (ver validacao.ts): "det:<categoria>:<campo>" e
      "porq:<categoria>:<linha>:<coluna>". */
  invalidCells?: string[];
  "data-testid"?: string;
};

/**
 * Categorias de fatores contribuintes de UM PPC (Seção 4), em sanfona: marcar uma categoria abre
 * a descrição do fator, a fonte/evidência e o 5 Porquês; "Salvar fator" recolhe a categoria.
 */
export function FatoresChecklist({
  field,
  value,
  onChange,
  readOnly,
  invalidCells,
  "data-testid": testId,
}: Props) {
  const state = value ?? EMPTY_STATE;
  const items = field.items ?? [];
  const detailFields = field.detailFields ?? [];
  const [abertos, setAbertos] = useState<Record<string, boolean>>({});

  const invalido = (cell: string) => !!invalidCells?.includes(cell);
  const categoriaComPendencia = (cat: string) =>
    (invalidCells ?? []).some((c) => c.startsWith(`det:${cat}:`) || c.startsWith(`porq:${cat}:`));

  // Ao tentar avançar com pendências, abre as categorias que têm algo a corrigir.
  const chavePendentes = items
    .filter((it) => categoriaComPendencia(it.id))
    .map((it) => it.id)
    .join("|");
  useEffect(() => {
    if (!chavePendentes) return;
    setAbertos((a) => ({
      ...a,
      ...Object.fromEntries(chavePendentes.split("|").map((k) => [k, true])),
    }));
  }, [chavePendentes]);

  function alternarCheck(itemId: string) {
    if (readOnly) return;
    const marcar = !state.checked[itemId];
    onChange({ ...state, checked: { ...state.checked, [itemId]: marcar } });
    setAbertos((a) => ({ ...a, [itemId]: marcar }));
  }

  function clicarCabecalho(itemId: string) {
    if (!state.checked[itemId]) alternarCheck(itemId);
    else setAbertos((a) => ({ ...a, [itemId]: !a[itemId] }));
  }

  function atualizarDetalhe(itemId: string, detailId: string, v: string) {
    onChange({
      ...state,
      details: { ...state.details, [itemId]: { ...state.details[itemId], [detailId]: v } },
    });
  }

  function atualizarPorques(itemId: string, rows: TableRow[]) {
    onChange({ ...state, porques: { ...state.porques, [itemId]: rows } });
  }

  return (
    <div className={styles.fatoresLista} data-testid={testId}>
      {items.map((item) => {
        const marcado = !!state.checked[item.id];
        const aberto = marcado && !!abertos[item.id];
        const achado = state.details[item.id]?.["achado"]?.trim();
        return (
          <div
            key={item.id}
            className={`${styles.fatorItem} ${aberto ? styles.fatorItemAberto : ""} ${
              categoriaComPendencia(item.id) && !aberto ? styles.fatorItemErro : ""
            }`}
          >
            <div className={styles.fatorHeader} onClick={() => clicarCabecalho(item.id)}>
              <input
                type="checkbox"
                className={styles.fatorCheckbox}
                checked={marcado}
                onChange={() => alternarCheck(item.id)}
                onClick={(e) => e.stopPropagation()}
                disabled={readOnly}
                aria-label={item.label}
                data-testid={testId ? `${testId}-${item.id}` : undefined}
              />
              <div className={styles.fatorHeaderTexto}>
                <span className={styles.fatorLabel}>{item.label}</span>
                {item.example && <span className={styles.fatorExemplo}>Ex.: {item.example}</span>}
                {marcado && !aberto && achado && (
                  <span className={styles.fatorResumo}>{achado}</span>
                )}
              </div>
              <FiChevronDown
                size={16}
                aria-hidden="true"
                className={`${styles.collapseChevron} ${aberto ? styles.collapseChevronOpen : ""}`}
              />
            </div>

            {aberto && (
              <div className={styles.fatorCorpo}>
                {detailFields.map((detail) => (
                  <DetalheFator
                    key={detail.id}
                    detail={detail}
                    value={state.details[item.id]?.[detail.id] ?? ""}
                    onChange={(v) => atualizarDetalhe(item.id, detail.id, v)}
                    invalido={invalido(`det:${item.id}:${detail.id}`)}
                    readOnly={readOnly}
                    testId={testId ? `${testId}-${item.id}-${detail.id}` : undefined}
                  />
                ))}

                {!readOnly && (
                  <div className={styles.fatorAcoes}>
                    <Button
                      title="Salvar fator"
                      variant="contained"
                      color="primary"
                      onClick={() => setAbertos((a) => ({ ...a, [item.id]: false }))}
                      className={stepStyles.compactBtn}
                      data-testid={testId ? `${testId}-${item.id}-salvar` : undefined}
                    />
                  </div>
                )}

                {field.enablePorques && (
                  <PorquesLista
                    rows={state.porques?.[item.id]}
                    onChange={(rows) => atualizarPorques(item.id, rows)}
                    readOnly={readOnly}
                    invalidCells={(invalidCells ?? [])
                      .filter((c) => c.startsWith(`porq:${item.id}:`))
                      .map((c) => c.slice(`porq:${item.id}:`.length))}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DetalheFator({
  detail,
  value,
  onChange,
  invalido,
  readOnly,
  testId,
}: {
  detail: DetailFieldDef;
  value: string;
  onChange: (v: string) => void;
  invalido: boolean;
  readOnly?: boolean;
  testId?: string;
}) {
  const rotulo = (
    <>
      {detail.label}
      {detail.optional ? (
        <span className={styles.fatorOpcional}> (opcional)</span>
      ) : (
        !readOnly && <span className={styles.required}>*</span>
      )}
    </>
  );

  if (detail.type === "checkboxes") {
    const marcadas = value ? value.split(OPCOES_SEPARADOR) : [];
    const alternar = (opcao: string) =>
      onChange(
        (marcadas.includes(opcao)
          ? marcadas.filter((m) => m !== opcao)
          : [...marcadas, opcao]
        ).join(OPCOES_SEPARADOR),
      );
    return (
      <div className={styles.fatorOpcoesLinha}>
        <span className={styles.fatorDetalheLabel}>{rotulo}</span>
        {(detail.options ?? []).map((opcao) => (
          <label key={opcao} className={styles.fatorOpcao}>
            <input
              type="checkbox"
              checked={marcadas.includes(opcao)}
              onChange={() => alternar(opcao)}
              disabled={readOnly}
              data-testid={testId ? `${testId}-${opcao}` : undefined}
            />
            {opcao}
          </label>
        ))}
      </div>
    );
  }

  const classe = invalido ? `${styles.cellInput} ${styles.cellInputError}` : styles.cellInput;
  return (
    <div className={styles.fatorDetalhe}>
      <label className={styles.fatorDetalheLabel}>{rotulo}</label>
      {detail.type === "textarea" ? (
        <textarea
          className={classe}
          rows={2}
          placeholder={readOnly ? undefined : detail.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={readOnly}
          data-testid={testId}
        />
      ) : (
        <input
          className={classe}
          type="text"
          placeholder={readOnly ? undefined : detail.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={readOnly}
          data-testid={testId}
        />
      )}
    </div>
  );
}

/**
 * 5 Porquês do fator — sempre visível com ao menos uma linha. Opcional: linhas totalmente vazias
 * são ignoradas na validação e no Ishikawa; linhas começadas precisam de pergunta e resposta.
 */
function PorquesLista({
  rows,
  onChange,
  readOnly,
  invalidCells,
}: {
  rows: TableRow[] | undefined;
  onChange: (rows: TableRow[]) => void;
  readOnly?: boolean;
  /** Células no formato "linha:coluna". */
  invalidCells: string[];
}) {
  const linhas = rows && rows.length > 0 ? rows : [{}];
  const classe = (cell: string) =>
    invalidCells.includes(cell) ? `${styles.cellInput} ${styles.cellInputError}` : styles.cellInput;

  function atualizar(i: number, col: string, v: string) {
    onChange(linhas.map((r, j) => (j === i ? { ...r, [col]: v } : r)));
  }

  function adicionar() {
    // A próxima pergunta nasce da resposta anterior ("Por que <resposta>?"), editável depois.
    const anterior = (linhas[linhas.length - 1]?.[COL_RESPOSTA.id] ?? "").trim().replace(/\.$/, "");
    const derivar = COL_PERGUNTA.deriveFromPreviousRow;
    const pergunta = anterior && derivar ? `${derivar.prefix}${anterior}${derivar.suffix}` : "";
    onChange([...linhas, { [COL_PERGUNTA.id]: pergunta }]);
  }

  return (
    <div className={styles.porquesBloco}>
      <p className={styles.porquesTitulo}>5 Porquês</p>
      {!readOnly && (
        <div className={styles.porquesInfo}>
          <FiInfo size={14} aria-hidden="true" className={styles.sectionInfoIcon} />
          <div>
            <p>
              Comece pelo fator identificado e pergunte: &quot;Por que isso aconteceu?&quot;. Use
              cada resposta para formular o próximo &quot;por quê?&quot;.
            </p>
            <p>
              Não é necessário chegar exatamente a cinco perguntas. Continue enquanto as respostas
              ajudarem a aprofundar a causa do fator identificado e encerre a análise quando
              considerar que chegou a uma causa capaz de orientar uma ação de melhoria.
            </p>
          </div>
        </div>
      )}
      <div className={styles.porquesLinhas}>
        {linhas.map((row, i) => (
          <div key={i} className={styles.porquesLinha}>
            <span className={styles.porquesNivel}>{i + 1}º por quê?</span>
            <label className={styles.porquesCampo}>
              <span className={styles.porquesCampoLabel}>Pergunta</span>
              <textarea
                className={classe(`${i}:${COL_PERGUNTA.id}`)}
                rows={2}
                placeholder={readOnly ? undefined : "Por que isso aconteceu?"}
                value={row[COL_PERGUNTA.id] ?? ""}
                onChange={(e) => atualizar(i, COL_PERGUNTA.id, e.target.value)}
                disabled={readOnly}
              />
            </label>
            <label className={styles.porquesCampo}>
              <span className={styles.porquesCampoLabel}>Resposta</span>
              <textarea
                className={classe(`${i}:${COL_RESPOSTA.id}`)}
                rows={2}
                placeholder={readOnly ? undefined : COL_RESPOSTA.placeholder}
                value={row[COL_RESPOSTA.id] ?? ""}
                onChange={(e) => atualizar(i, COL_RESPOSTA.id, e.target.value)}
                disabled={readOnly}
              />
            </label>
            {!readOnly && linhas.length > 1 ? (
              <button
                type="button"
                className={styles.porquesRemover}
                onClick={() => onChange(linhas.filter((_, j) => j !== i))}
                aria-label={`Remover ${i + 1}º por quê`}
              >
                <FiX size={15} />
              </button>
            ) : (
              <span className={styles.porquesRemoverVazio} />
            )}
          </div>
        ))}
      </div>
      {!readOnly && linhas.length < PORQUES_MAX_NIVEIS && (
        <button type="button" className={styles.porquesAdicionar} onClick={adicionar}>
          <FiPlus size={14} aria-hidden="true" /> Adicionar outro &quot;por quê?&quot;
        </button>
      )}
    </div>
  );
}

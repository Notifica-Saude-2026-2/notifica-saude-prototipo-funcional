import { useEffect, useState } from "react";
import type { AnaliseField, ChoiceOption, TableColumn, TableColumnType } from "../../types/analise";
import { formatCurrencyInput } from "../../utils/currency";
import { normalizeOption } from "../../types/analise";
import { InfoTooltip } from "../common/ui/InfoTooltip";
import styles from "./Analise.module.css";

export type TableRow = Record<string, string> & { __label?: string };

type Props = {
  field: AnaliseField;
  value: TableRow[] | undefined;
  onChange: (rows: TableRow[]) => void;
  /** Somente leitura — desabilita edição e oculta os controles de adicionar/remover linha. */
  readOnly?: boolean;
  "data-testid"?: string;
};

function emptyRow(): TableRow {
  return {};
}

/** Largura padrão por tipo de coluna — mantém o grid estável independente do conteúdo digitado. */
const COLUMN_WIDTH: Record<TableColumnType, string> = {
  date: "128px",
  time: "104px",
  choice: "180px",
  text: "200px",
  textarea: "260px",
  currency: "140px",
  "auto-index": "64px",
};

/** Rótulo de coluna/campo com um ícone de ajuda ao lado quando há uma legenda associada (ex.:
    "Confirmado = fonte documental direta..." na coluna Status da cronologia). */
function ColumnLabel({
  label,
  helpText,
  helpTextItems,
}: {
  label: string;
  helpText?: string;
  helpTextItems?: TableColumn["helpTextItems"];
}) {
  if (!helpText && !helpTextItems) return <>{label}</>;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      {label}
      <InfoTooltip text={helpText} items={helpTextItems} />
    </span>
  );
}

export function TableField({ field, value, onChange, readOnly, "data-testid": dataTestId }: Props) {
  const columns = field.columns ?? [];
  const fixedRows = field.fixedRows;

  useEffect(() => {
    if (value !== undefined) return;
    if (fixedRows && fixedRows.length > 0) {
      onChange(fixedRows.map((label) => ({ __label: label })));
    } else if (field.minRows && field.minRows > 0) {
      onChange(Array.from({ length: field.minRows }, emptyRow));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const rows = value ?? (fixedRows ? fixedRows.map((label): TableRow => ({ __label: label })) : []);

  function updateCell(rowIndex: number, columnId: string, cellValue: string) {
    const next = rows.map((row, i) => (i === rowIndex ? { ...row, [columnId]: cellValue } : row));
    onChange(next);
  }

  function addRow() {
    const previousRow = rows[rows.length - 1];
    const newRow = emptyRow();
    // Colunas marcadas com `deriveFromPreviousRow` já vêm sugeridas a partir da linha anterior
    // (ex.: nos "5 Porquês", a pergunta do próximo nível puxa a resposta do nível de cima). Só um
    // ponto de partida editável — e não faz nada na primeira linha, que não tem anterior.
    if (previousRow) {
      for (const col of columns) {
        const derive = col.deriveFromPreviousRow;
        const sourceValue = derive ? previousRow[derive.sourceColumnId] : undefined;
        if (derive && sourceValue) {
          newRow[col.id] = `${derive.prefix ?? ""}${sourceValue}${derive.suffix ?? ""}`;
        }
      }
    }
    onChange([...rows, newRow]);
  }

  function removeRow(rowIndex: number) {
    onChange(rows.filter((_, i) => i !== rowIndex));
  }

  const showRemoveColumn = field.repeatable && !fixedRows && !readOnly;

  // Colunas de texto longo (textarea) ficam ruins espremidas numa célula de tabela — nesse caso a
  // linha inteira vira um card (campos curtos lado a lado, texto longo ocupando a largura toda)
  // em vez de uma linha de tabela. Tabelas só com campos curtos continuam como tabela mesmo.
  const hasLongText = field.layout !== "table" && columns.some((col) => col.type === "textarea");

  const addButton = field.repeatable && !fixedRows && !readOnly && (
    <button
      type="button"
      className={styles.addRowBtn}
      onClick={addRow}
      data-testid={dataTestId ? `${dataTestId}-add` : undefined}
    >
      {field.addButtonLabel ?? "+ Adicionar linha"}
    </button>
  );

  if (hasLongText) {
    const shortColumns = columns.filter((col) => col.type !== "textarea");
    const longColumns = columns.filter((col) => col.type === "textarea");

    return (
      <div data-testid={dataTestId}>
        {rows.length === 0 && <p className={styles.helpText}>Nenhuma linha adicionada ainda.</p>}
        <div className={styles.tableCardList}>
          {rows.map((row, rowIndex) => {
            const cardTitle =
              row.__label ??
              (field.itemLabel ? `${field.itemLabel} #${rowIndex + 1}` : `Linha ${rowIndex + 1}`);
            return (
              <div key={rowIndex} className={styles.tableCard}>
                <div className={styles.tableCardHeader}>
                  <span className={styles.tableCardTitle}>{cardTitle}</span>
                  {showRemoveColumn && (
                    <button
                      type="button"
                      className={styles.removeRowBtn}
                      onClick={() => removeRow(rowIndex)}
                      data-testid={dataTestId ? `${dataTestId}-row${rowIndex}-remove` : undefined}
                    >
                      Remover
                    </button>
                  )}
                </div>
                <div className={styles.tableCardBody}>
                  {shortColumns.length > 0 && (
                    <div className={styles.tableCardShortGrid}>
                      {shortColumns.map((col) => (
                        <div key={col.id} className={styles.tableCardField}>
                          <label className={styles.tableCardFieldLabel}>
                            <ColumnLabel
                              label={col.label}
                              helpText={col.helpText}
                              helpTextItems={col.helpTextItems}
                            />
                          </label>
                          {col.type === "auto-index" ? (
                            <span className={styles.autoIndexCell}>{rowIndex + 1}</span>
                          ) : (
                            <TableCell
                              type={col.type}
                              options={col.options}
                              allowOther={col.allowOther}
                              value={row[col.id] ?? ""}
                              onChange={(v) => updateCell(rowIndex, col.id, v)}
                              readOnly={readOnly}
                              testId={
                                dataTestId ? `${dataTestId}-row${rowIndex}-${col.id}` : undefined
                              }
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {longColumns.map((col) => (
                    <div key={col.id} className={styles.tableCardField}>
                      <label className={styles.tableCardFieldLabel}>
                        <ColumnLabel
                          label={col.label}
                          helpText={col.helpText}
                          helpTextItems={col.helpTextItems}
                        />
                      </label>
                      <TableCell
                        type={col.type}
                        options={col.options}
                        allowOther={col.allowOther}
                        value={row[col.id] ?? ""}
                        onChange={(v) => updateCell(rowIndex, col.id, v)}
                        readOnly={readOnly}
                        rows={3}
                        testId={dataTestId ? `${dataTestId}-row${rowIndex}-${col.id}` : undefined}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {addButton}
      </div>
    );
  }

  return (
    <div data-testid={dataTestId}>
      <div className={styles.tableWrap}>
        <table className={`${styles.table} ${styles.tableFixed}`}>
          <colgroup>
            {fixedRows && <col style={{ width: "150px" }} />}
            {columns.map((col) => (
              <col key={col.id} style={{ width: COLUMN_WIDTH[col.type] }} />
            ))}
            {showRemoveColumn && <col style={{ width: "90px" }} />}
          </colgroup>
          <thead>
            <tr>
              {fixedRows && <th></th>}
              {columns.map((col) => (
                <th key={col.id}>
                  <ColumnLabel
                    label={col.label}
                    helpText={col.helpText}
                    helpTextItems={col.helpTextItems}
                  />
                </th>
              ))}
              {showRemoveColumn && <th></th>}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} style={{ textAlign: "center", opacity: 0.6 }}>
                  Nenhuma linha adicionada ainda.
                </td>
              </tr>
            )}
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {fixedRows && <td className={styles.rowLabelCell}>{row.__label}</td>}
                {columns.map((col) => (
                  <td key={col.id}>
                    {col.type === "auto-index" ? (
                      <span className={styles.autoIndexCell}>{rowIndex + 1}</span>
                    ) : (
                      <TableCell
                        type={col.type}
                        options={col.options}
                        allowOther={col.allowOther}
                        value={row[col.id] ?? ""}
                        onChange={(v) => updateCell(rowIndex, col.id, v)}
                        readOnly={readOnly}
                        testId={dataTestId ? `${dataTestId}-row${rowIndex}-${col.id}` : undefined}
                      />
                    )}
                  </td>
                ))}
                {showRemoveColumn && (
                  <td>
                    <button
                      type="button"
                      className={styles.removeRowBtn}
                      onClick={() => removeRow(rowIndex)}
                      data-testid={dataTestId ? `${dataTestId}-row${rowIndex}-remove` : undefined}
                    >
                      Remover
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {addButton}
    </div>
  );
}

function TableCell({
  type,
  options,
  allowOther,
  value,
  onChange,
  readOnly,
  rows = 2,
  testId,
}: {
  type: string;
  options?: ChoiceOption[];
  allowOther?: TableColumn["allowOther"];
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
  rows?: number;
  testId?: string;
}) {
  if (type === "textarea") {
    return (
      <textarea
        className={styles.cellInput}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={readOnly}
        data-testid={testId}
      />
    );
  }
  if (type === "date") {
    return (
      <input
        className={styles.cellInput}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={readOnly}
        data-testid={testId}
      />
    );
  }
  if (type === "time") {
    return (
      <input
        className={styles.cellInput}
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={readOnly}
        data-testid={testId}
      />
    );
  }
  if (type === "currency") {
    return (
      <input
        className={styles.cellInput}
        type="text"
        inputMode="numeric"
        placeholder="R$ 0,00"
        value={value}
        onChange={(e) => onChange(formatCurrencyInput(e.target.value))}
        disabled={readOnly}
        data-testid={testId}
      />
    );
  }
  if (type === "choice" && options) {
    return (
      <TableChoiceCell
        options={options}
        allowOther={allowOther}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        testId={testId}
      />
    );
  }
  return (
    <input
      className={styles.cellInput}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={readOnly}
      data-testid={testId}
    />
  );
}

/** Select de coluna com opção "Outro" — ao escolhê-la, revela um campo de texto livre logo
    abaixo (ex.: Fonte da cronologia: Prontuário / Inspeção no local / Entrevista / Outro). */
function TableChoiceCell({
  options,
  allowOther,
  value,
  onChange,
  readOnly,
  testId,
}: {
  options: ChoiceOption[];
  allowOther?: boolean;
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
  testId?: string;
}) {
  const optionValues = options.map((opt) => normalizeOption(opt).value);
  const isCustomValue = allowOther && value !== "" && !optionValues.includes(value);
  const [customMode, setCustomMode] = useState(false);
  const showCustomInput = isCustomValue || customMode;

  return (
    <div>
      <select
        className={styles.cellSelect}
        value={showCustomInput ? "Outro" : value}
        onChange={(e) => {
          if (allowOther && e.target.value === "Outro") {
            setCustomMode(true);
            onChange("");
          } else {
            setCustomMode(false);
            onChange(e.target.value);
          }
        }}
        disabled={readOnly}
        data-testid={testId}
      >
        <option value="">Selecione...</option>
        {options.map((opt) => {
          const o = normalizeOption(opt);
          return (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          );
        })}
      </select>
      {showCustomInput && (
        <input
          className={styles.cellInput}
          style={{ marginTop: 6 }}
          type="text"
          placeholder="Especifique"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={readOnly}
          data-testid={testId ? `${testId}-outro` : undefined}
        />
      )}
    </div>
  );
}

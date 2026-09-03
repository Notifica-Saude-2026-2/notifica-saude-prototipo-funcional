import { useEffect } from "react";
import type { AnaliseField, ChoiceOption, TableColumnType } from "../../types/analise";
import { normalizeOption } from "../../types/analise";
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
};

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

  const rows = value ?? (fixedRows ? fixedRows.map((label) => ({ __label: label })) : []);

  function updateCell(rowIndex: number, columnId: string, cellValue: string) {
    const next = rows.map((row, i) => (i === rowIndex ? { ...row, [columnId]: cellValue } : row));
    onChange(next);
  }

  function addRow() {
    onChange([...rows, emptyRow()]);
  }

  function removeRow(rowIndex: number) {
    onChange(rows.filter((_, i) => i !== rowIndex));
  }

  const showRemoveColumn = field.repeatable && !fixedRows && !readOnly;

  // Colunas de texto longo (textarea) ficam ruins espremidas numa célula de tabela — nesse caso a
  // linha inteira vira um card (campos curtos lado a lado, texto longo ocupando a largura toda)
  // em vez de uma linha de tabela. Tabelas só com campos curtos continuam como tabela mesmo.
  const hasLongText = columns.some((col) => col.type === "textarea");

  const addButton = field.repeatable && !fixedRows && !readOnly && (
    <button
      type="button"
      className={styles.addRowBtn}
      onClick={addRow}
      data-testid={dataTestId ? `${dataTestId}-add` : undefined}
    >
      + Adicionar linha
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
                          <label className={styles.tableCardFieldLabel}>{col.label}</label>
                          <TableCell
                            type={col.type}
                            options={col.options}
                            value={row[col.id] ?? ""}
                            onChange={(v) => updateCell(rowIndex, col.id, v)}
                            readOnly={readOnly}
                            testId={
                              dataTestId ? `${dataTestId}-row${rowIndex}-${col.id}` : undefined
                            }
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {longColumns.map((col) => (
                    <div key={col.id} className={styles.tableCardField}>
                      <label className={styles.tableCardFieldLabel}>{col.label}</label>
                      <TableCell
                        type={col.type}
                        options={col.options}
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
                <th key={col.id}>{col.label}</th>
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
                    <TableCell
                      type={col.type}
                      options={col.options}
                      value={row[col.id] ?? ""}
                      onChange={(v) => updateCell(rowIndex, col.id, v)}
                      readOnly={readOnly}
                      testId={dataTestId ? `${dataTestId}-row${rowIndex}-${col.id}` : undefined}
                    />
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
  value,
  onChange,
  readOnly,
  rows = 2,
  testId,
}: {
  type: string;
  options?: ChoiceOption[];
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
  if (type === "choice" && options) {
    return (
      <select
        className={styles.cellSelect}
        value={value}
        onChange={(e) => onChange(e.target.value)}
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

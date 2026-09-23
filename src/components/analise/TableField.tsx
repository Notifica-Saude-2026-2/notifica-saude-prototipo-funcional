import { useEffect, useState, type CSSProperties } from "react";
import type { AnaliseField, ChoiceOption, TableColumn, TableColumnType } from "../../types/analise";
import { formatCurrencyInput } from "../../utils/currency";
import { normalizeOption } from "../../types/analise";
import { InfoTooltip } from "../common/ui/InfoTooltip";
import { OUTRO_MAX_LENGTH } from "../../constants/limites";
import styles from "./Analise.module.css";

export type TableRow = Record<string, string> & { __label?: string };

type Props = {
  field: AnaliseField;
  value: TableRow[] | undefined;
  onChange: (rows: TableRow[]) => void;
  /** Somente leitura — desabilita edição e oculta os controles de adicionar/remover linha. */
  readOnly?: boolean;
  /** Células a destacar em vermelho ("linha:colunaId"), quando há pendência de preenchimento. */
  invalidCells?: string[];
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
  required,
}: {
  label: string;
  helpText?: string;
  helpTextItems?: TableColumn["helpTextItems"];
  /** Tabela obrigatória (field.required): todas as colunas precisam ser preenchidas. */
  required?: boolean;
}) {
  const mark = required ? <span className={styles.required}>*</span> : null;
  if (!helpText && !helpTextItems)
    return (
      <>
        {label}
        {mark}
      </>
    );
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      {label}
      {mark}
      <InfoTooltip text={helpText} items={helpTextItems} />
    </span>
  );
}

export function TableField({
  field,
  value,
  onChange,
  readOnly,
  invalidCells,
  "data-testid": dataTestId,
}: Props) {
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

  // Com `lockMinRows`, não deixa remover abaixo do mínimo (ex.: 5 Porquês aberto = ao menos 1 nível).
  const podeRemover = !field.lockMinRows || rows.length > (field.minRows ?? 0);
  // Sem nenhuma linha removível (lockMinRows no mínimo), a coluna "Remover" nem aparece — assim as
  // colunas de dados ocupam a largura toda.
  const showRemoveColumn = field.repeatable && !fixedRows && !readOnly && podeRemover;
  const limiteAtingido = !!field.maxRows && rows.length >= field.maxRows;

  // Colunas de texto longo (textarea) ficam ruins espremidas numa célula de tabela — nesse caso a
  // linha inteira vira um card (campos curtos lado a lado, texto longo ocupando a largura toda)
  // em vez de uma linha de tabela. Tabelas só com campos curtos continuam como tabela mesmo.
  const hasLongText = field.layout !== "table" && columns.some((col) => col.type === "textarea");

  const addButton = field.repeatable && !fixedRows && !readOnly && (
    <div className={styles.addRowWrap}>
      <button
        type="button"
        className={styles.addRowBtn}
        onClick={addRow}
        disabled={limiteAtingido}
        data-testid={dataTestId ? `${dataTestId}-add` : undefined}
      >
        {field.addButtonLabel ?? "+ Adicionar linha"}
      </button>
      {field.maxRows && (
        <span
          className={`${styles.rowLimitHint} ${limiteAtingido ? styles.rowLimitHintMax : ""}`}
          data-testid={dataTestId ? `${dataTestId}-limite` : undefined}
        >
          {limiteAtingido
            ? `Limite de ${field.maxRows} ${(field.itemLabel ?? "linha").toLowerCase()}s atingido.`
            : `${rows.length}/${field.maxRows}`}
        </span>
      )}
    </div>
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
                  <span className={styles.tableCardTitle}>
                    {cardTitle}
                    {/* Coluna única sem rótulo próprio: o asterisco de obrigatório vai no título. */}
                    {columns.length === 1 &&
                      (field.required || field.requireCompleteRows) &&
                      !readOnly && <span className={styles.required}>*</span>}
                  </span>
                  {showRemoveColumn && podeRemover && (
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
                    <div
                      className={
                        shortColumns.some((col) => col.width)
                          ? `${styles.tableCardShortGrid} ${styles.tableCardShortGridCustom}`
                          : styles.tableCardShortGrid
                      }
                      style={
                        {
                          "--short-cols": shortColumns
                            .map((col) => `minmax(0, ${col.width ?? 1}fr)`)
                            .join(" "),
                        } as CSSProperties
                      }
                    >
                      {shortColumns.map((col) => (
                        <div key={col.id} className={styles.tableCardField}>
                          <label className={styles.tableCardFieldLabel}>
                            <ColumnLabel
                              label={col.label}
                              helpText={col.helpText}
                              helpTextItems={col.helpTextItems}
                              required={(field.required || field.requireCompleteRows) && !readOnly}
                            />
                          </label>
                          {col.type === "auto-index" ? (
                            <span className={styles.autoIndexCell}>{rowIndex + 1}</span>
                          ) : (
                            <TableCell
                              type={col.type}
                              options={col.options}
                              allowOther={col.allowOther}
                              placeholder={col.placeholder}
                              maxLength={col.maxLength}
                              invalid={invalidCells?.includes(`${rowIndex}:${col.id}`)}
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
                      {/* Card de coluna única (ex.: Recomendações): o título do card já diz o que
                          é ("Recomendação #1"), então o rótulo da coluna seria só repetição. */}
                      {columns.length > 1 && (
                        <label className={styles.tableCardFieldLabel}>
                          <ColumnLabel
                            label={col.label}
                            helpText={col.helpText}
                            helpTextItems={col.helpTextItems}
                            required={(field.required || field.requireCompleteRows) && !readOnly}
                          />
                        </label>
                      )}
                      <TableCell
                        type={col.type}
                        options={col.options}
                        allowOther={col.allowOther}
                        placeholder={col.placeholder}
                        maxLength={col.maxLength}
                        invalid={invalidCells?.includes(`${rowIndex}:${col.id}`)}
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
      <div className={`${styles.tableWrap} ${field.stackOnMobile ? styles.tableStackMobile : ""}`}>
        <table className={`${styles.table} ${styles.tableFixed}`}>
          <colgroup>
            {fixedRows && <col style={{ width: "150px" }} />}
            {columns.map((col) => (
              <col key={col.id} style={{ width: col.tableWidth ?? COLUMN_WIDTH[col.type] }} />
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
                    required={
                      (field.required || field.requireCompleteRows) &&
                      !readOnly &&
                      col.type !== "auto-index"
                    }
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
                  <td
                    key={col.id}
                    // Rótulo usado quando a tabela empilha no celular (stackOnMobile).
                    data-label={
                      (field.required || field.requireCompleteRows) &&
                      !readOnly &&
                      col.type !== "auto-index"
                        ? `${col.label} *`
                        : col.label
                    }
                  >
                    {col.type === "auto-index" ? (
                      <span className={styles.autoIndexCell}>{rowIndex + 1}</span>
                    ) : (
                      <TableCell
                        type={col.type}
                        options={col.options}
                        allowOther={col.allowOther}
                        placeholder={col.placeholder}
                        maxLength={col.maxLength}
                        invalid={invalidCells?.includes(`${rowIndex}:${col.id}`)}
                        // Na tabela, texto longo começa com a mesma altura dos outros campos da linha;
                        // a pessoa expande arrastando o canto se precisar.
                        rows={1}
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
                    {podeRemover && (
                      <button
                        type="button"
                        className={styles.removeRowBtn}
                        onClick={() => removeRow(rowIndex)}
                        data-testid={dataTestId ? `${dataTestId}-row${rowIndex}-remove` : undefined}
                      >
                        Remover
                      </button>
                    )}
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
  placeholder,
  maxLength,
  invalid,
}: {
  type: string;
  options?: ChoiceOption[];
  allowOther?: TableColumn["allowOther"];
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
  rows?: number;
  testId?: string;
  placeholder?: string;
  maxLength?: number;
  invalid?: boolean;
}) {
  const inputCls = invalid ? `${styles.cellInput} ${styles.cellInputError}` : styles.cellInput;
  // Campo vazio sempre explica o que digitar (exceto em modo somente leitura).
  const ph = readOnly ? undefined : (placeholder ?? "Digite aqui...");
  if (type === "textarea") {
    const textarea = (
      <textarea
        className={inputCls}
        rows={rows}
        placeholder={ph}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={readOnly}
        data-testid={testId}
      />
    );
    if (!maxLength || readOnly) return textarea;
    return (
      <div>
        {textarea}
        <div
          className={`${styles.charCounter} ${value.length > maxLength ? styles.charCounterOver : ""}`}
          data-testid={testId ? `${testId}-contador` : undefined}
        >
          {value.length}/{maxLength}
        </div>
      </div>
    );
  }
  if (type === "date") {
    return (
      <input
        className={inputCls}
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
        className={inputCls}
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
        className={inputCls}
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
        invalid={invalid}
      />
    );
  }
  const textInput = (
    <input
      className={inputCls}
      type="text"
      placeholder={ph}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={readOnly}
      data-testid={testId}
    />
  );
  if (!maxLength || readOnly) return textInput;
  // Com limite de caracteres: contador abaixo, vermelho ao ultrapassar (o aviso e o bloqueio do
  // avanço ficam em AnaliseFlowPage, igual ao limite de campo).
  return (
    <div>
      {textInput}
      <div
        className={`${styles.charCounter} ${value.length > maxLength ? styles.charCounterOver : ""}`}
        data-testid={testId ? `${testId}-contador` : undefined}
      >
        {value.length}/{maxLength}
      </div>
    </div>
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
  invalid,
}: {
  options: ChoiceOption[];
  allowOther?: boolean;
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
  testId?: string;
  invalid?: boolean;
}) {
  // Com allowOther, a opção "Outro" sempre aparece no menu — mesmo que a lista do schema não a
  // inclua explicitamente (antes só funcionava onde "Outro" estava escrito na lista, ex.: Fonte da
  // cronologia; em Formação/Função/Setor da equipe ela nunca aparecia).
  const allOptions: ChoiceOption[] =
    allowOther && !options.some((opt) => normalizeOption(opt).value === "Outro")
      ? [...options, "Outro"]
      : options;
  const optionValues = allOptions.map((opt) => normalizeOption(opt).value);
  const isCustomValue = allowOther && value !== "" && !optionValues.includes(value);
  const [customMode, setCustomMode] = useState(false);
  const showCustomInput = isCustomValue || customMode;

  return (
    <div>
      <select
        className={
          invalid && !showCustomInput
            ? `${styles.cellSelect} ${styles.cellInputError}`
            : styles.cellSelect
        }
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
        {allOptions.map((opt) => {
          const o = normalizeOption(opt);
          return (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          );
        })}
      </select>
      {showCustomInput && (
        <>
          <input
            className={invalid ? `${styles.cellInput} ${styles.cellInputError}` : styles.cellInput}
            style={{ marginTop: 6 }}
            type="text"
            placeholder="Especifique a opção"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={readOnly}
            data-testid={testId ? `${testId}-outro` : undefined}
          />
          {!readOnly && (
            <div
              className={`${styles.charCounter} ${value.length > OUTRO_MAX_LENGTH ? styles.charCounterOver : ""}`}
            >
              {value.length}/{OUTRO_MAX_LENGTH}
            </div>
          )}
        </>
      )}
    </div>
  );
}

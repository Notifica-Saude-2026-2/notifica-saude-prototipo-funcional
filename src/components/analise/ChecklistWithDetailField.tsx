import { useState } from "react";
import type { AnaliseField } from "../../types/analise";
import { FIVE_WHYS_NIVEIS_COLUMNS } from "../../constants/analiseSchema";
import { TableField, type TableRow } from "./TableField";
import styles from "./Analise.module.css";

export type ChecklistState = {
  checked: Record<string, boolean>;
  details: Record<string, Record<string, string>>;
  otherChecked?: boolean;
  otherText?: string;
  otherDetail?: Record<string, string>;
  /** 5 Porquês embutidos por categoria (chave = id da categoria, ou "outro" pra categoria livre) —
      só existe quando `field.enablePorques` está ativo (ver Seção 4A). */
  porques?: Record<string, TableRow[]>;
};

const EMPTY_STATE: ChecklistState = { checked: {}, details: {} };

/**
 * Bloco do 5 Porquês embutido numa categoria marcada — componente de nível de módulo (fora de
 * ChecklistWithDetailField) de propósito: definir isso como função aninhada dentro do render do
 * componente pai criava um novo "tipo" de componente a cada re-render, e o React desmontava e
 * remontava a árvore inteira (inclusive a TableField com o input em foco) a cada tecla digitada —
 * só a 1ª letra de cada campo chegava a salvar. Com o componente estável aqui fora, o foco persiste.
 */
function PorquesBlock({
  isOpen,
  rows,
  onOpen,
  onHide,
  onChangeRows,
  readOnly,
}: {
  isOpen: boolean;
  rows: TableRow[] | undefined;
  onOpen: () => void;
  onHide: () => void;
  onChangeRows: (rows: TableRow[]) => void;
  readOnly?: boolean;
}) {
  if (!isOpen) {
    return (
      <button
        type="button"
        className={styles.addItemBtn}
        style={{ marginTop: 8 }}
        onClick={onOpen}
        disabled={readOnly}
      >
        Por que isso aconteceu? (5 Porquês)
      </button>
    );
  }
  return (
    <div className={styles.groupItemCard} style={{ marginTop: 8 }}>
      <div className={styles.groupItemHeader}>
        <span className={styles.groupItemTitle}>5 Porquês</span>
        {!readOnly && (
          <button type="button" className={styles.removeItemBtn} onClick={onHide}>
            Ocultar
          </button>
        )}
      </div>
      <TableField
        field={{
          id: "porques",
          label: "Níveis de 'Por quê?'",
          type: "table",
          repeatable: true,
          itemLabel: "Porquê",
          columns: FIVE_WHYS_NIVEIS_COLUMNS,
        }}
        value={rows}
        onChange={onChangeRows}
        readOnly={readOnly}
      />
    </div>
  );
}

type Props = {
  field: AnaliseField;
  value: ChecklistState | undefined;
  onChange: (value: ChecklistState) => void;
  readOnly?: boolean;
  "data-testid"?: string;
};

export function ChecklistWithDetailField({
  field,
  value,
  onChange,
  readOnly,
  "data-testid": dataTestId,
}: Props) {
  const state = value ?? EMPTY_STATE;
  const items = field.items ?? [];
  const detailFields = field.detailFields ?? [];
  const [expandedPorques, setExpandedPorques] = useState<Record<string, boolean>>({});

  function toggle(itemId: string) {
    onChange({ ...state, checked: { ...state.checked, [itemId]: !state.checked[itemId] } });
  }

  function updateDetail(itemId: string, detailId: string, v: string) {
    onChange({
      ...state,
      details: { ...state.details, [itemId]: { ...state.details[itemId], [detailId]: v } },
    });
  }

  function toggleOther() {
    onChange({ ...state, otherChecked: !state.otherChecked });
  }

  function updateOtherDetail(detailId: string, v: string) {
    onChange({ ...state, otherDetail: { ...state.otherDetail, [detailId]: v } });
  }

  /** Abre o 5 Porquês embutido de uma categoria — na primeira vez, semeia a primeira pergunta a
      partir do achado já registrado ali ("Por que <achado>?"), continuando editável depois. */
  function openPorques(itemId: string, achado: string | undefined) {
    setExpandedPorques((e) => ({ ...e, [itemId]: true }));
    const existing = state.porques?.[itemId];
    if (existing && existing.length > 0) return;
    const seedRow: TableRow = achado?.trim() ? { pergunta: `Por que ${achado.trim()}?` } : {};
    onChange({ ...state, porques: { ...state.porques, [itemId]: [seedRow] } });
  }

  function hidePorques(itemId: string) {
    setExpandedPorques((e) => ({ ...e, [itemId]: false }));
  }

  function updatePorques(itemId: string, rows: TableRow[]) {
    onChange({ ...state, porques: { ...state.porques, [itemId]: rows } });
  }

  function isPorquesOpen(itemId: string): boolean {
    const rows = state.porques?.[itemId];
    return !!expandedPorques[itemId] || (!!rows && rows.length > 0);
  }

  return (
    <div className={styles.checklistList} data-testid={dataTestId}>
      {items.map((item) => {
        const checked = !!state.checked[item.id];
        return (
          <div
            key={item.id}
            className={`${styles.checklistItem} ${checked ? styles.checklistItemChecked : ""}`}
          >
            <div className={styles.checklistHeaderRow} onClick={() => toggle(item.id)}>
              <input
                type="checkbox"
                className={styles.checklistCheckbox}
                checked={checked}
                onChange={() => toggle(item.id)}
                onClick={(e) => e.stopPropagation()}
                disabled={readOnly}
                data-testid={dataTestId ? `${dataTestId}-${item.id}` : undefined}
              />
              <div>
                <div className={styles.checklistItemLabel}>{item.label}</div>
                {item.example && <p className={styles.checklistItemExample}>ex.: {item.example}</p>}
              </div>
            </div>
            {checked && detailFields.length > 0 && (
              <div className={styles.checklistDetailGrid}>
                {detailFields.map((detail) => (
                  <div key={detail.id}>
                    <label className={styles.fieldLabel} style={{ fontSize: 12, fontWeight: 500 }}>
                      {detail.label}
                    </label>
                    {detail.type === "textarea" ? (
                      <textarea
                        className={styles.cellInput}
                        rows={2}
                        value={state.details[item.id]?.[detail.id] ?? ""}
                        onChange={(e) => updateDetail(item.id, detail.id, e.target.value)}
                        disabled={readOnly}
                        data-testid={
                          dataTestId ? `${dataTestId}-${item.id}-${detail.id}` : undefined
                        }
                      />
                    ) : (
                      <input
                        className={styles.cellInput}
                        type="text"
                        value={state.details[item.id]?.[detail.id] ?? ""}
                        onChange={(e) => updateDetail(item.id, detail.id, e.target.value)}
                        disabled={readOnly}
                        data-testid={
                          dataTestId ? `${dataTestId}-${item.id}-${detail.id}` : undefined
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
            {checked && field.enablePorques && (
              <PorquesBlock
                isOpen={isPorquesOpen(item.id)}
                rows={state.porques?.[item.id]}
                onOpen={() => openPorques(item.id, state.details[item.id]?.["achado"])}
                onHide={() => hidePorques(item.id)}
                onChangeRows={(rows) => updatePorques(item.id, rows)}
                readOnly={readOnly}
              />
            )}
          </div>
        );
      })}

      {field.allowOther && (
        <div
          className={`${styles.checklistItem} ${state.otherChecked ? styles.checklistItemChecked : ""}`}
        >
          <div className={styles.checklistHeaderRow} onClick={toggleOther}>
            <input
              type="checkbox"
              className={styles.checklistCheckbox}
              checked={!!state.otherChecked}
              onChange={toggleOther}
              onClick={(e) => e.stopPropagation()}
              disabled={readOnly}
              data-testid={dataTestId ? `${dataTestId}-outro` : undefined}
            />
            <div className={styles.checklistItemLabel}>{field.otherLabel ?? "Outro"}</div>
          </div>
          {state.otherChecked && (
            <div className={styles.checklistDetailGrid}>
              <input
                className={styles.cellInput}
                type="text"
                placeholder="Descreva a categoria não mapeada..."
                value={state.otherText ?? ""}
                onChange={(e) => onChange({ ...state, otherText: e.target.value })}
                disabled={readOnly}
                data-testid={dataTestId ? `${dataTestId}-outro-texto` : undefined}
              />
              {detailFields.map((detail) => (
                <div key={detail.id}>
                  <label className={styles.fieldLabel} style={{ fontSize: 12, fontWeight: 500 }}>
                    {detail.label}
                  </label>
                  {detail.type === "textarea" ? (
                    <textarea
                      className={styles.cellInput}
                      rows={2}
                      value={state.otherDetail?.[detail.id] ?? ""}
                      onChange={(e) => updateOtherDetail(detail.id, e.target.value)}
                      disabled={readOnly}
                    />
                  ) : (
                    <input
                      className={styles.cellInput}
                      type="text"
                      value={state.otherDetail?.[detail.id] ?? ""}
                      onChange={(e) => updateOtherDetail(detail.id, e.target.value)}
                      disabled={readOnly}
                    />
                  )}
                </div>
              ))}
              {field.enablePorques && (
                <PorquesBlock
                  isOpen={isPorquesOpen("outro")}
                  rows={state.porques?.["outro"]}
                  onOpen={() => openPorques("outro", state.otherDetail?.["achado"])}
                  onHide={() => hidePorques("outro")}
                  onChangeRows={(rows) => updatePorques("outro", rows)}
                  readOnly={readOnly}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

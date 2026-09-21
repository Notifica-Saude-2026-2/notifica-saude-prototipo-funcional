import type { AnaliseField, AnaliseValues } from "../../types/analise";
import type { TableRow } from "./TableField";
import styles from "./Analise.module.css";

/** Estado de um campo "item_selector": quais itens (identificados por chave estável) estão
    marcados para virar uma análise própria na seção seguinte (ver `repeatablePerSelectedItemOf`). */
export type ItemSelectorState = Record<string, boolean>;

/** Chave estável de um item selecionável: "<fieldId da tabela de origem>#<índice da linha>"
    (ex.: "cronologia#0", "ppc#1"). Usada tanto aqui quanto na seção que consome a seleção. */
export function selectorItemKey(fieldId: string, index: number): string {
  return `${fieldId}#${index}`;
}

export function parseSelectorItemKey(key: string): { fieldId: string; index: number } {
  const sep = key.lastIndexOf("#");
  return { fieldId: key.slice(0, sep), index: Number(key.slice(sep + 1)) };
}

type SelectorCard = { key: string; title: string; text: string };

/** Monta a lista de cards selecionáveis a partir das tabelas de origem declaradas no campo
    (ex.: Cronologia + PPC da Seção 3) — reaproveitado pela própria seção seguinte pra resolver
    o que cada item selecionado significa. */
export function buildSelectorCards(field: AnaliseField, values: AnaliseValues): SelectorCard[] {
  const sources = field.selectorSources ?? [];
  return sources.flatMap((source) => {
    const rows = (values[source.fieldId] as TableRow[] | undefined) ?? [];
    return rows.map((row, index) => ({
      key: selectorItemKey(source.fieldId, index),
      title: `${source.itemLabel} ${index + 1}`,
      text: (row[source.textColumnId] as string | undefined)?.trim() ?? "",
    }));
  });
}

type Props = {
  field: AnaliseField;
  value: ItemSelectorState | undefined;
  onChange: (value: ItemSelectorState) => void;
  values: AnaliseValues;
  readOnly?: boolean;
};

export function ItemSelectorField({ field, value, onChange, values, readOnly }: Props) {
  const state = value ?? {};
  const cards = buildSelectorCards(field, values);

  function toggle(key: string) {
    if (readOnly) return;
    onChange({ ...state, [key]: !state[key] });
  }

  if (cards.length === 0) {
    return (
      <p className={styles.helpText}>
        Nenhum fato da Cronologia ou PPC registrado ainda nas seções anteriores para selecionar
        aqui.
      </p>
    );
  }

  return (
    <div className={styles.checklistList}>
      {cards.map((card) => {
        const checked = !!state[card.key];
        return (
          <div
            key={card.key}
            className={`${styles.checklistItem} ${checked ? styles.checklistItemChecked : ""}`}
          >
            <div className={styles.checklistHeaderRow} onClick={() => toggle(card.key)}>
              <input
                type="checkbox"
                className={styles.checklistCheckbox}
                checked={checked}
                onChange={() => toggle(card.key)}
                onClick={(e) => e.stopPropagation()}
                disabled={readOnly}
              />
              <div>
                <div className={styles.checklistItemLabel}>{card.title}</div>
                {card.text && <p className={styles.checklistItemExample}>{card.text}</p>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

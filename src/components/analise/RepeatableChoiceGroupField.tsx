import type { AnaliseField, ItemSchemaFieldDef } from "../../types/analise";
import { TableField, type TableRow } from "./TableField";
import styles from "./Analise.module.css";

export type GroupItem = {
  id: string;
  common: Record<string, string>;
  ferramenta: string;
  schemaValues: Record<string, unknown>;
};

type Props = {
  field: AnaliseField;
  value: GroupItem[] | undefined;
  onChange: (items: GroupItem[]) => void;
  readOnly?: boolean;
};

let counter = 0;
function newItemId() {
  counter += 1;
  return `item-${Date.now()}-${counter}`;
}

export function RepeatableChoiceGroupField({ field, value, onChange, readOnly }: Props) {
  const items = value ?? [];
  const choiceField = field.itemChoiceField;
  const commonFields = field.itemCommonFields ?? [];

  function addItem() {
    onChange([...items, { id: newItemId(), common: {}, ferramenta: "", schemaValues: {} }]);
  }

  function removeItem(id: string) {
    onChange(items.filter((item) => item.id !== id));
  }

  function updateItem(id: string, patch: Partial<GroupItem>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  return (
    <div>
      {items.map((item, index) => {
        const schema = item.ferramenta ? field.itemSchemas?.[item.ferramenta] : undefined;
        return (
          <div key={item.id} className={styles.groupItemCard}>
            <div className={styles.groupItemHeader}>
              <span className={styles.groupItemTitle}>Aprofundamento {index + 1}</span>
              {!readOnly && (
                <button
                  type="button"
                  className={styles.removeItemBtn}
                  onClick={() => removeItem(item.id)}
                >
                  Remover
                </button>
              )}
            </div>

            {commonFields.map((cf) => (
              <div className={styles.fieldBlock} key={cf.id}>
                <label className={styles.fieldLabel} style={{ fontSize: 12.5 }}>
                  {cf.label}
                </label>
                <input
                  className={styles.cellInput}
                  type="text"
                  value={item.common[cf.id] ?? ""}
                  onChange={(e) =>
                    updateItem(item.id, { common: { ...item.common, [cf.id]: e.target.value } })
                  }
                  disabled={readOnly}
                />
              </div>
            ))}

            {choiceField && (
              <div className={styles.fieldBlock}>
                <label className={styles.fieldLabel} style={{ fontSize: 12.5 }}>
                  {choiceField.label}
                </label>
                {choiceField.options.map((opt) => (
                  <div
                    key={opt.value}
                    className={`${styles.toolOption} ${item.ferramenta === opt.value ? styles.toolOptionSelected : ""}`}
                    style={
                      readOnly
                        ? {
                            pointerEvents: "none",
                            opacity: item.ferramenta === opt.value ? 1 : 0.55,
                          }
                        : undefined
                    }
                    onClick={() =>
                      !readOnly && updateItem(item.id, { ferramenta: opt.value, schemaValues: {} })
                    }
                    role="radio"
                    aria-checked={item.ferramenta === opt.value}
                    tabIndex={0}
                  >
                    <div className={styles.toolOptionLabel}>{opt.label}</div>
                    {opt.when && <p className={styles.toolOptionWhen}>Use quando: {opt.when}</p>}
                  </div>
                ))}
              </div>
            )}

            {schema && (
              <div style={{ marginTop: 10 }}>
                {schema.fields.map((sf) => (
                  <ItemSchemaFieldInput
                    key={sf.id}
                    def={sf}
                    value={item.schemaValues[sf.id]}
                    onChange={(v) =>
                      updateItem(item.id, { schemaValues: { ...item.schemaValues, [sf.id]: v } })
                    }
                    readOnly={readOnly}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {!readOnly && (
        <button type="button" className={styles.addItemBtn} onClick={addItem}>
          + Adicionar aprofundamento
        </button>
      )}
    </div>
  );
}

function ItemSchemaFieldInput({
  def,
  value,
  onChange,
  readOnly,
}: {
  def: ItemSchemaFieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
  readOnly?: boolean;
}) {
  if (def.type === "table") {
    return (
      <div className={styles.fieldBlock}>
        <label className={styles.fieldLabel} style={{ fontSize: 12.5 }}>
          {def.label}
        </label>
        {def.helpText && <p className={styles.helpText}>{def.helpText}</p>}
        <TableField
          field={{
            id: def.id,
            label: def.label,
            type: "table",
            repeatable: def.repeatable,
            fixedRows: def.fixedRows,
            columns: def.columns,
          }}
          value={value as TableRow[] | undefined}
          onChange={(rows) => onChange(rows)}
          readOnly={readOnly}
        />
      </div>
    );
  }
  return (
    <div className={styles.fieldBlock}>
      <label className={styles.fieldLabel} style={{ fontSize: 12.5 }}>
        {def.label}
      </label>
      <textarea
        className={styles.cellInput}
        rows={def.type === "textarea" ? 3 : 1}
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={readOnly}
      />
    </div>
  );
}

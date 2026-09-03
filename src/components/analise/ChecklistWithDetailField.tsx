import type { AnaliseField } from "../../types/analise";
import styles from "./Analise.module.css";

export type ChecklistState = {
  checked: Record<string, boolean>;
  details: Record<string, Record<string, string>>;
  otherChecked?: boolean;
  otherText?: string;
  otherDetail?: Record<string, string>;
};

const EMPTY_STATE: ChecklistState = { checked: {}, details: {} };

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
            </div>
          )}
        </div>
      )}
    </div>
  );
}

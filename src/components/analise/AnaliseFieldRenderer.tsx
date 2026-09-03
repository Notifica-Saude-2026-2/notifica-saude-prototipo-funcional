import type { AnaliseField, AnaliseValues } from "../../types/analise";
import { normalizeOption } from "../../types/analise";
import { evalCondition } from "./condition";
import { TableField, type TableRow } from "./TableField";
import { ChecklistWithDetailField, type ChecklistState } from "./ChecklistWithDetailField";
import { RepeatableChoiceGroupField, type GroupItem } from "./RepeatableChoiceGroupField";
import { IshikawaDiagram } from "./IshikawaDiagram";
import styles from "./Analise.module.css";

export type MultiChoiceWithOtherValue = { selected: string[]; outro?: string };

type Props = {
  field: AnaliseField;
  value: unknown;
  onChange: (value: unknown) => void;
  /** Todos os valores do fluxo atual — necessário para `computed` e `disabledIf` de opções. */
  values: AnaliseValues;
  /** Todos os campos da seção atual — necessário para `computed` localizar seu campo de origem. */
  siblingFields?: AnaliseField[];
  /** Resumo pronto para o campo readonly "resumo_notificacao". */
  resumoNotificacao?: React.ReactNode;
  /** Modo de visualização — desabilita edição em todos os tipos de campo. */
  readOnly?: boolean;
  "data-testid"?: string;
};

export function AnaliseFieldRenderer({
  field,
  value,
  onChange,
  values,
  siblingFields,
  resumoNotificacao,
  readOnly,
  "data-testid": dataTestId,
}: Props) {
  const testId = dataTestId ?? `field-${field.id}`;

  switch (field.type) {
    case "info":
      return (
        <div className={styles.infoBox} data-testid={testId}>
          {field.label}
        </div>
      );

    case "readonly":
      return (
        <div className={styles.readonlyBox} data-testid={testId}>
          {resumoNotificacao ?? field.source ?? "—"}
        </div>
      );

    case "text":
      return (
        <input
          className={styles.cellInput}
          type="text"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={readOnly}
          data-testid={testId}
        />
      );

    case "textarea":
      return (
        <textarea
          className={styles.cellInput}
          rows={3}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={readOnly}
          data-testid={testId}
        />
      );

    case "date":
      return (
        <input
          className={styles.cellInput}
          style={{ maxWidth: 220 }}
          type="date"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={readOnly}
          data-testid={testId}
        />
      );

    case "time":
      return (
        <input
          className={styles.cellInput}
          style={{ maxWidth: 160 }}
          type="time"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={readOnly}
          data-testid={testId}
        />
      );

    case "choice": {
      const options = (field.options ?? []).map(normalizeOption);
      const multiple = !!field.multiple;

      if (multiple && field.allowOther) {
        const state = (value as MultiChoiceWithOtherValue) ?? { selected: [], outro: "" };
        const selected = state.selected ?? [];
        const toggle = (v: string) =>
          onChange({
            ...state,
            selected: selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v],
          });
        return (
          <div className={styles.checklistList} data-testid={testId}>
            {options.map((opt) => (
              <ChoiceRow
                key={opt.value}
                type="checkbox"
                label={opt.label}
                checked={selected.includes(opt.value)}
                onChange={() => toggle(opt.value)}
                disabled={readOnly}
                testId={`${testId}-option-${opt.value}`}
              />
            ))}
            <ChoiceRow
              type="checkbox"
              label={field.otherLabel ?? "Outro"}
              checked={selected.includes("OUTRO")}
              onChange={() => toggle("OUTRO")}
              disabled={readOnly}
              testId={`${testId}-option-outro`}
            >
              {selected.includes("OUTRO") && (
                <input
                  className={styles.cellInput}
                  type="text"
                  placeholder="Especifique..."
                  value={state.outro ?? ""}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onChange({ ...state, outro: e.target.value })}
                  disabled={readOnly}
                />
              )}
            </ChoiceRow>
          </div>
        );
      }

      if (multiple) {
        const selected = (value as string[]) ?? [];
        return (
          <div className={styles.checklistList} data-testid={testId}>
            {options.map((opt) => {
              const disabled =
                readOnly || (opt.disabledIf ? evalCondition(values, opt.disabledIf) : false);
              return (
                <ChoiceRow
                  key={opt.value}
                  type="checkbox"
                  label={opt.label}
                  tooltip={disabled ? opt.disabledReason : opt.tooltip}
                  disabled={disabled}
                  checked={selected.includes(opt.value)}
                  onChange={() =>
                    onChange(
                      selected.includes(opt.value)
                        ? selected.filter((v) => v !== opt.value)
                        : [...selected, opt.value],
                    )
                  }
                  testId={`${testId}-option-${opt.value}`}
                />
              );
            })}
          </div>
        );
      }

      const selectedValue = (value as string) ?? "";
      return (
        <div className={styles.checklistList} data-testid={testId}>
          {options.map((opt) => {
            const disabled =
              readOnly || (opt.disabledIf ? evalCondition(values, opt.disabledIf) : false);
            return (
              <ChoiceRow
                key={opt.value}
                type="radio"
                label={opt.label}
                tooltip={disabled ? opt.disabledReason : opt.tooltip}
                disabled={disabled}
                checked={selectedValue === opt.value}
                onChange={() => onChange(opt.value)}
                testId={`${testId}-option-${opt.value}`}
              />
            );
          })}
        </div>
      );
    }

    case "table":
      return (
        <TableField
          field={field}
          value={value as TableRow[] | undefined}
          onChange={(rows) => onChange(rows)}
          readOnly={readOnly}
          data-testid={testId}
        />
      );

    case "checklist_with_detail":
      return (
        <ChecklistWithDetailField
          field={field}
          value={value as ChecklistState | undefined}
          onChange={(v) => onChange(v)}
          readOnly={readOnly}
          data-testid={testId}
        />
      );

    case "computed": {
      const sourceField = siblingFields?.find((f) => f.id === field.generatedFrom);
      const sourceValue = sourceField
        ? (values[sourceField.id] as ChecklistState | undefined)
        : undefined;
      return <IshikawaDiagram field={field} sourceField={sourceField} sourceValue={sourceValue} />;
    }

    case "repeatable_choice_group":
      return (
        <RepeatableChoiceGroupField
          field={field}
          value={value as GroupItem[] | undefined}
          onChange={(items) => onChange(items)}
          readOnly={readOnly}
        />
      );

    default:
      return null;
  }
}

function ChoiceRow({
  type,
  label,
  checked,
  onChange,
  disabled,
  tooltip,
  testId,
  children,
}: {
  type: "radio" | "checkbox";
  label: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  tooltip?: string;
  testId: string;
  children?: React.ReactNode;
}) {
  return (
    <label
      className={`${styles.checklistItem} ${checked ? styles.checklistItemChecked : ""}`}
      style={{ display: "flex", gap: 10, alignItems: "flex-start", opacity: disabled ? 0.5 : 1 }}
      title={tooltip}
    >
      <input
        type={type}
        className={styles.checklistCheckbox}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        data-testid={testId}
      />
      <div style={{ flex: 1 }}>
        <span className={styles.checklistItemLabel}>{label}</span>
        {children}
      </div>
    </label>
  );
}

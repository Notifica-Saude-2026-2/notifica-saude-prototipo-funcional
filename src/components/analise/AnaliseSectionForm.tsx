import type { AnaliseSectionSchema, AnaliseValues } from "../../types/analise";
import { evalCondition } from "./condition";
import { AnaliseFieldRenderer } from "./AnaliseFieldRenderer";
import type { TableRow } from "./TableField";
import styles from "./Analise.module.css";

type Props = {
  section: AnaliseSectionSchema;
  values: AnaliseValues;
  onFieldChange: (fieldId: string, value: unknown) => void;
  resumoNotificacao?: React.ReactNode;
  /** Modo de visualização — desabilita todos os campos da seção (usado no resumo pós-análise). */
  readOnly?: boolean;
};

export function AnaliseSectionForm({
  section,
  values,
  onFieldChange,
  resumoNotificacao,
  readOnly,
}: Props) {
  if (section.repeatablePerItemOf) {
    return (
      <RepeatablePerItemSection
        section={section}
        values={values}
        onFieldChange={onFieldChange}
        resumoNotificacao={resumoNotificacao}
        readOnly={readOnly}
      />
    );
  }

  const visibleFields = section.fields.filter(
    (f) => !f.visibleIf || evalCondition(values, f.visibleIf),
  );

  return (
    <div>
      {section.description && <p className={styles.sectionDescription}>{section.description}</p>}
      {visibleFields.map((field) => (
        <div className={styles.fieldBlock} key={field.id}>
          {field.type !== "info" && <label className={styles.fieldLabel}>{field.label}</label>}
          {field.helpText && <p className={styles.helpText}>{field.helpText}</p>}
          {field.description && <p className={styles.helpText}>{field.description}</p>}
          <AnaliseFieldRenderer
            field={field}
            value={values[field.id]}
            onChange={(v) => onFieldChange(field.id, v)}
            values={values}
            siblingFields={section.fields}
            resumoNotificacao={field.id === "resumo_notificacao" ? resumoNotificacao : undefined}
            readOnly={readOnly}
          />
        </div>
      ))}
    </div>
  );
}

/** Seção que se repete uma vez por linha de uma tabela referenciada (ex.: um fatores_contribuintes por PPC). */
function RepeatablePerItemSection({
  section,
  values,
  onFieldChange,
  resumoNotificacao,
  readOnly,
}: Props) {
  const [, refFieldId] = (section.repeatablePerItemOf ?? "").split(".");
  const refRows = (values[refFieldId] as TableRow[] | undefined) ?? [];
  const perInstance = (values[section.id] as Record<string, unknown>[] | undefined) ?? [];

  function updateInstance(index: number, fieldId: string, value: unknown) {
    const next = refRows.map((_, i) => perInstance[i] ?? {});
    next[index] = { ...next[index], [fieldId]: value };
    onFieldChange(section.id, next);
  }

  if (refRows.length === 0) {
    return (
      <p className={styles.helpText}>
        Cadastre ao menos um item na seção anterior para poder registrar os fatores contribuintes
        vinculados.
      </p>
    );
  }

  return (
    <div>
      {section.description && <p className={styles.sectionDescription}>{section.description}</p>}
      {refRows.map((row, index) => {
        const instanceValues = perInstance[index] ?? {};
        const ppcLabel = row.numero || `#${index + 1}`;
        return (
          <div key={index} className={styles.groupItemCard}>
            <div className={styles.groupItemHeader}>
              <span className={styles.groupItemTitle}>PPC {ppcLabel}</span>
            </div>
            {row.ocorrido && <p className={styles.helpText}>{row.ocorrido}</p>}
            {section.fields.map((field) => {
              const value =
                field.id === "ppc_referencia"
                  ? (instanceValues[field.id] ?? String(ppcLabel))
                  : instanceValues[field.id];
              return (
                <div className={styles.fieldBlock} key={field.id}>
                  <label className={styles.fieldLabel}>{field.label}</label>
                  <AnaliseFieldRenderer
                    field={field}
                    value={value}
                    onChange={(v) => updateInstance(index, field.id, v)}
                    values={values}
                    siblingFields={section.fields}
                    resumoNotificacao={
                      field.id === "resumo_notificacao" ? resumoNotificacao : undefined
                    }
                    readOnly={readOnly}
                  />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

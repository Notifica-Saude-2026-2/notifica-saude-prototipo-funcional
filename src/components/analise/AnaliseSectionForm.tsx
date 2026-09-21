import type { AnaliseSectionSchema, AnaliseValues } from "../../types/analise";
import { evalCondition } from "./condition";
import { AnaliseFieldRenderer } from "./AnaliseFieldRenderer";
import { InfoTooltip } from "../common/ui/InfoTooltip";
import type { TableRow } from "./TableField";
import { parseSelectorItemKey, type ItemSelectorState } from "./ItemSelectorField";
import styles from "./Analise.module.css";

type Props = {
  section: AnaliseSectionSchema;
  values: AnaliseValues;
  onFieldChange: (fieldId: string, value: unknown) => void;
  resumoNotificacao?: React.ReactNode;
  /** Modo de visualização — desabilita todos os campos da seção (usado no resumo pós-análise). */
  readOnly?: boolean;
  /** Todas as seções do fluxo ativo — necessário para `repeatablePerSelectedItemOf` localizar o
      campo "item_selector" (que pode estar numa seção anterior) e suas `selectorSources`. */
  allSections?: AnaliseSectionSchema[];
};

export function AnaliseSectionForm({
  section,
  values,
  onFieldChange,
  resumoNotificacao,
  readOnly,
  allSections,
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

  if (section.repeatablePerSelectedItemOf) {
    return (
      <RepeatablePerSelectedItemSection
        section={section}
        values={values}
        onFieldChange={onFieldChange}
        resumoNotificacao={resumoNotificacao}
        readOnly={readOnly}
        allSections={allSections}
      />
    );
  }

  const visibleFields = section.fields.filter(
    (f) => !f.visibleIf || evalCondition(values, f.visibleIf),
  );

  return (
    <div>
      {visibleFields.map((field) => (
        <div className={styles.fieldBlock} key={field.id}>
          {field.type !== "info" && (
            <label className={styles.fieldLabel}>
              {field.label}
              {field.required && <span className={styles.required}>*</span>}
              {(field.helpText || field.helpTextItems) && (
                <span style={{ marginLeft: 6, display: "inline-flex" }}>
                  <InfoTooltip text={field.helpText} items={field.helpTextItems} />
                </span>
              )}
            </label>
          )}
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

/**
 * Seção que se repete uma vez por item MARCADO num campo "item_selector" de seção anterior (ex.:
 * a Seção 4A por fato da Cronologia / PPC selecionado na Seção 4) — diferente de
 * RepeatablePerItemSection, que gera 1 bloco por linha de UMA tabela, sem etapa de seleção.
 *
 * Guarda os valores por item numa chave estável ("<tabela de origem>#<índice>"), não por posição,
 * já que os itens vêm de duas tabelas diferentes (Cronologia + PPC) e a seleção é esparsa.
 */
function RepeatablePerSelectedItemSection({
  section,
  values,
  onFieldChange,
  resumoNotificacao,
  readOnly,
  allSections,
}: Props) {
  const selectorFieldId = section.repeatablePerSelectedItemOf ?? "";
  const selectorField = allSections?.flatMap((s) => s.fields).find((f) => f.id === selectorFieldId);
  const selection = (values[selectorFieldId] as ItemSelectorState | undefined) ?? {};
  const selectedKeys = Object.keys(selection).filter((key) => selection[key]);
  const perItem = (values[section.id] as Record<string, Record<string, unknown>> | undefined) ?? {};

  function updateInstance(key: string, fieldId: string, value: unknown) {
    onFieldChange(section.id, { ...perItem, [key]: { ...perItem[key], [fieldId]: value } });
  }

  if (!selectorField) {
    return (
      <p className={styles.helpText}>
        Não foi possível localizar o campo de seleção de itens ({selectorFieldId}).
      </p>
    );
  }

  if (selectedKeys.length === 0) {
    return (
      <p className={styles.helpText}>
        Nenhum item foi marcado na seção anterior para investigar como fator contribuinte. Volte lá
        e selecione ao menos um fato da Cronologia ou PPC, se aplicável.
      </p>
    );
  }

  return (
    <div>
      {selectedKeys.map((key) => {
        const { fieldId, index } = parseSelectorItemKey(key);
        const source = selectorField.selectorSources?.find((s) => s.fieldId === fieldId);
        const row = (values[fieldId] as TableRow[] | undefined)?.[index];
        const title = source ? `${source.itemLabel} ${index + 1}` : key;
        const previewText =
          source && row ? (row[source.textColumnId] as string | undefined) : undefined;
        const instanceValues = perItem[key] ?? {};
        return (
          <div key={key} className={styles.groupItemCard}>
            <div className={styles.groupItemHeader}>
              <span className={styles.groupItemTitle}>Item em análise: {title}</span>
            </div>
            {previewText && <p className={styles.helpText}>{previewText}</p>}
            {section.fields.map((field) => (
              <div className={styles.fieldBlock} key={field.id}>
                <label className={styles.fieldLabel}>
                  {field.label}
                  {(field.helpText || field.helpTextItems) && (
                    <span style={{ marginLeft: 6, display: "inline-flex" }}>
                      <InfoTooltip text={field.helpText} items={field.helpTextItems} />
                    </span>
                  )}
                </label>
                <AnaliseFieldRenderer
                  field={field}
                  value={instanceValues[field.id]}
                  onChange={(v) => updateInstance(key, field.id, v)}
                  values={values}
                  siblingFields={section.fields}
                  resumoNotificacao={
                    field.id === "resumo_notificacao" ? resumoNotificacao : undefined
                  }
                  readOnly={readOnly}
                />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

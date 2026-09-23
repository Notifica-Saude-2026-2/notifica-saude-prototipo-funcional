import type { AnaliseSectionSchema, AnaliseValues } from "../../types/analise";
import { evalCondition } from "./condition";
import { AnaliseFieldRenderer } from "./AnaliseFieldRenderer";
import { InfoTooltip } from "../common/ui/InfoTooltip";
import { SectionInfoBox } from "./SectionInfoBox";
import { MdWarningAmber } from "react-icons/md";
import { FiChevronDown } from "react-icons/fi";
import { useEffect, useState } from "react";
import type { ChecklistState } from "./ChecklistWithDetailField";
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
  /** Pendências por campo (só presentes depois de tentar avançar) — o campo fica destacado em
      vermelho com a mensagem do que falta logo abaixo. Ver validacao.ts. */
  pendencias?: Record<string, { message: string; cells?: string[] }[]>;
};

export function AnaliseSectionForm({
  section,
  values,
  onFieldChange,
  resumoNotificacao,
  readOnly,
  allSections,
  pendencias,
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
        pendencias={pendencias}
      />
    );
  }

  const visibleFields = section.fields.filter(
    (f) => !f.visibleIf || evalCondition(values, f.visibleIf),
  );

  return (
    <div>
      {visibleFields.map((field) => {
        const erros = pendencias?.[field.id];
        const celulasInvalidas = erros?.flatMap((e) => e.cells ?? []);
        return (
          <div
            className={
              erros && field.type !== "table"
                ? `${styles.fieldBlock} ${styles.fieldBlockError}`
                : styles.fieldBlock
            }
            key={field.id}
            data-pendencia={erros ? "true" : undefined}
          >
            {field.type !== "info" && (
              <label className={styles.fieldLabel}>
                {field.label}
                {field.required && <span className={styles.required}>*</span>}
                {(field.helpText || field.helpTextItems) && !field.helpTextInline && (
                  <span style={{ marginLeft: 6, display: "inline-flex" }}>
                    <InfoTooltip text={field.helpText} items={field.helpTextItems} />
                  </span>
                )}
              </label>
            )}
            {field.helpTextInline && (field.helpText || field.helpTextItems) && !readOnly && (
              <SectionInfoBox className={styles.sectionInfoBoxField}>
                {field.helpText && <p className={styles.sectionInfoParagraph}>{field.helpText}</p>}
                {field.helpTextItems && field.helpTextItems.length > 0 && (
                  <ul className={styles.sectionInfoList}>
                    {field.helpTextItems.map((item, i) => (
                      <li key={i}>
                        {item.label && <strong>{item.label}: </strong>}
                        {item.description}
                      </li>
                    ))}
                  </ul>
                )}
              </SectionInfoBox>
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
              invalidCells={celulasInvalidas}
            />
            {erros?.map((e, i) => (
              <p key={i} className={styles.fieldErrorMessage} role="alert">
                <MdWarningAmber size={15} aria-hidden="true" /> {e.message}
              </p>
            ))}
          </div>
        );
      })}
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
  pendencias,
}: Props) {
  const selectorFieldId = section.repeatablePerSelectedItemOf ?? "";
  const selectorField = allSections?.flatMap((s) => s.fields).find((f) => f.id === selectorFieldId);
  const selection = (values[selectorFieldId] as ItemSelectorState | undefined) ?? {};
  const selectedKeys = Object.keys(selection).filter((key) => selection[key]);
  const perItem = (values[section.id] as Record<string, Record<string, unknown>> | undefined) ?? {};

  function updateInstance(key: string, fieldId: string, value: unknown) {
    onFieldChange(section.id, { ...perItem, [key]: { ...perItem[key], [fieldId]: value } });
  }

  // Cada item em análise é colapsável (ocupam muito espaço). Por padrão só o primeiro vem aberto.
  const [abertos, setAbertos] = useState<Record<string, boolean>>({});
  const estaAberto = (key: string, i: number) => abertos[key] ?? i === 0;
  const alternar = (key: string, i: number) =>
    setAbertos((a) => ({ ...a, [key]: !(a[key] ?? i === 0) }));

  // Ao clicar em "Próximo" com pendências, abre os itens que têm algo a corrigir — senão os campos
  // destacados ficariam escondidos dentro de um item fechado.
  const comPendencia = selectedKeys.filter((key) =>
    section.fields.some((f) => pendencias?.[`${section.id}:${key}:${f.id}`]),
  );
  const chaveComPendencia = comPendencia.join("|");
  useEffect(() => {
    if (!chaveComPendencia) return;
    setAbertos((a) => {
      const faltando = chaveComPendencia.split("|").filter((k) => !a[k]);
      if (faltando.length === 0) return a;
      return { ...a, ...Object.fromEntries(faltando.map((k) => [k, true])) };
    });
  }, [chaveComPendencia]);

  /** Resumo exibido no cabeçalho do item: quantos fatores foram marcados. */
  function resumoItem(instance: Record<string, unknown>) {
    const checklist = section.fields.find((f) => f.type === "checklist_with_detail");
    if (!checklist) return null;
    const st = instance[checklist.id] as ChecklistState | undefined;
    const n = Object.values(st?.checked ?? {}).filter(Boolean).length + (st?.otherChecked ? 1 : 0);
    if (n === 0) return "Nenhum fator marcado";
    return n === 1 ? "1 fator marcado" : `${n} fatores marcados`;
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
      {selectedKeys.length > 1 && (
        <div className={styles.collapseAllRow}>
          <button
            type="button"
            className={styles.collapseAllBtn}
            onClick={() => setAbertos(Object.fromEntries(selectedKeys.map((k) => [k, true])))}
          >
            Expandir todos
          </button>
          <button
            type="button"
            className={styles.collapseAllBtn}
            onClick={() => setAbertos(Object.fromEntries(selectedKeys.map((k) => [k, false])))}
          >
            Recolher todos
          </button>
        </div>
      )}
      {selectedKeys.map((key, itemIndex) => {
        const { fieldId, index } = parseSelectorItemKey(key);
        const source = selectorField.selectorSources?.find((s) => s.fieldId === fieldId);
        const row = (values[fieldId] as TableRow[] | undefined)?.[index];
        const title = source ? `${source.itemLabel} ${index + 1}` : key;
        const previewText =
          source && row ? (row[source.textColumnId] as string | undefined) : undefined;
        const instanceValues = perItem[key] ?? {};
        const aberto = estaAberto(key, itemIndex);
        const resumo = resumoItem(instanceValues);
        const pendente = comPendencia.includes(key);
        return (
          <div key={key} className={styles.groupItemCard}>
            <button
              type="button"
              className={styles.collapseHeader}
              onClick={() => alternar(key, itemIndex)}
              aria-expanded={aberto}
              data-testid={`item-analise-${key}-toggle`}
            >
              <FiChevronDown
                size={18}
                aria-hidden="true"
                className={`${styles.collapseChevron} ${aberto ? styles.collapseChevronOpen : ""}`}
              />
              <span className={styles.collapseHeaderText}>
                <span className={styles.groupItemTitle}>Item em análise: {title}</span>
                {previewText && <span className={styles.collapsePreview}>{previewText}</span>}
              </span>
              {resumo && (
                <span
                  className={`${styles.collapseBadge} ${pendente ? styles.collapseBadgeError : ""}`}
                >
                  {pendente ? "Pendências" : resumo}
                </span>
              )}
            </button>
            {aberto && (
              <div className={styles.collapseBody}>
                {section.fields.map((field) => {
                  // Pendências deste item (ver validacao.ts: "<seção>:<item>:<campo>").
                  const erros = pendencias?.[`${section.id}:${key}:${field.id}`];
                  const celulas = erros?.flatMap((e) => e.cells ?? []);
                  // Sem células = erro do campo inteiro (ex.: nenhum fator marcado) → borda vermelha
                  // em tudo; com células, só os campos com problema ficam vermelhos.
                  const erroGeral = erros?.some((e) => !e.cells?.length);
                  return (
                    <div
                      className={
                        erroGeral
                          ? `${styles.fieldBlock} ${styles.fieldBlockError}`
                          : styles.fieldBlock
                      }
                      key={field.id}
                      data-pendencia={erros ? "true" : undefined}
                    >
                      <label className={styles.fieldLabel}>
                        {field.label}
                        {field.required && !readOnly && <span className={styles.required}>*</span>}
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
                        invalidCells={celulas}
                      />
                      {erros?.map((e, i) => (
                        <p key={i} className={styles.fieldErrorMessage} role="alert">
                          <MdWarningAmber size={15} aria-hidden="true" /> {e.message}
                        </p>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

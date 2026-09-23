import { useState } from "react";
import { MdWarningAmber } from "react-icons/md";
import type { AnaliseField } from "../../types/analise";
import { FIVE_WHYS_NIVEIS_COLUMNS } from "../../constants/analiseSchema";
import { TableField, type TableRow } from "./TableField";
import styles from "./Analise.module.css";
import { OUTRO_MAX_LENGTH, PORQUES_MAX_NIVEIS, PORQUES_MIN_NIVEIS } from "../../constants/limites";
import { SectionInfoBox } from "./SectionInfoBox";

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
  onRemove,
  onChangeRows,
  readOnly,
  invalidCells,
}: {
  invalidCells?: string[];
  isOpen: boolean;
  rows: TableRow[] | undefined;
  onOpen: () => void;
  onRemove: () => void;
  onChangeRows: (rows: TableRow[]) => void;
  readOnly?: boolean;
}) {
  // Confirmação inline antes de apagar o que já foi preenchido (ação irreversível).
  const [confirmando, setConfirmando] = useState(false);
  const temConteudo = (rows ?? []).some((r) => Object.values(r).some((v) => (v ?? "").trim()));
  function pedirRemocao() {
    if (temConteudo) setConfirmando(true);
    else onRemove();
  }
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
          <button
            type="button"
            className={styles.removeItemBtn}
            onClick={pedirRemocao}
            data-testid="porques-remover"
          >
            Remover 5 Porquês
          </button>
        )}
      </div>
      {confirmando && (
        <div className={styles.porquesConfirm} role="alertdialog" aria-live="polite">
          <MdWarningAmber size={18} aria-hidden="true" className={styles.porquesConfirmIcon} />
          <span className={styles.porquesConfirmText}>
            Remover o 5 Porquês desta categoria? Tudo o que foi preenchido nele será apagado.
          </span>
          <div className={styles.porquesConfirmActions}>
            <button
              type="button"
              className={styles.porquesConfirmCancel}
              onClick={() => setConfirmando(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={styles.porquesConfirmRemove}
              onClick={() => {
                setConfirmando(false);
                onRemove();
              }}
              data-testid="porques-remover-confirmar"
            >
              Remover
            </button>
          </div>
        </div>
      )}
      {!readOnly && (
        <SectionInfoBox className={styles.sectionInfoBoxField}>
          <p className={styles.sectionInfoParagraph}>
            O <strong>5 Porquês</strong> ajuda a chegar à causa raiz: pergunte &quot;por que isso
            aconteceu?&quot; e, a cada resposta, pergunte &quot;por quê?&quot; de novo — em geral
            até umas 5 vezes (no máximo {PORQUES_MAX_NIVEIS} níveis). Assim a análise vai além do
            que aconteceu na superfície (ex.: &quot;o paciente caiu&quot;) e chega à falha no
            processo ou no sistema que permitiu o incidente — que é onde as ações de melhoria
            realmente evitam que ele se repita.
          </p>
        </SectionInfoBox>
      )}
      <TableField
        field={{
          id: "porques",
          label: "Níveis de 'Por quê?'",
          type: "table",
          repeatable: true,
          itemLabel: "Porquê",
          addButtonLabel: "+ Adicionar porquê",
          // Um nível por linha (Nível · Por que aconteceu? · Resposta · Evidência), como a
          // cronologia — fica mais fácil acompanhar a cadeia de porquês de cima pra baixo.
          layout: "table",
          // Opcional, mas cada nível criado precisa ter todas as colunas preenchidas.
          requireCompleteRows: true,
          // De 1 a 15 níveis: o último nível não pode ser removido (para descartar, use
          // "Remover 5 Porquês") e o botão de adicionar trava no 15º.
          minRows: PORQUES_MIN_NIVEIS,
          maxRows: PORQUES_MAX_NIVEIS,
          lockMinRows: true,
          columns: FIVE_WHYS_NIVEIS_COLUMNS,
        }}
        value={rows}
        onChange={onChangeRows}
        readOnly={readOnly}
        invalidCells={invalidCells}
      />
    </div>
  );
}

type Props = {
  field: AnaliseField;
  value: ChecklistState | undefined;
  onChange: (value: ChecklistState) => void;
  readOnly?: boolean;
  /** Campos com pendência (ver validacao.ts): "det:<categoria>:<campo>", "outro:texto",
      "porq:<categoria>:<linha>:<coluna>". */
  invalidCells?: string[];
  "data-testid"?: string;
};

export function ChecklistWithDetailField({
  field,
  value,
  onChange,
  readOnly,
  invalidCells,
  "data-testid": dataTestId,
}: Props) {
  const invalido = (cell: string) => !!invalidCells?.includes(cell);
  const classeCampo = (cell: string) =>
    invalido(cell) ? `${styles.cellInput} ${styles.cellInputError}` : styles.cellInput;
  /** Células do 5 Porquês de uma categoria, no formato da TableField ("linha:coluna"). */
  const celulasPorques = (cat: string) =>
    (invalidCells ?? [])
      .filter((c) => c.startsWith(`porq:${cat}:`))
      .map((c) => c.slice(`porq:${cat}:`.length));
  const obrigatorio = !!field.required && !readOnly;
  const asterisco = obrigatorio ? <span className={styles.required}>*</span> : null;
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

  /** Remove o 5 Porquês da categoria: apaga os níveis preenchidos e fecha o bloco (volta a
      mostrar o botão "Por que isso aconteceu?"). */
  function removePorques(itemId: string) {
    setExpandedPorques((e) => ({ ...e, [itemId]: false }));
    const { [itemId]: _removido, ...resto } = state.porques ?? {};
    onChange({ ...state, porques: resto });
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
                      {asterisco}
                    </label>
                    {detail.type === "textarea" ? (
                      <textarea
                        className={classeCampo(`det:${item.id}:${detail.id}`)}
                        rows={2}
                        placeholder={
                          readOnly ? undefined : (detail.placeholder ?? "Digite aqui...")
                        }
                        value={state.details[item.id]?.[detail.id] ?? ""}
                        onChange={(e) => updateDetail(item.id, detail.id, e.target.value)}
                        disabled={readOnly}
                        data-testid={
                          dataTestId ? `${dataTestId}-${item.id}-${detail.id}` : undefined
                        }
                      />
                    ) : (
                      <input
                        className={classeCampo(`det:${item.id}:${detail.id}`)}
                        type="text"
                        placeholder={
                          readOnly ? undefined : (detail.placeholder ?? "Digite aqui...")
                        }
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
              <div className={styles.porquesIndent}>
                <PorquesBlock
                  isOpen={isPorquesOpen(item.id)}
                  rows={state.porques?.[item.id]}
                  onOpen={() => openPorques(item.id, state.details[item.id]?.["achado"])}
                  onRemove={() => removePorques(item.id)}
                  onChangeRows={(rows) => updatePorques(item.id, rows)}
                  readOnly={readOnly}
                  invalidCells={celulasPorques(item.id)}
                />
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
              <div>
                <input
                  className={classeCampo("outro:texto")}
                  type="text"
                  placeholder="Descreva a categoria não mapeada..."
                  value={state.otherText ?? ""}
                  onChange={(e) => onChange({ ...state, otherText: e.target.value })}
                  disabled={readOnly}
                  data-testid={dataTestId ? `${dataTestId}-outro-texto` : undefined}
                />
                {!readOnly && (
                  <div
                    className={`${styles.charCounter} ${(state.otherText ?? "").length > OUTRO_MAX_LENGTH ? styles.charCounterOver : ""}`}
                  >
                    {(state.otherText ?? "").length}/{OUTRO_MAX_LENGTH}
                  </div>
                )}
              </div>
              {detailFields.map((detail) => (
                <div key={detail.id}>
                  <label className={styles.fieldLabel} style={{ fontSize: 12, fontWeight: 500 }}>
                    {detail.label}
                    {asterisco}
                  </label>
                  {detail.type === "textarea" ? (
                    <textarea
                      className={classeCampo(`det:outro:${detail.id}`)}
                      rows={2}
                      placeholder={readOnly ? undefined : (detail.placeholder ?? "Digite aqui...")}
                      value={state.otherDetail?.[detail.id] ?? ""}
                      onChange={(e) => updateOtherDetail(detail.id, e.target.value)}
                      disabled={readOnly}
                    />
                  ) : (
                    <input
                      className={classeCampo(`det:outro:${detail.id}`)}
                      type="text"
                      placeholder={readOnly ? undefined : (detail.placeholder ?? "Digite aqui...")}
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
                  onRemove={() => removePorques("outro")}
                  onChangeRows={(rows) => updatePorques("outro", rows)}
                  readOnly={readOnly}
                  invalidCells={celulasPorques("outro")}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

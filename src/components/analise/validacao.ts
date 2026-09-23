// --------------------------------------------------------------------------
// Validação de uma seção do formulário de análise — diz O QUE está impedindo
// de avançar, campo a campo (em vez de só desabilitar o botão "Próximo").
// --------------------------------------------------------------------------

import type { AnaliseSectionSchema, AnaliseValues } from "../../types/analise";
import { normalizeOption } from "../../types/analise";
import { OUTRO_MAX_LENGTH, PORQUES_MAX_NIVEIS } from "../../constants/limites";
import { evalCondition } from "./condition";
import type { TableRow } from "./TableField";
import type { MultiChoiceWithOtherValue } from "./AnaliseFieldRenderer";
import type { ChecklistState } from "./ChecklistWithDetailField";
import { FIVE_WHYS_NIVEIS_COLUMNS } from "../../constants/analiseSchema";

/** Um problema que impede de avançar de seção. */
export type Pendencia = {
  fieldId: string;
  /** Rótulo do campo, usado no aviso (toast) quando há uma pendência só. */
  label: string;
  /** Mensagem exibida logo abaixo do campo. */
  message: string;
  /** Células de tabela com problema, no formato "linha:colunaId" (ex.: "0:formacao"). */
  cells?: string[];
  /** Para células vazias: rótulo da coluna de cada célula — permite remontar a mensagem só com
      as células que continuam pendentes (ver AnaliseFlowPage). */
  cellLabels?: Record<string, string>;
};

const vazio = (v: unknown) =>
  v === undefined ||
  v === null ||
  (typeof v === "string" && !v.trim()) ||
  (Array.isArray(v) && v.length === 0);

export function listar(nomes: string[]) {
  if (nomes.length <= 1) return nomes.join("");
  return `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}`;
}

export function validarSecao(
  section: AnaliseSectionSchema,
  values: AnaliseValues,
  /** Seções do fluxo — usadas pra nomear o item em análise nas seções repetidas (ex.: "Evento 1"). */
  allSections?: AnaliseSectionSchema[],
): Pendencia[] {
  const pendencias: Pendencia[] = [];
  const add = (p: Pendencia) => pendencias.push(p);

  const repetida = !!(section.repeatablePerItemOf || section.repeatablePerSelectedItemOf);
  for (const f of repetida ? [] : section.fields) {
    if (f.type === "readonly" || f.type === "info" || f.type === "computed") continue;
    if (f.visibleIf && !evalCondition(values, f.visibleIf)) continue;
    const v = values[f.id];
    // Em seção de decisão, toda pergunta precisa de resposta.
    const obrigatorio = f.required || section.kind === "decision";

    // ---- Tabelas: linhas mínimas, células vazias, limites de caracteres e "Outro" ----
    if (f.type === "table") {
      if (!obrigatorio && !f.requireCompleteRows) continue;
      const rows = (v as TableRow[] | undefined) ?? [];
      const cols = (f.columns ?? []).filter((c) => c.type !== "auto-index");
      if (obrigatorio && rows.length === 0) {
        add({
          fieldId: f.id,
          label: f.label,
          message: `Adicione pelo menos 1 ${(f.itemLabel ?? "linha").toLowerCase()}.`,
        });
        continue;
      }
      const vazias: string[] = [];
      const colunasVazias = new Set<string>();
      const rotulos: Record<string, string> = {};
      const longas: string[] = [];
      const msgsLimite: string[] = [];
      rows.forEach((row, i) => {
        for (const col of cols) {
          const cell = row[col.id] ?? "";
          if (!cell.trim()) {
            vazias.push(`${i}:${col.id}`);
            colunasVazias.add(col.label);
            rotulos[`${i}:${col.id}`] = col.label;
            continue;
          }
          if (col.maxLength && cell.length > col.maxLength) {
            longas.push(`${i}:${col.id}`);
            msgsLimite.push(
              `${col.label}: máximo de ${col.maxLength} caracteres (atual: ${cell.length})`,
            );
          }
          if (col.type === "choice" && col.allowOther && cell.length > OUTRO_MAX_LENGTH) {
            const opcoes = (col.options ?? []).map((o) => normalizeOption(o).value);
            if (!opcoes.includes(cell)) {
              longas.push(`${i}:${col.id}`);
              msgsLimite.push(
                `${col.label} ("Outro"): máximo de ${OUTRO_MAX_LENGTH} caracteres (atual: ${cell.length})`,
              );
            }
          }
        }
      });
      if (vazias.length > 0) {
        add({
          fieldId: f.id,
          label: f.label,
          message: `Preencha ${listar([...colunasVazias])}${rows.length > 1 ? " em todas as linhas" : ""}.`,
          cells: vazias,
          cellLabels: rotulos,
        });
      }
      if (longas.length > 0) {
        add({
          fieldId: f.id,
          label: f.label,
          message: `${msgsLimite.join(" · ")}.`,
          cells: longas,
        });
      }
      continue;
    }

    // ---- Escolha múltipla com "Outro" (ex.: Fontes consultadas) ----
    if (f.type === "choice" && f.multiple && f.allowOther) {
      const st = v as MultiChoiceWithOtherValue | undefined;
      const selected = st?.selected ?? [];
      const outro = st?.outro ?? "";
      if (obrigatorio && selected.length === 0) {
        add({ fieldId: f.id, label: f.label, message: "Selecione ao menos uma opção." });
      } else if (selected.includes("OUTRO") && !outro.trim()) {
        add({ fieldId: f.id, label: f.label, message: 'Especifique a opção "Outro".' });
      } else if (selected.includes("OUTRO") && outro.length > OUTRO_MAX_LENGTH) {
        add({
          fieldId: f.id,
          label: f.label,
          message: `O texto de "Outro" deve ter no máximo ${OUTRO_MAX_LENGTH} caracteres (atual: ${outro.length}).`,
        });
      }
      continue;
    }

    // ---- Checklist de fatores com "Outro / não mapeado" (limite do texto) ----
    if (f.type === "checklist_with_detail") {
      const st = v as ChecklistState | undefined;
      const txt = st?.otherText ?? "";
      if (st?.otherChecked && txt.length > OUTRO_MAX_LENGTH) {
        add({
          fieldId: f.id,
          label: f.label,
          message: `A descrição de "${f.otherLabel ?? "Outro"}" deve ter no máximo ${OUTRO_MAX_LENGTH} caracteres (atual: ${txt.length}).`,
        });
      }
      continue;
    }

    // ---- Demais campos (texto, escolha única, data...) ----
    if (obrigatorio && vazio(v)) {
      const msg =
        f.type === "choice"
          ? f.multiple
            ? "Selecione ao menos uma opção."
            : "Selecione uma opção."
          : "Preencha este campo.";
      add({ fieldId: f.id, label: f.label, message: msg });
      continue;
    }
    if (f.maxLength && typeof v === "string" && v.length > f.maxLength) {
      add({
        fieldId: f.id,
        label: f.label,
        message: `Máximo de ${f.maxLength} caracteres (atual: ${v.length}).`,
      });
    }
  }

  // Seção repetida por item selecionado (ex.: 4A) — valida cada item em análise separadamente.
  // O fieldId da pendência é "<seção>:<chave do item>:<campo>" (ver AnaliseSectionForm) e as
  // células usam prefixos próprios do checklist: "det:<categoria>:<campo>", "outro:texto" e
  // "porq:<categoria>:<linha>:<coluna>".
  if (section.repeatablePerSelectedItemOf) {
    const selectorId = section.repeatablePerSelectedItemOf;
    const selecao = (values[selectorId] as Record<string, boolean> | undefined) ?? {};
    const chaves = Object.keys(selecao).filter((k) => selecao[k]);
    const porItem = (values[section.id] as Record<string, Record<string, unknown>>) ?? {};
    const fontes = (allSections ?? [])
      .flatMap((s) => s.fields)
      .find((f) => f.id === selectorId)?.selectorSources;
    const porquesCols = FIVE_WHYS_NIVEIS_COLUMNS.filter((c) => c.type !== "auto-index");

    for (const chave of chaves) {
      const inst = porItem[chave] ?? {};
      const sep = chave.lastIndexOf("#");
      const origem = fontes?.find((f) => f.fieldId === chave.slice(0, sep));
      const titulo = origem ? `${origem.itemLabel} ${Number(chave.slice(sep + 1)) + 1}` : chave;

      for (const f of section.fields) {
        if (f.type !== "checklist_with_detail") continue;
        const fieldId = `${section.id}:${chave}:${f.id}`;
        const label = `${titulo} — ${f.label}`;
        const st = (inst[f.id] as ChecklistState | undefined) ?? { checked: {}, details: {} };
        const detalhes = f.detailFields ?? [];
        const marcadas = (f.items ?? []).filter((it) => st.checked?.[it.id]).map((it) => it.id);
        if (f.allowOther && st.otherChecked) marcadas.push("outro");

        // 1) Pelo menos uma categoria marcada.
        if (f.required && marcadas.length === 0) {
          add({ fieldId, label, message: "Marque ao menos um fator contribuinte." });
          continue;
        }

        const vazias: string[] = [];
        const rotulos: Record<string, string> = {};
        const longas: string[] = [];
        const msgsLimite: string[] = [];
        const vazia = (cell: string, rotulo: string) => {
          vazias.push(cell);
          rotulos[cell] = rotulo;
        };

        for (const cat of marcadas) {
          // 2) Campos da categoria marcada (achado, fonte...) obrigatórios.
          const det = cat === "outro" ? (st.otherDetail ?? {}) : (st.details?.[cat] ?? {});
          if (cat === "outro") {
            const txt = st.otherText ?? "";
            if (!txt.trim()) vazia("outro:texto", 'a descrição da categoria "Outro"');
            else if (txt.length > OUTRO_MAX_LENGTH) {
              longas.push("outro:texto");
              msgsLimite.push(
                `A descrição de "Outro" deve ter no máximo ${OUTRO_MAX_LENGTH} caracteres (atual: ${txt.length})`,
              );
            }
          }
          for (const d of detalhes) {
            if (!(det[d.id] ?? "").trim()) vazia(`det:${cat}:${d.id}`, d.label);
          }

          // 3) 5 Porquês: opcional; se aberto, de 1 a 15 níveis, cada um completo.
          const niveis = st.porques?.[cat];
          if (niveis && niveis.length > PORQUES_MAX_NIVEIS) {
            add({
              fieldId,
              label,
              message: `O 5 Porquês pode ter no máximo ${PORQUES_MAX_NIVEIS} níveis (atual: ${niveis.length}).`,
            });
          }
          // Mínimo de 1 nível: garantido na tela (o último nível não tem "Remover"; sem níveis o
          // 5 Porquês fica fechado).
          (niveis ?? []).forEach((row, i) => {
            for (const col of porquesCols) {
              const cell = row[col.id] ?? "";
              const id = `porq:${cat}:${i}:${col.id}`;
              if (!cell.trim()) vazia(id, `5 Porquês — ${col.label}`);
              else if (col.maxLength && cell.length > col.maxLength) {
                longas.push(id);
                msgsLimite.push(
                  `5 Porquês — ${col.label}, nível ${i + 1}: máximo de ${col.maxLength} caracteres (atual: ${cell.length})`,
                );
              }
            }
          });
        }

        if (vazias.length > 0) {
          add({
            fieldId,
            label,
            message: `Preencha ${listar([...new Set(vazias.map((c) => rotulos[c]))])}.`,
            cells: vazias,
            cellLabels: rotulos,
          });
        }
        if (longas.length > 0) {
          add({ fieldId, label, message: `${msgsLimite.join(" · ")}.`, cells: longas });
        }
      }
    }
  }

  return pendencias;
}

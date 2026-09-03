import type { AnaliseCondition, AnaliseValues } from "../../types/analise";

function isEmptyValue(v: unknown): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === "string") return v.trim().length === 0;
  if (Array.isArray(v)) return v.length === 0;
  return false;
}

/** Conta os itens de um campo `choice` múltiplo, excluindo uma opção específica (ex.: "Nenhum dos anteriores"). */
function countExcluding(value: unknown, excluding: string): number {
  if (!Array.isArray(value)) return 0;
  return value.filter((v) => v !== excluding).length;
}

export function evalCondition(values: AnaliseValues, condition: AnaliseCondition): boolean {
  const current = values[condition.field];
  if ("isEmpty" in condition) {
    const empty = isEmptyValue(current);
    return condition.isEmpty ? empty : !empty;
  }
  if ("equals" in condition) {
    return current === condition.equals;
  }
  if ("countExcluding" in condition) {
    const count = countExcluding(current, condition.countExcluding);
    if (condition.gte !== undefined && count < condition.gte) return false;
    if (condition.lte !== undefined && count > condition.lte) return false;
    return true;
  }
  return true;
}

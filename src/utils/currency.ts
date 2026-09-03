/**
 * Máscara de moeda (R$) que vai se ajustando enquanto a pessoa digita — cada
 * dígito novo entra como centavo, empurrando os anteriores (padrão dos
 * campos de valor em formulários brasileiros: 1 -> R$ 0,01, 12 -> R$ 0,12,
 * 123 -> R$ 1,23, 123456 -> R$ 1.234,56).
 */
export function formatCurrencyInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const cents = Number(digits);
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Extrai o valor numérico (em reais) de uma string já formatada como moeda. */
export function parseCurrencyToNumber(formatted: string): number {
  const digits = formatted.replace(/\D/g, "");
  return digits ? Number(digits) / 100 : 0;
}

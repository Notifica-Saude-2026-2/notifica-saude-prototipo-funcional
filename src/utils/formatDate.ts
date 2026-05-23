// =============================================================================
// Utilitários de formatação de datas
// =============================================================================
//
// Use a função correta de acordo com o tipo do campo no banco de dados:
//
//   formatDateOnly  → campos @db.Date (somente data, sem timezone)
//                     O Prisma serializa como "YYYY-MM-DDT00:00:00.000Z" (midnight UTC).
//                     Parsear com `new Date()` avançaria um dia para usuários em UTC-3;
//                     por isso extraímos a parte da data diretamente da string.
//
//   formatDateTime  → campos @db.Timestamptz (data + hora com timezone)
//                     `new Date()` trata corretamente o offset incluso na string ISO.

/**
 * Para campos @db.Date (ex.: data_incidente).
 * Extrai a parte YYYY-MM-DD da string antes de qualquer conversão de timezone.
 */
export function formatDateOnly(dateStr: string): string {
  const [year, month, day] = dateStr.split("T")[0].split("-");
  return `${day}/${month}/${year}`;
}

/**
 * Para campos @db.Timestamptz (ex.: data_registro, data_classificacao).
 * Retorna data e hora formatadas no locale pt-BR usando o fuso do browser.
 */
export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const d = date.toLocaleDateString("pt-BR");
  const t = date.toLocaleTimeString("pt-BR");
  return `${d} - ${t}`;
}

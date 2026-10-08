/**
 * Status de notificação em que a classificação ainda pode ser criada ou editada.
 * Utilizado em ClassificacaoSection e NotificacaoDetalhe para controle de permissão.
 */
export const STATUS_EDITAVEIS = new Set(["NOVA", "CLASSIFICADA"]);

/** US-6.1 CA05 — o prazo para análise (RN-14) só é exibido nestes status. */
export const STATUS_COM_PRAZO_ANALISE = new Set([
  "CLASSIFICADA",
  "ENCAMINHADA_SETOR",
  "EM_ANALISE",
]);

/** US-6.1 CA06 — status finais: o incidente fica somente leitura. */
export const STATUS_FINAIS = new Set(["CONCLUIDA", "ARQUIVADA"]);

/**
 * Texto exibido no tooltip de "Edição bloqueada" — varia com o status real da notificação, em vez
 * de um texto fixo ("Notificação encaminhada ao setor") que ficava errado quando o bloqueio vinha
 * de a análise já ter começado direto pelo núcleo (sem nunca ter sido encaminhada a um setor).
 */
export function motivoEdicaoBloqueada(statusRaw: string): string {
  switch (statusRaw) {
    case "ENCAMINHADA_SETOR":
      return "Notificação encaminhada ao setor";
    case "EM_ANALISE":
      return "Análise em andamento";
    case "ANALISADA":
    case "EM_ACAO":
      return "Análise já concluída";
    case "CONCLUIDA":
      return "Incidente concluído";
    case "ARQUIVADA":
      return "Notificação arquivada";
    default:
      return "Edição bloqueada";
  }
}

import type { NotificacaoPayload } from "../types/formulario";
import { apiFetch } from "./api";

export function criarNotificacao(payload: NotificacaoPayload): Promise<void> {
  return apiFetch<void>("/api/notificacoes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

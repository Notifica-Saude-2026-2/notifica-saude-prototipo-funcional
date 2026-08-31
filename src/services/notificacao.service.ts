import type { NotificacaoPayload } from "../types/formulario";
import { criarLocal } from "./localStore";

export function criarNotificacao(payload: NotificacaoPayload): Promise<void> {
  criarLocal(payload);
  return Promise.resolve();
}

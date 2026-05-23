// =============================================================================
// Contrato definitivo do endpoint POST/PUT /api/notificacoes/:id/classificacao
// =============================================================================
//
// O backend retorna o registro Classificacao do Prisma serializado como JSON.
// Todos os campos abaixo são retornados em ambos os verbos (POST e PUT).
//
// Campos de data:
//   - data_classificacao: ISO 8601 com timezone (@db.Timestamptz) — ex: "2026-05-20T23:21:58.000Z"
//   - data_validade:      ISO 8601 com timezone (@db.Timestamptz) — pode ser null quando rascunho
//
// O campo rascunho (boolean) faz parte do contrato: o frontend o utiliza para
// exibir o badge "Classificação em andamento" e para decidir se permite edição.

export type ClassificacaoResponse = {
  id: string;
  notificacao_id: string;
  profissional_nsp_id: string;
  tipo_incidente: string | null;
  tipo_especifico: string | null;
  tipos_incidentes: string[];
  envolvidos: string[];
  grau_dano: string | null;
  observacoes: string | null;
  outro_tipo_incidente: string | null;
  outro_envolvido: string | null;
  protocolo_investigacao: string | null;
  /** true enquanto a classificação estiver incompleta (rascunho) */
  rascunho: boolean;
  /** @db.Timestamptz — ISO 8601 com timezone */
  data_classificacao: string;
  /** @db.Timestamptz — ISO 8601 com timezone; null quando rascunho=true */
  data_validade: string | null;
};

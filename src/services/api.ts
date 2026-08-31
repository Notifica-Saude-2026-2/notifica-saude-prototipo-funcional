export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, statusText: string, body: unknown) {
    super(`Erro na requisição: ${status} ${statusText}`);
    this.status = status;
    this.body = body;
  }
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  void path;
  void options;
  throw new ApiError(501, "Integração remota desativada", null);
}

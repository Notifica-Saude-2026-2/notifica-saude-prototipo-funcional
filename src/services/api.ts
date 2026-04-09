const BASE_URL = import.meta.env.VITE_API_URL ?? '';

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
  }

  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

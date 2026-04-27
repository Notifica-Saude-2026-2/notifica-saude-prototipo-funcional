import { getCookie } from '../utils/cookies';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

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
  const token = getCookie('auth_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${path}`, {
    headers,
    ...options,
  });

  if (!response.ok) {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = await response.text().catch(() => null);
    }
    throw new ApiError(response.status, response.statusText, body);
  }

  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

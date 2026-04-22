import { apiFetch } from './api';

export type LoginPayload = {
  email: string;
  senha: string;
};

export type LoginResponse = {
  token: string;
  expiresIn: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
    perfil: string;
    unidade_id: string;
    setor_id: string;
  };
};

export async function loginRequest(payload: LoginPayload): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

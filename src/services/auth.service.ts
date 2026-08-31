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
  // Protótipo local: qualquer credencial com formato válido dá acesso ao ambiente demonstrativo.
  if (!payload.email.trim() || !payload.senha.trim()) throw new Error("Informe e-mail e senha.");
  return {
    token: "sessao-local",
    expiresIn: "8h",
    usuario: {
      id: "usuario-demo",
      nome: "Administrador do protótipo",
      email: payload.email.trim(),
      perfil: "ADMINISTRADOR",
      unidade_id: "unidade-hospital-regional",
      setor_id: "setor-emergencia",
    },
  };
}

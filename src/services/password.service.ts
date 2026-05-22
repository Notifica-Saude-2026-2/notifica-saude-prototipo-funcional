import { apiFetch } from "./api";

export async function forgotPasswordRequest(email: string): Promise<void> {
  return apiFetch<void>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPasswordRequest(token: string, novaSenha: string): Promise<void> {
  return apiFetch<void>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, novaSenha }),
  });
}

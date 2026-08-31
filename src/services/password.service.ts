export async function forgotPasswordRequest(email: string): Promise<void> {
  if (!email) throw new Error("Informe um e-mail válido.");
}

export async function resetPasswordRequest(token: string, novaSenha: string): Promise<void> {
  if (!token || !novaSenha) throw new Error("Dados inválidos.");
}

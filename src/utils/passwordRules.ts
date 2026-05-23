export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;
export const PASSWORD_RULES_MESSAGE = 'A senha não atende aos requisitos mínimos de segurança.';

export const rulesList = [
  'Mínimo de 8 caracteres',
  'Ao menos uma letra maiúscula',
  'Ao menos uma letra minúscula',
  'Ao menos um número',
  'Ao menos um caractere especial',
];

export function validarSenha(senha: string): string | null {
  if (senha.length < 8) return 'A senha deve ter no mínimo 8 caracteres.';
  if (!/[A-Z]/.test(senha)) return 'A senha deve conter ao menos uma letra maiúscula.';
  if (!/[a-z]/.test(senha)) return 'A senha deve conter ao menos uma letra minúscula.';
  if (!/[0-9]/.test(senha)) return 'A senha deve conter ao menos um número.';
  if (!/[^A-Za-z0-9]/.test(senha)) return 'A senha deve conter ao menos um caractere especial.';
  return null;
}

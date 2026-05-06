import { useState, type ReactNode } from "react";
import { AuthContext, type AuthUsuario } from "./authContextDef";
import { loginRequest } from "../services/auth.service";
import { getCookie, setCookie, deleteCookie } from "../utils/cookies";

const USUARIO_KEY = "auth_usuario";

function parseExpiresIn(expiresIn: string): number | undefined {
  const num = parseInt(expiresIn, 10);
  if (isNaN(num)) return undefined;
  // se vier como segundos (ex: "3600") usa direto; se vier como horas (ex: "1h") converte
  if (expiresIn.endsWith("h")) return num * 3600;
  if (expiresIn.endsWith("m")) return num * 60;
  if (expiresIn.endsWith("d")) return num * 86400;
  return num;
}

function loadUsuario(): AuthUsuario | null {
  try {
    const raw = localStorage.getItem(USUARIO_KEY);
    return raw ? (JSON.parse(raw) as AuthUsuario) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getCookie("auth_token"));
  const [usuario, setUsuario] = useState<AuthUsuario | null>(loadUsuario);

  async function login(email: string, senha: string) {
    const data = await loginRequest({ email, senha });
    const maxAge = parseExpiresIn(data.expiresIn);
    setCookie("auth_token", data.token, maxAge);
    const u: AuthUsuario = {
      id: data.usuario.id,
      nome: data.usuario.nome,
      email: data.usuario.email,
      perfil: data.usuario.perfil,
    };
    localStorage.setItem(USUARIO_KEY, JSON.stringify(u));
    setUsuario(u);
    setIsAuthenticated(true);
  }

  function logout() {
    deleteCookie("auth_token");
    localStorage.removeItem(USUARIO_KEY);
    setUsuario(null);
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

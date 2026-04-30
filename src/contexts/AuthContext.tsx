import { useState, type ReactNode } from 'react';
import { AuthContext, type AuthUsuario } from './authContextDef';
import { loginRequest } from '../services/auth.service';
import { getCookie, setCookie, deleteCookie } from '../utils/cookies';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!getCookie('auth_token'),
  );
  const [usuario, setUsuario] = useState<AuthUsuario | null>(null);

  async function login(email: string, senha: string) {
    const data = await loginRequest({ email, senha });
    setCookie('auth_token', data.token);
    setUsuario(data.usuario);
    setIsAuthenticated(true);
  }

  function logout() {
    deleteCookie('auth_token');
    setUsuario(null);
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

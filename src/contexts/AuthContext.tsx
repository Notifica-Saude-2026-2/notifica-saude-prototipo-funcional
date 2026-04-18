import { useState, type ReactNode } from 'react';
import { AuthContext } from './authContextDef';
import { loginRequest } from '../services/auth.service';
import { getCookie, setCookie, deleteCookie } from '../utils/cookies';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!getCookie('auth_token'),
  );

  async function login(email: string, senha: string) {
    const data = await loginRequest({ email, senha });
    setCookie('auth_token', data.token);
    setIsAuthenticated(true);
  }

  function logout() {
    deleteCookie('auth_token');
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

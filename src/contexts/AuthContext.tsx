import { useState, type ReactNode } from 'react';
import { AuthContext } from './authContextDef';
import { loginRequest } from '../services/auth.service';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem('auth_token'),
  );

  async function login(email: string, senha: string) {
    const data = await loginRequest({ email, senha });
    localStorage.setItem('auth_token', data.token);
    setIsAuthenticated(true);
  }

  function logout() {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

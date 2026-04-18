import { useState, type ReactNode } from 'react';
import { AuthContext } from './authContextDef';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function login(_username: string, _password: string) {
    // TODO: trocar por chamada real
    setIsAuthenticated(true);
  }

  function logout() {
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

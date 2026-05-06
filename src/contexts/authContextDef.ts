import { createContext } from "react";

export type AuthUsuario = {
  id: string;
  nome: string;
  email: string;
  perfil: string;
};

export type AuthContextType = {
  isAuthenticated: boolean;
  usuario: AuthUsuario | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

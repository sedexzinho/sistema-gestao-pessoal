import { createContext } from 'react';
import type { AuthResponse } from '../types';

interface AuthContextType {
  usuario: AuthResponse | null;
  login: (data: AuthResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
   isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);
export type { AuthContextType };
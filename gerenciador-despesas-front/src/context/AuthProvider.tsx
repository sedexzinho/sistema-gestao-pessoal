import { useState } from 'react';
import { AuthContext } from './AuthContext';
import type { AuthResponse } from '../types';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<AuthResponse | null>(() => {
    const salvo = localStorage.getItem('usuario');
    return salvo ? JSON.parse(salvo) : null;
  });

  function login(data: AuthResponse) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data));
    setUsuario(data);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{
      usuario,
      login,
      logout,
      isAuthenticated: !!usuario
    }}>
      {children}
    </AuthContext.Provider>
  );
}
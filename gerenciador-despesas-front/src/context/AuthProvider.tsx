import { useState } from 'react'; // ← remove useEffect
import { AuthContext } from './AuthContext';
import type { AuthResponse } from '../types';

export function AuthProvider({ children }: { children: React.ReactNode }) {

  // ✅ Lazy initializer: roda 1x, síncrono, sem efeito colateral
  const [usuario, setUsuario] = useState<AuthResponse | null>(() => {
    try {
      const salvo = localStorage.getItem('usuario');
      return salvo ? JSON.parse(salvo) : null;
    } catch {
      localStorage.removeItem('usuario');
      localStorage.removeItem('token');
      return null;
    }
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
      isAuthenticated: !!usuario,
      isLoading: false, // ✅ sempre false — lazy initializer é síncrono
    }}>
      {children}
    </AuthContext.Provider>
  );
}
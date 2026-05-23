import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

interface Props {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: Props) {
  const { isAuthenticated, isLoading } = useAuth();

  // ✅ Aguarda o contexto hidratar antes de decidir
  if (isLoading) {
    return null; // ou <div>Carregando...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.titulo}>Olá, {usuario?.nome}!</h1>
        <button onClick={handleLogout} style={styles.botaoLogout}>
          Sair
        </button>
      </header>
      <main style={styles.main}>
        <p>Dashboard em construção...</p>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#4f46e5',
    color: '#fff',
  },
  titulo: {
    margin: 0,
  },
  botaoLogout: {
    padding: '0.5rem 1rem',
    backgroundColor: 'transparent',
    border: '1px solid #fff',
    color: '#fff',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  main: {
    padding: '2rem',
  },
};
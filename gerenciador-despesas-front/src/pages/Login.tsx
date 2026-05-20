import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import api from '../api/axios';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, senha });
      login(response.data);
      navigate('/dashboard');
    } catch {
      setErro('Email ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        <div style={styles.header}>
          <div style={styles.logo}>💰</div>
          <h2 style={styles.titulo}>Bem-vindo de volta</h2>
          <p style={styles.subtitulo}>Entre na sua conta para continuar</p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.grupo}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.grupo}>
            <label style={styles.label}>Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          {erro && (
            <div style={styles.erroBox}>
              <span>⚠️</span>
              <p style={styles.erroTexto}>{erro}</p>
            </div>
          )}

          <button type="submit" style={styles.botao} disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <p style={styles.linkTexto}>
            Não tem uma conta?{' '}
            <Link to="/registro" style={styles.link}>
              Criar conta
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#0D0D0D',
    padding: '2rem',
    fontFamily: "'Inter', 'Poppins', sans-serif",
  },
  card: {
    backgroundColor: '#0D0D0D',
    padding: '2.5rem',
    borderRadius: '16px',
    border: 'none',
    width: '100%',
    maxWidth: '420px',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '2rem',
    gap: '0.5rem',
  },
  logo: {
    fontSize: '2.5rem',
    marginBottom: '0.5rem',
  },
  titulo: {
    color: '#FFFFFF',
    margin: 0,
    fontSize: '1.6rem',
    fontWeight: 700,
    textAlign: 'center',
  },
  subtitulo: {
    color: '#A0A0A0',
    margin: 0,
    fontSize: '0.9rem',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  grupo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  label: {
    color: '#A0A0A0',
    fontSize: '0.85rem',
    fontWeight: 500,
  },
  input: {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid #2A2A2A',
    backgroundColor: '#0D0D0D',
    color: '#FFFFFF',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  botao: {
    padding: '0.85rem',
    backgroundColor: '#9BFF97',
    color: '#000000',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: '0.5rem',
    transition: 'background-color 0.2s',
  },
  erroBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'rgba(255, 92, 92, 0.1)',
    border: '1px solid #FF5C5C',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
  },
  erroTexto: {
    color: '#FF5C5C',
    fontSize: '0.875rem',
    margin: 0,
  },
  linkTexto: {
    textAlign: 'center',
    color: '#A0A0A0',
    fontSize: '0.9rem',
    margin: 0,
  },
  link: {
    color: '#9BFF97',
    textDecoration: 'none',
    fontWeight: 600,
  },
};
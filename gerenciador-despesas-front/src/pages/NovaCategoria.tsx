import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Toast } from '../components/Toast';
import { useAuth } from '../context/useAuth';
import api from '../api/axios';
import axios from 'axios';

interface Props {
  tipo: 'despesa' | 'receita';
}

export function NovaCategoria({ tipo }: Props) {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ mensagem: string; tipo: 'sucesso' | 'erro' } | null>(null);

  async function handleCriar(e: React.FormEvent) {
    e.preventDefault();
    if (!usuario?.id) return;
    setLoading(true);

    try {
      await api.post(`/categorias/${tipo}/${usuario.id}`, { nome });
      setToast({ mensagem: 'Categoria criada com sucesso!', tipo: 'sucesso' });
      setNome('');
      setTimeout(() => navigate(tipo === 'despesa' ? '/despesas' : '/receitas'), 2000);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setToast({ mensagem: 'Você já possui uma categoria com esse nome.', tipo: 'erro' });
      } else {
        setToast({ mensagem: 'Erro ao criar categoria.', tipo: 'erro' });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrapper}>
      <Sidebar />

      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.titulo}>
            Nova Categoria de {tipo === 'despesa' ? 'Despesa' : 'Receita'}
          </h1>
          <p style={styles.subtitulo}>Organize melhor seus lançamentos</p>
        </div>

        <hr style={styles.divisor} />

        <form onSubmit={handleCriar} style={styles.form}>
          <div style={styles.esquerda}>
            <div style={styles.card}>
              <p style={styles.cardTitulo}>Nome da categoria</p>
              <input
                type="text"
                placeholder={`Ex: ${tipo === 'despesa' ? 'Educação' : 'Freelance'}`}
                value={nome}
                onChange={e => setNome(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.direita}>
            <button type="submit" style={styles.botaoCriar} disabled={loading}>
              {loading ? 'Criando...' : 'Criar'}
            </button>
            <button
              type="button"
              style={styles.botaoCancelar}
              onClick={() => navigate('/dashboard')}
            >
              Cancelar
            </button>
          </div>
        </form>
      </main>

      {toast && (
        <Toast
          mensagem={toast.mensagem}
          tipo={toast.tipo}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#0D0D0D',
  },
  main: {
    flex: 1,
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  titulo: {
    color: '#FFFFFF',
    fontSize: '2rem',
    fontWeight: 700,
    margin: 0,
  },
  subtitulo: {
    color: '#A0A0A0',
    fontSize: '0.9rem',
    margin: 0,
  },
  divisor: {
    border: 'none',
    borderTop: '1px solid #2A2A2A',
    margin: 0,
  },
  form: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'flex-start',
  },
  esquerda: {
    flex: 1,
  },
  direita: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    width: '280px',
  },
  card: {
    backgroundColor: '#1A1A1A',
    border: '1px solid #2A2A2A',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  cardTitulo: {
    color: '#FFFFFF',
    fontWeight: 700,
    fontSize: '1rem',
    margin: 0,
  },
  input: {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid #2A2A2A',
    backgroundColor: '#0D0D0D',
    color: '#FFFFFF',
    fontSize: '1rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  botaoCriar: {
    padding: '0.85rem',
    backgroundColor: '#9BFF97',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
  botaoCancelar: {
    padding: '0.85rem',
    backgroundColor: 'transparent',
    color: '#FFFFFF',
    border: '1px solid #2A2A2A',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Toast } from '../components/Toast';
import { useAuth } from '../context/useAuth';
import api from '../api/axios';
import axios from 'axios';
import type { CategoriaDTO } from '../types';

export function NovaReceita() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState<CategoriaDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ mensagem: string; tipo: 'sucesso' | 'erro' } | null>(null);

  const [form, setForm] = useState({
    nomeReceita: '',
    nomeCategoria: '',
    tipoReceita: 'SALARIO',
    valorReceita: '',
    dataRecebimentoReceita: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    async function carregarCategorias() {
      if (!usuario?.id) return;
      try {
        const res = await api.get(`/categorias/listar`);
        setCategorias(res.data.filter((c: CategoriaDTO) => c.tipo === 'RECEITA'));
      } catch (err) {
        console.error(err);
      }
    }
    carregarCategorias();
  }, [usuario]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleCriar(e: React.FormEvent) {
    e.preventDefault();
    if (!usuario?.id) return;
    setLoading(true);

    try {
      await api.post(`/receitas`, {
        nomeReceita: form.nomeReceita,
        nomeCategoria: form.nomeCategoria,
        tipoReceita: form.tipoReceita,
        valorReceita: parseFloat(form.valorReceita),
        dataRecebimentoReceita: form.dataRecebimentoReceita,
      });
      setToast({ mensagem: 'Receita criada com sucesso!', tipo: 'sucesso' });
      setTimeout(() => navigate('/receitas'), 2000);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setToast({ mensagem: 'Você já possui uma receita com esse nome.', tipo: 'erro' });
      } else {
        setToast({ mensagem: 'Erro ao criar receita.', tipo: 'erro' });
      }
    } finally {
      setLoading(false);
    }
  }

  const TIPOS_RECEITA = [
    { value: 'SALARIO', label: '💼 Salário' },
    { value: 'FREELANCE', label: '💻 Freelance' },
    { value: 'INVESTIMENTO', label: '📈 Investimento' },
    { value: 'ALUGUEL', label: '🏠 Aluguel' },
    { value: 'OUTROS', label: '📦 Outros' },
  ];

  return (
    <div style={styles.wrapper}>
      <Sidebar />

      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.titulo}>Nova Receita</h1>
          <p style={styles.subtitulo}>Cadastre um novo recebimento</p>
        </div>

        <hr style={styles.divisor} />

        <form onSubmit={handleCriar} style={styles.form}>
          <div style={styles.esquerda}>

            {/* Informações principais */}
            <div style={styles.card}>
              <p style={styles.cardTitulo}>Informações principais</p>

              <div style={styles.grupo}>
                <label style={styles.label}>Nome</label>
                <input
                  name="nomeReceita"
                  type="text"
                  placeholder="Ex: Salário maio"
                  value={form.nomeReceita}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.linha}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Categoria</label>
                  <select
                    name="nomeCategoria"
                    value={form.nomeCategoria}
                    onChange={handleChange}
                    style={styles.select}
                    required
                  >
                    <option value="">Selecione...</option>
                    {categorias.map(c => (
                      <option key={c.idCategoria} value={c.nome}>{c.nome}</option>
                    ))}
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Tipo</label>
                  <div style={styles.tipoWrapper}>
                    {TIPOS_RECEITA.map(tipo => (
                      <button
                        key={tipo.value}
                        type="button"
                        onClick={() => setForm({ ...form, tipoReceita: tipo.value })}
                        style={{
                          ...styles.tipoBotao,
                          border: form.tipoReceita === tipo.value
                            ? '2px solid #9BFF97'
                            : '2px solid #2A2A2A',
                          color: form.tipoReceita === tipo.value ? '#9BFF97' : '#A0A0A0',
                        }}
                      >
                        {tipo.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Detalhes */}
            <div style={styles.card}>
              <p style={styles.cardTitulo}>Detalhes do recebimento</p>

              <div style={styles.linha}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Valor</label>
                  <input
                    name="valorReceita"
                    type="number"
                    placeholder="0,00"
                    value={form.valorReceita}
                    onChange={handleChange}
                    style={styles.input}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Data de recebimento</label>
                  <input
                    name="dataRecebimentoReceita"
                    type="date"
                    value={form.dataRecebimentoReceita}
                    onChange={handleChange}
                    style={styles.input}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Resumo lateral */}
          <div style={styles.direita}>
            <div style={styles.resumoCard}>
              <p style={styles.cardTitulo}>Resumo</p>
              <div style={styles.resumoLinha}>
                <span style={styles.resumoLabel}>Tipo</span>
                <span style={styles.resumoValor}>
                  {TIPOS_RECEITA.find(t => t.value === form.tipoReceita)?.label || '—'}
                </span>
              </div>
              <div style={styles.resumoLinha}>
                <span style={styles.resumoLabel}>Categoria</span>
                <span style={styles.resumoValor}>{form.nomeCategoria || '—'}</span>
              </div>
              <div style={styles.resumoLinha}>
                <span style={styles.resumoLabel}>Valor</span>
                <span style={{ ...styles.resumoValor, color: '#9BFF97' }}>
                  {form.valorReceita ? `R$ ${parseFloat(form.valorReceita).toFixed(2)}` : '—'}
                </span>
              </div>
              <div style={styles.resumoLinha}>
                <span style={styles.resumoLabel}>Data</span>
                <span style={styles.resumoValor}>
                  {form.dataRecebimentoReceita
                    ? new Date(form.dataRecebimentoReceita).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        timeZone: 'UTC',
                      })
                    : '—'}
                </span>
              </div>
            </div>

            <button type="submit" style={styles.botaoCriar} disabled={loading}>
              {loading ? 'Criando...' : 'Criar receita'}
            </button>
            <button
              type="button"
              style={styles.botaoCancelar}
              onClick={() => navigate('/receitas')}
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
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  direita: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    width: '300px',
  },
  card: {
    backgroundColor: '#1A1A1A',
    border: '1px solid #2A2A2A',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  cardTitulo: {
    color: '#FFFFFF',
    fontWeight: 700,
    fontSize: '1rem',
    margin: 0,
  },
  grupo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  linha: {
    display: 'flex',
    gap: '1rem',
  },
  label: {
    color: '#A0A0A0',
    fontSize: '0.85rem',
    fontWeight: 500,
    marginBottom: '0.4rem',
    display: 'block',
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
  select: {
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
  tipoWrapper: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  tipoBotao: {
    flex: '1 1 auto',
    padding: '0.6rem 0.5rem',
    borderRadius: '8px',
    backgroundColor: '#0D0D0D',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  resumoCard: {
    backgroundColor: '#1A1A1A',
    border: '1px solid #2A2A2A',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  resumoLinha: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #2A2A2A',
  },
  resumoLabel: {
    color: '#A0A0A0',
    fontSize: '0.85rem',
  },
  resumoValor: {
    color: '#FFFFFF',
    fontWeight: 700,
    fontSize: '0.9rem',
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
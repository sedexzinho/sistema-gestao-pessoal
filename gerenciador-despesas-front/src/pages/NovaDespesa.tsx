import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Toast } from '../components/Toast';
import { useAuth } from '../context/useAuth';
import api from '../api/axios';
import axios from 'axios';
import type { CategoriaDTO } from '../types';

export function NovaDespesa() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState<CategoriaDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ mensagem: string; tipo: 'sucesso' | 'erro' } | null>(null);

  const [form, setForm] = useState({
    nome: '',
    nomeCategoria: '',
    isParcelado: false,
    valor: '',
    diaPagamento: '',
    totalParcelas: '',
    valorParcela: '',
    dataRegistro: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    async function carregarCategorias() {
      if (!usuario?.id) return;
      try {
        const res = await api.get(`/categorias/listar`);
        setCategorias(res.data.filter((c: CategoriaDTO) => c.tipo === 'DESPESA'));
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
      await api.post(`/despesas/${usuario.id}`, {
        nome: form.nome,
        nomeCategoria: form.nomeCategoria,
        isParcelado: form.isParcelado,
        valor: parseFloat(form.valor),
        diaPagamento: parseInt(form.diaPagamento),
        totalParcelas: form.isParcelado ? parseInt(form.totalParcelas) : null,
        valorParcela: form.isParcelado ? parseFloat(form.valorParcela) : null,
        dataRegistro: form.dataRegistro,
      });
      setToast({ mensagem: 'Despesa criada com sucesso!', tipo: 'sucesso' });
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setToast({ mensagem: 'Você já possui uma despesa com esse nome.', tipo: 'erro' });
      } else {
        setToast({ mensagem: 'Erro ao criar despesa.', tipo: 'erro' });
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
          <h1 style={styles.titulo}>Nova Despesa</h1>
          <p style={styles.subtitulo}>Cadastre uma despesa avulsa ou parcelada</p>
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
                  name="nome"
                  type="text"
                  placeholder="Ex: Mercado"
                  value={form.nome}
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
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, isParcelado: false })}
                      style={{
                        ...styles.tipoBotao,
                        border: !form.isParcelado ? '2px solid #9BFF97' : '2px solid #2A2A2A',
                        color: !form.isParcelado ? '#9BFF97' : '#A0A0A0',
                      }}
                    >
                      🧾 Avulsa
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, isParcelado: true })}
                      style={{
                        ...styles.tipoBotao,
                        border: form.isParcelado ? '2px solid #9BFF97' : '2px solid #2A2A2A',
                        color: form.isParcelado ? '#9BFF97' : '#A0A0A0',
                      }}
                    >
                      💳 Parcelada
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalhes */}
            <div style={styles.card}>
              <p style={styles.cardTitulo}>
                Detalhes da despesa {form.isParcelado ? 'parcelada' : 'avulsa'}
              </p>

              {!form.isParcelado ? (
                <div style={styles.linha}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Valor</label>
                    <input
                      name="valor"
                      type="number"
                      placeholder="0,00"
                      value={form.valor}
                      onChange={handleChange}
                      style={styles.input}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Data</label>
                    <input
                      name="dataRegistro"
                      type="date"
                      value={form.dataRegistro}
                      onChange={handleChange}
                      style={styles.input}
                      required
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div style={styles.linha}>
                    <div style={{ flex: 1 }}>
                      <label style={styles.label}>Valor total</label>
                      <input
                        name="valor"
                        type="number"
                        placeholder="0,00"
                        value={form.valor}
                        onChange={handleChange}
                        style={styles.input}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={styles.label}>Nº de parcelas</label>
                      <input
                        name="totalParcelas"
                        type="number"
                        placeholder="Ex: 12"
                        value={form.totalParcelas}
                        onChange={handleChange}
                        style={styles.input}
                        min="2"
                        required
                      />
                    </div>
                  </div>
                  <div style={styles.linha}>
                    <div style={{ flex: 1 }}>
                      <label style={styles.label}>Valor da parcela</label>
                      <input
                        name="valorParcela"
                        type="number"
                        placeholder="0,00"
                        value={form.valorParcela}
                        onChange={handleChange}
                        style={styles.input}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={styles.label}>Dia do vencimento</label>
                      <input
                        name="diaPagamento"
                        type="number"
                        placeholder="Ex: 10"
                        value={form.diaPagamento}
                        onChange={handleChange}
                        style={styles.input}
                        min="1"
                        max="31"
                        required
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Resumo lateral */}
          <div style={styles.direita}>
            <div style={styles.resumoCard}>
              <p style={styles.cardTitulo}>Resumo</p>
              <div style={styles.resumoLinha}>
                <span style={styles.resumoLabel}>Tipo</span>
                <span style={styles.resumoValor}>{form.isParcelado ? 'Parcelada' : 'Avulsa'}</span>
              </div>
              <div style={styles.resumoLinha}>
                <span style={styles.resumoLabel}>Categoria</span>
                <span style={styles.resumoValor}>{form.nomeCategoria || '—'}</span>
              </div>
              <div style={styles.resumoLinha}>
                <span style={styles.resumoLabel}>Valor</span>
                <span style={{ ...styles.resumoValor, color: '#FF5C5C' }}>
                  {form.valor ? `R$ ${parseFloat(form.valor).toFixed(2)}` : '—'}
                </span>
              </div>
              {form.isParcelado && (
                <>
                  <div style={styles.resumoLinha}>
                    <span style={styles.resumoLabel}>Parcelas</span>
                    <span style={styles.resumoValor}>{form.totalParcelas || '—'}</span>
                  </div>
                  <div style={styles.resumoLinha}>
                    <span style={styles.resumoLabel}>Valor/parcela</span>
                    <span style={{ ...styles.resumoValor, color: '#FFB347' }}>
                      {form.valorParcela ? `R$ ${parseFloat(form.valorParcela).toFixed(2)}` : '—'}
                    </span>
                  </div>
                </>
              )}
            </div>

            <button type="submit" style={styles.botaoCriar} disabled={loading}>
              {loading ? 'Criando...' : 'Criar despesa'}
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
    gap: '0.75rem',
  },
  tipoBotao: {
    flex: 1,
    padding: '0.65rem',
    borderRadius: '8px',
    backgroundColor: '#0D0D0D',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
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
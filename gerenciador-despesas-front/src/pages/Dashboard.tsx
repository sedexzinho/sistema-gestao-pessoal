import { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { CardResumo } from '../components/CardResumo';
import { useAuth } from '../context/useAuth';
import api from '../api/axios';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';



interface Despesa {
  
  id: number;
  nome: string;
  valor: number;
  tipo: string;
  status: string;
  nomeCategoria: string;
  dataRegistro: string;
  isParcelado: boolean;
  parcelaAtual?: number;
  totalParcelas?: number;
  valorParcela?: number;
  diaPagamento?: number;
}

interface Receita {
  id: number;
  nomeReceita: string;
  valorReceita: number;
  tipoReceita: string;
  statusReceita: string;
  dataRecebimentoReceita: string;
  nomeCategoria: string;
}

export function Dashboard() {
  const { usuario } = useAuth();
  const [saldo, setSaldo] = useState<number>(0);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  async function carregarDados() {
    console.log('usuario id:', usuario?.id);
    if (!usuario?.id) return;
    try {
      const [saldoRes, despesasRes, receitasRes] = await Promise.all([
        api.get(`/saldo/${usuario.id}`),
        api.get('/despesas/listar'),
        api.get('/receitas/listar'),
      ]);
      console.log('saldo:', saldoRes.data);
      setSaldo(saldoRes.data);
      setDespesas(despesasRes.data);
      setReceitas(receitasRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  carregarDados();
}, [usuario]);

  const totalReceitas = receitas.reduce((acc, r) => acc + r.valorReceita, 0);
  const totalDespesasAvulsas = despesas
    .filter(d => d.tipo === 'AVULSO')
    .reduce((acc, d) => acc + d.valor, 0);
  const totalParceladas = despesas
    .filter(d => d.tipo === 'PARCELADO')
    .reduce((acc, d) => acc + (d.valorParcela ?? 0), 0);
  const parcelasPendentes = despesas
    .filter(d => d.tipo === 'PARCELADO' && d.status !== 'CONCLUIDO')
    .length;

  const transacoesRecentes = [
    ...receitas.map(r => ({
      nome: r.nomeReceita,
      categoria: r.nomeCategoria,
      data: r.dataRecebimentoReceita,
      valor: r.valorReceita,
      tipo: 'receita',
    })),
    ...despesas.map(d => ({
      nome: d.nome,
      categoria: d.nomeCategoria,
      data: d.dataRegistro,
      valor: d.valor,
      tipo: 'despesa',
    })),
  ]
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 5);

  const proximasParcelas = despesas
    .filter(d => d.tipo === 'PARCELADO' && d.status !== 'CONCLUIDO')
    .slice(0, 4);

  function formatarMoeda(valor: number) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function formatarData(data: string) {
    if (!data) return '';
    return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <p style={{ color: '#9BFF97' }}>Carregando...</p>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <Sidebar />

      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.titulo}>Dashboard</h1>
            <p style={styles.subtitulo}>Sua visão geral financeira deste mês</p>
          </div>
          <button style={styles.botaoNovo}>+ Nova Despesa</button>
        </header>

        {/* Cards de resumo */}
        <div style={styles.cards}>
          <CardResumo
            titulo="Saldo Atual"
            valor={formatarMoeda(saldo)}
            descricao="Receitas - despesas do mês"
            icone="💳"
            cor={saldo >= 0 ? 'verde' : 'vermelho'}
          />
          <CardResumo
            titulo="Total de Receitas"
            valor={formatarMoeda(totalReceitas)}
            descricao="Mês corrente"
            icone="📈"
            cor="verde"
          />
          <CardResumo
            titulo="Despesas do Mês"
            valor={formatarMoeda(totalDespesasAvulsas + totalParceladas)}
            descricao="Avulsas + parcelas"
            icone="📉"
            cor="vermelho"
          />
          <CardResumo
            titulo="Salário Mensal"
            valor={formatarMoeda(Number(usuario?.salarioMensal ?? 0))}
            descricao="Renda fixa cadastrada"
            icone="💼"
            cor="branco"
          />
        </div>

        {/* Cards secundários */}
        <div style={styles.cards}>
          <CardResumo
            titulo="Despesas Avulsas"
            valor={formatarMoeda(totalDespesasAvulsas)}
            descricao="Mês corrente"
            icone="🧾"
            cor="branco"
          />
          <CardResumo
            titulo="Despesas Parceladas"
            valor={formatarMoeda(totalParceladas)}
            descricao="Parcela atual somada"
            icone="💳"
            cor="amarelo"
          />
          <CardResumo
            titulo="Parcelas Pendentes"
            valor={String(parcelasPendentes)}
            descricao="Total a pagar"
            icone="⏰"
            cor="amarelo"
          />
          <CardResumo
            titulo="Restante das Parcelas"
            valor={formatarMoeda(despesas
              .filter(d => d.tipo === 'PARCELADO' && d.status !== 'CONCLUIDO')
              .reduce((acc, d) => {
                const restantes = (d.totalParcelas ?? 0) - (d.parcelaAtual ?? 0);
                return acc + (d.valorParcela ?? 0) * restantes;
              }, 0))}
            descricao="Saldo devedor"
            icone="💰"
            cor="amarelo"
          />
        </div>

        {/* Gráfico + Próximas Parcelas */}
        <div style={styles.grid}>
          <div style={styles.graficoCard}>
            <p style={styles.graficoTitulo}>Receitas vs Despesas</p>
            <p style={styles.graficoSub}>Últimos 6 meses</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={[
                { mes: 'Jan', receitas: 0, despesas: 0 },
                { mes: 'Fev', receitas: 0, despesas: 0 },
                { mes: 'Mar', receitas: totalReceitas * 0.3, despesas: totalDespesasAvulsas * 0.3 },
                { mes: 'Abr', receitas: totalReceitas * 0.6, despesas: totalDespesasAvulsas * 0.6 },
                { mes: 'Mai', receitas: totalReceitas, despesas: totalDespesasAvulsas },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="mes" stroke="#555" tick={{ fill: '#A0A0A0', fontSize: 12 }} />
                <YAxis stroke="#555" tick={{ fill: '#A0A0A0', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px' }}
                  labelStyle={{ color: '#FFF' }}
                />
                <Legend />
                <Line type="monotone" dataKey="receitas" stroke="#9BFF97" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="despesas" stroke="#FF5C5C" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={styles.parcelasCard}>
            <div style={styles.parcelasTopo}>
              <div>
                <p style={styles.graficoTitulo}>Próximas Parcelas</p>
                <p style={styles.graficoSub}>A vencer</p>
              </div>
              <button style={styles.verTodas}>Ver todas</button>
            </div>
            {proximasParcelas.length === 0 ? (
              <p style={{ color: '#555', fontSize: '0.9rem' }}>Nenhuma parcela pendente.</p>
            ) : (
              proximasParcelas.map(d => (
                <div key={d.id} style={styles.parcelaItem}>
                  <div style={styles.parcelaIcone}>⏰</div>
                  <div style={{ flex: 1 }}>
                    <p style={styles.parcelaNome}>{d.nome}</p>
                    <p style={styles.parcelaInfo}>
                      {d.parcelaAtual}/{d.totalParcelas} • vence dia {d.diaPagamento}
                    </p>
                  </div>
                  <p style={styles.parcelaValor}>{formatarMoeda(d.valorParcela ?? 0)}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Transações recentes */}
        <div style={styles.transacoesCard}>
          <div style={styles.parcelasTopo}>
            <div>
              <p style={styles.graficoTitulo}>Transações Recentes</p>
              <p style={styles.graficoSub}>Últimas movimentações</p>
            </div>
          </div>
          {transacoesRecentes.length === 0 ? (
            <p style={{ color: '#555', fontSize: '0.9rem' }}>Nenhuma transação encontrada.</p>
          ) : (
            transacoesRecentes.map((t, i) => (
              <div key={i} style={styles.transacaoItem}>
                <div style={{
                  ...styles.transacaoIcone,
                  backgroundColor: t.tipo === 'receita' ? 'rgba(155,255,151,0.1)' : 'rgba(255,92,92,0.1)',
                }}>
                  {t.tipo === 'receita' ? '↗' : '↘'}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={styles.transacaoNome}>{t.nome}</p>
                  <div style={styles.transacaoMeta}>
                    <span style={styles.tag}>{t.categoria}</span>
                    <span style={{ color: '#555', fontSize: '0.8rem' }}>{formatarData(t.data)}</span>
                  </div>
                </div>
                <p style={{
                  ...styles.transacaoValor,
                  color: t.tipo === 'receita' ? '#9BFF97' : '#FF5C5C',
                }}>
                  {t.tipo === 'receita' ? '+' : '-'}{formatarMoeda(t.valor)}
                </p>
              </div>
            ))
          )}
        </div>
      </main>
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
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#0D0D0D',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    margin: '0.25rem 0 0 0',
  },
  botaoNovo: {
    padding: '0.65rem 1.25rem',
    backgroundColor: '#9BFF97',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 700,
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  cards: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  grid: {
    display: 'flex',
    gap: '1rem',
  },
  graficoCard: {
    flex: 2,
    backgroundColor: '#1A1A1A',
    border: '1px solid #2A2A2A',
    borderRadius: '12px',
    padding: '1.5rem',
  },
  parcelasCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    border: '1px solid #2A2A2A',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  parcelasTopo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.5rem',
  },
  graficoTitulo: {
    color: '#FFFFFF',
    fontWeight: 700,
    fontSize: '1rem',
    margin: 0,
  },
  graficoSub: {
    color: '#A0A0A0',
    fontSize: '0.8rem',
    margin: '0.2rem 0 1rem 0',
  },
  verTodas: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#9BFF97',
    fontSize: '0.85rem',
    cursor: 'pointer',
    fontWeight: 600,
  },
  parcelaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    backgroundColor: '#111',
    borderRadius: '8px',
    border: '1px solid #2A2A2A',
  },
  parcelaIcone: {
    fontSize: '1rem',
    backgroundColor: 'rgba(255, 179, 71, 0.1)',
    borderRadius: '8px',
    padding: '0.4rem',
  },
  parcelaNome: {
    color: '#FFFFFF',
    fontSize: '0.9rem',
    fontWeight: 600,
    margin: 0,
  },
  parcelaInfo: {
    color: '#A0A0A0',
    fontSize: '0.78rem',
    margin: '0.2rem 0 0 0',
  },
  parcelaValor: {
    color: '#FFB347',
    fontWeight: 700,
    fontSize: '0.95rem',
    margin: 0,
    whiteSpace: 'nowrap',
  },
  transacoesCard: {
    backgroundColor: '#1A1A1A',
    border: '1px solid #2A2A2A',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  transacaoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem 0',
    borderBottom: '1px solid #2A2A2A',
  },
  transacaoIcone: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.1rem',
    color: '#FFF',
    flexShrink: 0,
  },
  transacaoNome: {
    color: '#FFFFFF',
    fontWeight: 600,
    fontSize: '0.95rem',
    margin: 0,
  },
  transacaoMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '0.2rem',
  },
  tag: {
    backgroundColor: '#2A2A2A',
    color: '#A0A0A0',
    fontSize: '0.75rem',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
  },
  transacaoValor: {
    fontWeight: 700,
    fontSize: '1rem',
    margin: 0,
    whiteSpace: 'nowrap',
  },
};
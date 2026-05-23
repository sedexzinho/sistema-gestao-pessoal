import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../context/useAuth";
import api from "../api/axios";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface Receita {
  id: number;
  nomeReceita: string;
  valorReceita: number;
  tipoReceita: string;
  statusReceita: string;
  dataRecebimentoReceita: string;
  nomeCategoria: string;
}

const MESES = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

interface TooltipPayload {
  value?: number;
}
interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

type FiltroStatusReceita = "TODOS" | "RECEBIDO" | "PENDENTE" | "CANCELADO";
type OrdenacaoReceita = "data_desc" | "data_asc" | "valor_desc" | "valor_asc";

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(data: string) {
  if (!data) return "—";
  return new Date(data).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const tooltipStyle: React.CSSProperties = {
  backgroundColor: "#1A1A1A",
  border: "1px solid #2A2A2A",
  borderRadius: "8px",
  padding: "10px 14px",
};

const CustomTooltipReceita = ({
  active,
  payload,
  label,
}: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const valor = typeof payload[0].value === "number" ? payload[0].value : 0;
    return (
      <div style={tooltipStyle}>
        <p
          style={{ color: "#A0A0A0", fontSize: "0.78rem", margin: "0 0 4px 0" }}
        >
          {label}
        </p>
        <p
          style={{
            color: "#9BFF97",
            fontWeight: 700,
            margin: 0,
            fontSize: "0.95rem",
          }}
        >
          {formatarMoeda(valor)}
        </p>
      </div>
    );
  }
  return null;
};

export function Receitas() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(true);

  const [filtroStatus, setFiltroStatus] =
    useState<FiltroStatusReceita>("TODOS");
  const [filtroTipo, setFiltroTipo] = useState("TODOS");
  const [filtroCategoria, setFiltroCategoria] = useState("TODAS");
  const [filtroBusca, setFiltroBusca] = useState("");
  const [ordenacao, setOrdenacao] = useState<OrdenacaoReceita>("data_desc");

  useEffect(() => {
    async function carregar() {
      try {
        const res = await api.get("/receitas/listar");
        setReceitas(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, [usuario]);

  // ✅ Marca receita como RECEBIDO
  async function handleReceber(id: number) {
    try {
      const res = await api.patch(`/receitas/receber/${id}`);
      setReceitas((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...res.data } : r)),
      );
    } catch (err) {
      console.error(err);
    }
  }

  const categorias = useMemo(
    () => [...new Set(receitas.map((r) => r.nomeCategoria))].filter(Boolean),
    [receitas],
  );
  const tipos = useMemo(
    () => [...new Set(receitas.map((r) => r.tipoReceita))].filter(Boolean),
    [receitas],
  );

  const receitasFiltradas = useMemo(() => {
    let lista = [...receitas];
    if (filtroStatus !== "TODOS")
      lista = lista.filter((r) => r.statusReceita === filtroStatus);
    if (filtroTipo !== "TODOS")
      lista = lista.filter((r) => r.tipoReceita === filtroTipo);
    if (filtroCategoria !== "TODAS")
      lista = lista.filter((r) => r.nomeCategoria === filtroCategoria);
    if (filtroBusca)
      lista = lista.filter((r) =>
        r.nomeReceita.toLowerCase().includes(filtroBusca.toLowerCase()),
      );

    lista.sort((a, b) => {
      if (ordenacao === "data_desc")
        return (
          new Date(b.dataRecebimentoReceita).getTime() -
          new Date(a.dataRecebimentoReceita).getTime()
        );
      if (ordenacao === "data_asc")
        return (
          new Date(a.dataRecebimentoReceita).getTime() -
          new Date(b.dataRecebimentoReceita).getTime()
        );
      if (ordenacao === "valor_desc") return b.valorReceita - a.valorReceita;
      if (ordenacao === "valor_asc") return a.valorReceita - b.valorReceita;
      return 0;
    });
    return lista;
  }, [
    receitas,
    filtroStatus,
    filtroTipo,
    filtroCategoria,
    filtroBusca,
    ordenacao,
  ]);

  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  const receitasMes = receitas.filter(
    (r) =>
      r.statusReceita === "RECEBIDO" &&
      new Date(r.dataRecebimentoReceita).getMonth() === mesAtual &&
      new Date(r.dataRecebimentoReceita).getFullYear() === anoAtual,
  );

  const totalMes = receitasMes.reduce((acc, r) => acc + r.valorReceita, 0);
  const totalPendente = receitas
    .filter((r) => r.statusReceita === "PENDENTE")
    .reduce((acc, r) => acc + r.valorReceita, 0);
  const maiorReceita = [...receitas].sort(
    (a, b) => b.valorReceita - a.valorReceita,
  )[0];
  const mediaReceitas =
    receitas.length > 0
      ? receitas.reduce((acc, r) => acc + r.valorReceita, 0) / receitas.length
      : 0;

  const dadosMensais = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const m = d.getMonth();
      const a = d.getFullYear();
      const total = receitas
        .filter(
          (r) =>
            r.statusReceita === "RECEBIDO" &&
            new Date(r.dataRecebimentoReceita).getMonth() === m &&
            new Date(r.dataRecebimentoReceita).getFullYear() === a,
        )
        .reduce((acc, r) => acc + r.valorReceita, 0);
      return { mes: MESES[m], valor: total };
    });
  }, [receitas]);

  const dadosCategorias = useMemo(() => {
    const mapa: Record<string, number> = {};
    receitas
      .filter((r) => r.statusReceita === "RECEBIDO")
      .forEach((r) => {
        if (r.nomeCategoria)
          mapa[r.nomeCategoria] = (mapa[r.nomeCategoria] || 0) + r.valorReceita;
      });
    return Object.entries(mapa)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [receitas]);

  const totalCats = dadosCategorias.reduce((acc, c) => acc + c.value, 0);

  if (loading) {
    return (
      <div style={s.loadingWrap}>
        <p style={{ color: "#9BFF97", fontSize: "0.9rem" }}>
          Carregando receitas...
        </p>
      </div>
    );
  }

  return (
    <div style={s.wrapper}>
      <Sidebar />
      <main style={s.main}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.titulo}>Receitas</h1>
            <p style={s.subtitulo}>Análise completa dos seus recebimentos</p>
          </div>
          <button style={s.botaoNovo} onClick={() => navigate("/nova-receita")}>
            + Nova Receita
          </button>
        </div>

        {/* KPIs */}
        <div style={s.kpiGrid}>
          <KpiCard
            titulo="Recebido este mês"
            valor={formatarMoeda(totalMes)}
            sub={`${receitasMes.length} recebimento(s)`}
            icone="📈"
            accent="#9BFF97"
          />
          <KpiCard
            titulo="Pendente de recebimento"
            valor={formatarMoeda(totalPendente)}
            sub="Aguardando confirmação"
            icone="⏳"
            accent="#FFB800"
          />
          <KpiCard
            titulo="Maior receita"
            valor={
              maiorReceita ? formatarMoeda(maiorReceita.valorReceita) : "—"
            }
            sub={maiorReceita?.nomeReceita || "—"}
            icone="🏆"
            accent="#9BFF97"
          />
          <KpiCard
            titulo="Ticket médio"
            valor={formatarMoeda(mediaReceitas)}
            sub="Média por transação"
            icone="📊"
            accent="#5C9EFF"
          />
        </div>

        {/* Gráficos */}
        <div style={s.graficos}>
          <div style={s.graficoCard}>
            <p style={s.graficoTitulo}>Evolução de receitas</p>
            <p style={s.graficoSub}>Últimos 6 meses — valores recebidos</p>
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={dadosMensais}>
                <defs>
                  <linearGradient id="receitaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9BFF97" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#9BFF97" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1F1F1F"
                  vertical={false}
                />
                <XAxis
                  dataKey="mes"
                  stroke="transparent"
                  tick={{ fill: "#555", fontSize: 12 }}
                />
                <YAxis
                  stroke="transparent"
                  tick={{ fill: "#555", fontSize: 11 }}
                />
                <Tooltip
                  content={<CustomTooltipReceita />}
                  cursor={{ stroke: "#2A2A2A" }}
                />
                <Area
                  type="monotone"
                  dataKey="valor"
                  stroke="#9BFF97"
                  strokeWidth={2}
                  fill="url(#receitaGrad)"
                  dot={{ fill: "#9BFF97", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: "#9BFF97" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={s.graficoCard}>
            <p style={s.graficoTitulo}>Por categoria</p>
            <p style={s.graficoSub}>Receitas recebidas acumuladas</p>
            {dadosCategorias.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.85rem",
                  marginTop: "0.5rem",
                }}
              >
                {dadosCategorias.slice(0, 5).map((cat, i) => {
                  const pct = totalCats > 0 ? (cat.value / totalCats) * 100 : 0;
                  return (
                    <div key={cat.name}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "5px",
                        }}
                      >
                        <span
                          style={{
                            color: "#FFFFFF",
                            fontSize: "0.85rem",
                            fontWeight: 500,
                          }}
                        >
                          {cat.name}
                        </span>
                        <span
                          style={{
                            color: "#9BFF97",
                            fontSize: "0.85rem",
                            fontWeight: 700,
                          }}
                        >
                          {formatarMoeda(cat.value)}
                        </span>
                      </div>
                      <div
                        style={{
                          height: "6px",
                          backgroundColor: "#2A2A2A",
                          borderRadius: "3px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            backgroundColor:
                              i === 0
                                ? "#9BFF97"
                                : `rgba(155,255,151,${0.7 - i * 0.12})`,
                            borderRadius: "3px",
                            transition: "width 0.6s ease",
                          }}
                        />
                      </div>
                      <span style={{ color: "#555", fontSize: "0.72rem" }}>
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p
                style={{
                  color: "#555",
                  fontSize: "0.9rem",
                  textAlign: "center",
                  paddingTop: "3rem",
                }}
              >
                Sem dados de categoria
              </p>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div style={s.filtrosCard}>
          <div style={s.filtrosLinha}>
            <div style={s.buscaWrap}>
              <span style={s.buscaIcone}>🔍</span>
              <input
                placeholder="Buscar receita..."
                value={filtroBusca}
                onChange={(e) => setFiltroBusca(e.target.value)}
                style={s.buscaInput}
              />
            </div>
            <FiltroSelect
              label="Status"
              value={filtroStatus}
              onChange={(v) => setFiltroStatus(v as FiltroStatusReceita)}
              options={[
                { label: "Todos", value: "TODOS" },
                { label: "Recebido", value: "RECEBIDO" },
                { label: "Pendente", value: "PENDENTE" },
                { label: "Cancelado", value: "CANCELADO" },
              ]}
            />
            <FiltroSelect
              label="Tipo"
              value={filtroTipo}
              onChange={(v) => setFiltroTipo(v)}
              options={[
                { label: "Todos", value: "TODOS" },
                ...tipos.map((t) => ({ label: t, value: t })),
              ]}
            />
            <FiltroSelect
              label="Categoria"
              value={filtroCategoria}
              onChange={(v) => setFiltroCategoria(v)}
              options={[
                { label: "Todas", value: "TODAS" },
                ...categorias.map((c) => ({ label: c, value: c })),
              ]}
            />
            <FiltroSelect
              label="Ordenar"
              value={ordenacao}
              onChange={(v) => setOrdenacao(v as OrdenacaoReceita)}
              options={[
                { label: "Mais recente", value: "data_desc" },
                { label: "Mais antigo", value: "data_asc" },
                { label: "Maior valor", value: "valor_desc" },
                { label: "Menor valor", value: "valor_asc" },
              ]}
            />
          </div>
          <p style={s.contagem}>
            {receitasFiltradas.length} receita
            {receitasFiltradas.length !== 1 ? "s" : ""} encontrada
            {receitasFiltradas.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Tabela */}
        <div style={s.tabelaCard}>
          <table style={s.tabela}>
            <thead>
              <tr>
                {/* ✅ Coluna "Ação" adicionada */}
                {[
                  "Nome",
                  "Categoria",
                  "Tipo",
                  "Valor",
                  "Data",
                  "Status",
                  "Ação",
                ].map((h) => (
                  <th key={h} style={s.th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {receitasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} style={s.semDados}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <span style={{ fontSize: "2rem" }}>📭</span>
                      <span>Nenhuma receita encontrada</span>
                    </div>
                  </td>
                </tr>
              ) : (
                receitasFiltradas.map((r, i) => (
                  <tr
                    key={r.id}
                    style={{
                      backgroundColor:
                        i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)",
                    }}
                  >
                    <td style={s.td}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.6rem",
                        }}
                      >
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            backgroundColor: "rgba(155,255,151,0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.85rem",
                            flexShrink: 0,
                          }}
                        >
                          📈
                        </div>
                        <span
                          style={{
                            color: "#FFFFFF",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                          }}
                        >
                          {r.nomeReceita}
                        </span>
                      </div>
                    </td>
                    <td style={s.td}>
                      <span style={s.tag}>{r.nomeCategoria || "—"}</span>
                    </td>
                    <td style={s.td}>
                      <span
                        style={{
                          ...s.badge,
                          backgroundColor: "rgba(92,158,255,0.1)",
                          color: "#5C9EFF",
                        }}
                      >
                        {r.tipoReceita || "—"}
                      </span>
                    </td>
                    <td style={{ ...s.td, color: "#9BFF97", fontWeight: 700 }}>
                      {formatarMoeda(r.valorReceita)}
                    </td>
                    <td
                      style={{ ...s.td, color: "#A0A0A0", fontSize: "0.85rem" }}
                    >
                      {formatarData(r.dataRecebimentoReceita)}
                    </td>
                    <td style={s.td}>
                      <StatusBadge status={r.statusReceita} />
                    </td>
                    {/* ✅ Botão "Receber" — só aparece quando ainda não foi recebido */}
                    <td style={s.td}>
                      {r.statusReceita !== "RECEBIDO" &&
                      r.statusReceita !== "CANCELADO" ? (
                        <button
                          onClick={() => handleReceber(r.id)}
                          style={{
                            padding: "0.35rem 0.85rem",
                            backgroundColor: "rgba(155,255,151,0.1)",
                            color: "#9BFF97",
                            border: "1px solid rgba(155,255,151,0.3)",
                            borderRadius: "6px",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          ✓ Receber
                        </button>
                      ) : (
                        <span style={{ color: "#555", fontSize: "0.8rem" }}>
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

// --- Sub-components ---

function KpiCard({
  titulo,
  valor,
  sub,
  icone,
  accent,
}: {
  titulo: string;
  valor: string;
  sub: string;
  icone: string;
  accent: string;
}) {
  return (
    <div style={{ ...s.kpiCard, borderTop: `2px solid ${accent}` }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <p style={s.kpiTitulo}>{titulo}</p>
        <span style={{ fontSize: "1.2rem" }}>{icone}</span>
      </div>
      <p style={{ ...s.kpiValor, color: accent }}>{valor}</p>
      <p style={s.kpiSub}>{sub}</p>
    </div>
  );
}

function FiltroSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      <label
        style={{
          color: "#555",
          fontSize: "0.72rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={s.select}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    RECEBIDO: {
      label: "Recebido",
      color: "#9BFF97",
      bg: "rgba(155,255,151,0.12)",
    },
    PENDENTE: {
      label: "Pendente",
      color: "#FFB800",
      bg: "rgba(255,184,0,0.12)",
    },
    CANCELADO: {
      label: "Cancelado",
      color: "#FF5C5C",
      bg: "rgba(255,92,92,0.12)",
    },
  };
  const cfg = map[status] ?? {
    label: status,
    color: "#A0A0A0",
    bg: "rgba(160,160,160,0.1)",
  };
  return (
    <span style={{ ...s.badge, color: cfg.color, backgroundColor: cfg.bg }}>
      {cfg.label}
    </span>
  );
}

// --- Styles ---

const s: Record<string, React.CSSProperties> = {
  wrapper: { display: "flex", minHeight: "100vh", backgroundColor: "#0D0D0D" },
  main: {
    flex: 1,
    padding: "2rem",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  loadingWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#0D0D0D",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titulo: { color: "#FFFFFF", fontSize: "2rem", fontWeight: 700, margin: 0 },
  subtitulo: { color: "#A0A0A0", fontSize: "0.9rem", margin: "0.25rem 0 0 0" },
  botaoNovo: {
    padding: "0.65rem 1.25rem",
    backgroundColor: "#9BFF97",
    color: "#000",
    border: "none",
    borderRadius: "8px",
    fontWeight: 700,
    fontSize: "0.9rem",
    cursor: "pointer",
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1rem",
  },
  kpiCard: {
    backgroundColor: "#1A1A1A",
    border: "1px solid #2A2A2A",
    borderRadius: "12px",
    padding: "1.25rem 1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  kpiTitulo: {
    color: "#A0A0A0",
    fontSize: "0.8rem",
    margin: 0,
    fontWeight: 500,
  },
  kpiValor: {
    fontSize: "1.5rem",
    fontWeight: 800,
    margin: 0,
    letterSpacing: "-0.02em",
  },
  kpiSub: { color: "#555", fontSize: "0.78rem", margin: 0 },
  graficos: { display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1rem" },
  graficoCard: {
    backgroundColor: "#1A1A1A",
    border: "1px solid #2A2A2A",
    borderRadius: "12px",
    padding: "1.5rem",
  },
  graficoTitulo: {
    color: "#FFFFFF",
    fontWeight: 700,
    fontSize: "1rem",
    margin: "0 0 2px 0",
  },
  graficoSub: { color: "#A0A0A0", fontSize: "0.8rem", margin: "0 0 1.25rem 0" },
  filtrosCard: {
    backgroundColor: "#1A1A1A",
    border: "1px solid #2A2A2A",
    borderRadius: "12px",
    padding: "1.25rem 1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  filtrosLinha: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
    alignItems: "flex-end",
  },
  buscaWrap: {
    flex: 1,
    minWidth: "200px",
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  buscaIcone: { position: "absolute", left: "12px", fontSize: "0.9rem" },
  buscaInput: {
    width: "100%",
    padding: "0.65rem 1rem 0.65rem 2.5rem",
    borderRadius: "8px",
    border: "1px solid #2A2A2A",
    backgroundColor: "#0D0D0D",
    color: "#FFFFFF",
    fontSize: "0.9rem",
    outline: "none",
    boxSizing: "border-box",
  },
  select: {
    padding: "0.65rem 1rem",
    borderRadius: "8px",
    border: "1px solid #2A2A2A",
    backgroundColor: "#0D0D0D",
    color: "#FFFFFF",
    fontSize: "0.9rem",
    outline: "none",
    cursor: "pointer",
  },
  contagem: { color: "#555", fontSize: "0.8rem", margin: 0 },
  tabelaCard: {
    backgroundColor: "#1A1A1A",
    border: "1px solid #2A2A2A",
    borderRadius: "12px",
    overflow: "hidden",
  },
  tabela: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "0.85rem 1.25rem",
    color: "#555",
    fontSize: "0.75rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    textAlign: "left",
    borderBottom: "1px solid #2A2A2A",
    backgroundColor: "#111",
  },
  td: {
    padding: "0.9rem 1.25rem",
    borderBottom: "1px solid #161616",
    verticalAlign: "middle",
  },
  semDados: {
    padding: "3rem",
    color: "#555",
    fontSize: "0.9rem",
    textAlign: "center",
  },
  tag: {
    backgroundColor: "#2A2A2A",
    color: "#A0A0A0",
    fontSize: "0.75rem",
    padding: "0.2rem 0.6rem",
    borderRadius: "4px",
  },
  badge: {
    fontSize: "0.78rem",
    padding: "0.25rem 0.65rem",
    borderRadius: "20px",
    fontWeight: 600,
  },
};

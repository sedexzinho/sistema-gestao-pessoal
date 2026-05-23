import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../context/useAuth";
import api from "../api/axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

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

type FiltroTipoDespesa = "TODOS" | "AVULSO" | "PARCELADO";
type FiltroStatusDespesa = "TODOS" | "PENDENTE" | "PAGO" | "CONCLUIDO";
type OrdenacaoDespesa = "data_desc" | "data_asc" | "valor_desc" | "valor_asc";

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

interface TooltipPayload {
  value?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

const tooltipStyle: React.CSSProperties = {
  backgroundColor: "#1A1A1A",
  border: "1px solid #2A2A2A",
  borderRadius: "8px",
  padding: "10px 14px",
};

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const valor = payload[0].value ?? 0;
    return (
      <div style={tooltipStyle}>
        <p
          style={{ color: "#A0A0A0", fontSize: "0.78rem", margin: "0 0 4px 0" }}
        >
          {label}
        </p>
        <p
          style={{
            color: "#FF5C5C",
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

export function Despesas() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [loading, setLoading] = useState(true);

  const [filtroTipo, setFiltroTipo] = useState<FiltroTipoDespesa>("TODOS");
  const [filtroStatus, setFiltroStatus] =
    useState<FiltroStatusDespesa>("TODOS");
  const [filtroCategoria, setFiltroCategoria] = useState("TODAS");
  const [filtroBusca, setFiltroBusca] = useState("");
  const [ordenacao, setOrdenacao] = useState<OrdenacaoDespesa>("data_desc");

  useEffect(() => {
    async function carregar() {
      try {
        const res = await api.get("/despesas/listar");
        setDespesas(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, [usuario]);

  // ✅ Uma única declaração correta de handlePagar
  async function handlePagar(id: number) {
    try {
      const res = await api.patch(`/despesas/pagar/${id}`);
      setDespesas((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...res.data } : d)),
      );
    } catch (err) {
      console.error(err);
    }
  }

  const categorias = useMemo(() => {
    return [...new Set(despesas.map((d) => d.nomeCategoria))].filter(Boolean);
  }, [despesas]);

  const despesasFiltradas = useMemo(() => {
    let lista = [...despesas];
    if (filtroTipo !== "TODOS")
      lista = lista.filter((d) => d.tipo === filtroTipo);
    if (filtroStatus !== "TODOS")
      lista = lista.filter((d) => d.status === filtroStatus);
    if (filtroCategoria !== "TODAS")
      lista = lista.filter((d) => d.nomeCategoria === filtroCategoria);
    if (filtroBusca)
      lista = lista.filter((d) =>
        d.nome.toLowerCase().includes(filtroBusca.toLowerCase()),
      );

    lista.sort((a, b) => {
      if (ordenacao === "data_desc")
        return (
          new Date(b.dataRegistro).getTime() -
          new Date(a.dataRegistro).getTime()
        );
      if (ordenacao === "data_asc")
        return (
          new Date(a.dataRegistro).getTime() -
          new Date(b.dataRegistro).getTime()
        );
      if (ordenacao === "valor_desc") return b.valor - a.valor;
      if (ordenacao === "valor_asc") return a.valor - b.valor;
      return 0;
    });
    return lista;
  }, [
    despesas,
    filtroTipo,
    filtroStatus,
    filtroCategoria,
    filtroBusca,
    ordenacao,
  ]);

  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  const totalAvulsasMes = despesas
    .filter(
      (d) =>
        d.tipo === "AVULSO" &&
        new Date(d.dataRegistro).getMonth() === mesAtual &&
        new Date(d.dataRegistro).getFullYear() === anoAtual,
    )
    .reduce((acc, d) => acc + d.valor, 0);

  const totalParceladasAtivas = despesas.filter(
    (d) => d.tipo === "PARCELADO" && d.status !== "CONCLUIDO",
  ).length;

  const totalGeralMes = despesas
    .filter(
      (d) =>
        new Date(d.dataRegistro).getMonth() === mesAtual &&
        new Date(d.dataRegistro).getFullYear() === anoAtual,
    )
    .reduce((acc, d) => acc + d.valor, 0);

  const maiorDespesa = [...despesas].sort((a, b) => b.valor - a.valor)[0];

  const dadosMensais = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const m = d.getMonth();
      const a = d.getFullYear();
      const total = despesas
        .filter(
          (dep) =>
            dep.tipo === "AVULSO" &&
            new Date(dep.dataRegistro).getMonth() === m &&
            new Date(dep.dataRegistro).getFullYear() === a,
        )
        .reduce((acc, dep) => acc + dep.valor, 0);
      return { mes: MESES[m], valor: total };
    });
  }, [despesas]);

  const dadosCategorias = useMemo(() => {
    const mapa: Record<string, number> = {};
    despesas.forEach((d) => {
      if (d.nomeCategoria)
        mapa[d.nomeCategoria] = (mapa[d.nomeCategoria] || 0) + d.valor;
    });
    return Object.entries(mapa).map(([name, value]) => ({ name, value }));
  }, [despesas]);

  const PIE_COLORS = [
    "#FF5C5C",
    "#FFB800",
    "#9BFF97",
    "#5C9EFF",
    "#C45CFF",
    "#FF8C5C",
  ];

  if (loading) {
    return (
      <div style={s.loadingWrap}>
        <div style={s.loadingDot} />
        <p style={{ color: "#A0A0A0", fontSize: "0.9rem", marginTop: "1rem" }}>
          Carregando despesas...
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
            <h1 style={s.titulo}>Despesas</h1>
            <p style={s.subtitulo}>Análise completa dos seus gastos</p>
          </div>
          <button
            style={s.botaoNovo}
            onClick={() => navigate("/despesas/nova")}
          >
            + Nova Despesa
          </button>
        </div>

        {/* KPI Cards */}
        <div style={s.kpiGrid}>
          <KpiCard
            titulo="Total este mês"
            valor={formatarMoeda(totalGeralMes)}
            sub="Avulsas + parcelas vencidas"
            icone="📉"
            accent="#FF5C5C"
          />
          <KpiCard
            titulo="Despesas avulsas"
            valor={formatarMoeda(totalAvulsasMes)}
            sub="Mês corrente"
            icone="🧾"
            accent="#FF5C5C"
          />
          <KpiCard
            titulo="Parcelamentos ativos"
            valor={String(totalParceladasAtivas)}
            sub="Em andamento"
            icone="💳"
            accent="#FFB800"
          />
          <KpiCard
            titulo="Maior gasto"
            valor={maiorDespesa ? formatarMoeda(maiorDespesa.valor) : "—"}
            sub={maiorDespesa?.nome || "—"}
            icone="⚠️"
            accent="#FF5C5C"
          />
        </div>

        {/* Gráficos */}
        <div style={s.graficos}>
          <div style={s.graficoCard}>
            <p style={s.graficoTitulo}>Gastos mensais</p>
            <p style={s.graficoSub}>Últimos 6 meses — despesas avulsas</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dadosMensais} barSize={28}>
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
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                />
                <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                  {dadosMensais.map((_, index) => (
                    <Cell
                      key={index}
                      fill={
                        index === dadosMensais.length - 1
                          ? "#FF5C5C"
                          : "#2A1A1A"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={s.graficoCard}>
            <p style={s.graficoTitulo}>Por categoria</p>
            <p style={s.graficoSub}>Distribuição acumulada</p>
            {dadosCategorias.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={dadosCategorias}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {dadosCategorias.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value) => (
                      <span style={{ color: "#A0A0A0", fontSize: "0.78rem" }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
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
                placeholder="Buscar despesa..."
                value={filtroBusca}
                onChange={(e) => setFiltroBusca(e.target.value)}
                style={s.buscaInput}
              />
            </div>
            <FiltroSelect
              label="Tipo"
              value={filtroTipo}
              onChange={(v) => setFiltroTipo(v as FiltroTipoDespesa)}
              options={[
                { label: "Todos", value: "TODOS" },
                { label: "Avulso", value: "AVULSO" },
                { label: "Parcelado", value: "PARCELADO" },
              ]}
            />
            <FiltroSelect
              label="Status"
              value={filtroStatus}
              onChange={(v) => setFiltroStatus(v as FiltroStatusDespesa)}
              options={[
                { label: "Todos", value: "TODOS" },
                { label: "Pendente", value: "PENDENTE" },
                { label: "Pago", value: "PAGO" },
                { label: "Concluído", value: "CONCLUIDO" },
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
              onChange={(v) => setOrdenacao(v as OrdenacaoDespesa)}
              options={[
                { label: "Mais recente", value: "data_desc" },
                { label: "Mais antigo", value: "data_asc" },
                { label: "Maior valor", value: "valor_desc" },
                { label: "Menor valor", value: "valor_asc" },
              ]}
            />
          </div>
          <p style={s.contagem}>
            {despesasFiltradas.length} despesa
            {despesasFiltradas.length !== 1 ? "s" : ""} encontrada
            {despesasFiltradas.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* ✅ Tabela reconstruída corretamente */}
        <div style={s.tabelaCard}>
          <table style={s.tabela}>
            <thead>
              <tr>
                {[
                  "Nome",
                  "Categoria",
                  "Tipo",
                  "Valor",
                  "Data",
                  "Status",
                  "Parcelas",
                  "Ação",
                ].map((h) => (
                  <th key={h} style={s.th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {despesasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={8} style={s.semDados}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <span style={{ fontSize: "2rem" }}>📭</span>
                      <span>Nenhuma despesa encontrada</span>
                    </div>
                  </td>
                </tr>
              ) : (
                despesasFiltradas.map((d, i) => (
                  <tr
                    key={d.id}
                    style={{
                      backgroundColor:
                        i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)",
                      transition: "background-color 0.15s",
                    }}
                  >
                    {/* Nome */}
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
                            backgroundColor:
                              d.tipo === "PARCELADO"
                                ? "rgba(255,184,0,0.1)"
                                : "rgba(255,92,92,0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.85rem",
                            flexShrink: 0,
                          }}
                        >
                          {d.tipo === "PARCELADO" ? "💳" : "🧾"}
                        </div>
                        <span
                          style={{
                            color: "#FFFFFF",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                          }}
                        >
                          {d.nome}
                        </span>
                      </div>
                    </td>

                    {/* Categoria */}
                    <td style={s.td}>
                      <span style={s.tag}>{d.nomeCategoria || "—"}</span>
                    </td>

                    {/* Tipo */}
                    <td style={s.td}>
                      <span
                        style={{
                          ...s.badge,
                          backgroundColor:
                            d.tipo === "PARCELADO"
                              ? "rgba(255,184,0,0.12)"
                              : "rgba(255,92,92,0.12)",
                          color: d.tipo === "PARCELADO" ? "#FFB800" : "#FF5C5C",
                        }}
                      >
                        {d.tipo === "PARCELADO" ? "Parcelado" : "Avulso"}
                      </span>
                    </td>

                    {/* Valor */}
                    <td style={{ ...s.td, color: "#FF5C5C", fontWeight: 700 }}>
                      {formatarMoeda(d.valor)}
                    </td>

                    {/* Data */}
                    <td
                      style={{ ...s.td, color: "#A0A0A0", fontSize: "0.85rem" }}
                    >
                      {formatarData(d.dataRegistro)}
                    </td>

                    {/* Status */}
                    <td style={s.td}>
                      <StatusBadge status={d.status} />
                    </td>

                    {/* Parcelas */}
                    <td style={s.td}>
                      {d.tipo === "PARCELADO" ? (
                        <div>
                          <p
                            style={{
                              margin: 0,
                              color: "#FFFFFF",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                            }}
                          >
                            {d.parcelaAtual}/{d.totalParcelas}
                          </p>
                          <div style={s.progressoBar}>
                            <div
                              style={{
                                ...s.progressoFill,
                                width: `${((d.parcelaAtual ?? 0) / (d.totalParcelas ?? 1)) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: "#555", fontSize: "0.8rem" }}>
                          —
                        </span>
                      )}
                    </td>

                    {/* ✅ Ação — botão Pagar */}
                    <td style={s.td}>
                      {d.status !== "PAGO" && d.status !== "CONCLUIDO" ? (
                        <button
                          onClick={() => handlePagar(d.id)}
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
                          {d.tipo === "PARCELADO"
                            ? "✓ Pagar parcela"
                            : "✓ Pagar"}
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
    PENDENTE: {
      label: "Pendente",
      color: "#FFB800",
      bg: "rgba(255,184,0,0.12)",
    },
    PAGO: { label: "Pago", color: "#9BFF97", bg: "rgba(155,255,151,0.12)" },
    CONCLUIDO: {
      label: "Concluído",
      color: "#5C9EFF",
      bg: "rgba(92,158,255,0.12)",
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
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#0D0D0D",
  },
  loadingDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: "#FF5C5C",
    animation: "pulse 1.2s infinite",
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
  graficos: { display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "1rem" },
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
  progressoBar: {
    width: "80px",
    height: "4px",
    backgroundColor: "#2A2A2A",
    borderRadius: "2px",
    marginTop: "4px",
    overflow: "hidden",
  },
  progressoFill: {
    height: "100%",
    backgroundColor: "#FFB800",
    borderRadius: "2px",
    transition: "width 0.3s ease",
  },
};

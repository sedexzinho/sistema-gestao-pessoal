import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";

export function Sidebar() {
  const { pathname } = useLocation();
  const { logout, usuario } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const linkStyle = (path: string): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.65rem 1rem",
    borderRadius: "8px",
    color: pathname === path ? "#9BFF97" : "#A0A0A0",
    backgroundColor:
      pathname === path ? "rgba(155, 255, 151, 0.08)" : "transparent",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: pathname === path ? 600 : 400,
    transition: "all 0.2s",
  });

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>
        <div style={styles.logoIcon}>💰</div>
        <div>
          <p style={styles.logoNome}>{usuario?.nome}</p>
          <p style={styles.logoSub}>Finanças pessoais</p>
        </div>
      </div>

      <nav style={styles.nav}>
        <Link to="/despesas/nova" style={linkStyle("/despesas/nova")}>
          <span>➕</span> Nova Despesa
        </Link>
        <Link
          to="/categorias/despesas/nova"
          style={linkStyle("/categorias/despesas/nova")}
        >
          <span>🏷️</span> Nova Cat. Despesa
        </Link>
        <Link
          to="/categorias/receitas/nova"
          style={linkStyle("/categorias/receitas/nova")}
        >
          <span>🏷️</span> Nova Cat. Receita
        </Link>
        <p style={styles.secao}>Geral</p>
        <Link to="/dashboard" style={linkStyle("/dashboard")}>
          <span>📊</span> Dashboard
        </Link>
        <Link to="/despesas" style={linkStyle("/despesas")}>
          <span>📋</span> Despesas
        </Link>
        <Link to="/receitas" style={linkStyle("/receitas")}>
          <span>📈</span> Receitas
        </Link>

        <p style={styles.secao}>Categorias</p>
        <Link
          to="/categorias/despesas"
          style={linkStyle("/categorias/despesas")}
        >
          <span>🏷️</span> Cat. Despesas
        </Link>
        <Link
          to="/categorias/receitas"
          style={linkStyle("/categorias/receitas")}
        >
          <span>🏷️</span> Cat. Receitas
        </Link>
        <Link to="/receitas/nova" style={linkStyle("/receitas/nova")}>
          <span>➕</span> Nova Receita
        </Link>
      </nav>

      <button onClick={handleLogout} style={styles.botaoSair}>
        <span>🚪</span> Sair
      </button>
    </aside>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: "260px",
    minWidth: "260px",
    backgroundColor: "#111111",
    borderRight: "1px solid #2A2A2A",
    display: "flex",
    flexDirection: "column",
    padding: "1.5rem 1rem",
    minHeight: "100vh",
    position: "sticky",
    top: 0,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginBottom: "2rem",
    padding: "0 0.5rem",
  },
  logoIcon: {
    fontSize: "1.75rem",
    backgroundColor: "rgba(155, 255, 151, 0.1)",
    borderRadius: "10px",
    padding: "0.4rem",
  },
  logoNome: {
    color: "#FFFFFF",
    fontWeight: 700,
    fontSize: "0.95rem",
    margin: 0,
  },
  logoSub: {
    color: "#A0A0A0",
    fontSize: "0.75rem",
    margin: 0,
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    flex: 1,
  },
  secao: {
    color: "#555",
    fontSize: "0.72rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    margin: "1rem 0 0.5rem 0.5rem",
  },
  botaoSair: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.65rem 1rem",
    borderRadius: "8px",
    color: "#FF5C5C",
    backgroundColor: "transparent",
    border: "none",
    fontSize: "0.9rem",
    cursor: "pointer",
    marginTop: "1rem",
  },
};

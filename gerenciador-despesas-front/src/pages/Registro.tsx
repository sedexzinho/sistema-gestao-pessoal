import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import axios from "axios";

export function Registro() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    codigo: "",
    salarioMensal: "",
  });

  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleRegistro(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (form.senha !== form.confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/registro", {
        nome: form.nome,
        email: form.email,
        senha: form.senha,
        codigo: form.codigo,
        salarioMensal: parseFloat(form.salarioMensal),
      });
      navigate("/login");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setErro("Email já cadastrado.");
      } else {
        setErro("Erro ao criar conta. Tente novamente.");
      }
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.titulo}>Criar Conta</h2>
        <p style={styles.subtitulo}>Comece a controlar suas finanças</p>

        <form onSubmit={handleRegistro} style={styles.form}>
          <div style={styles.grupo}>
            <label style={styles.label}>Nome completo</label>
            <input
              name="nome"
              type="text"
              placeholder="Seu nome"
              value={form.nome}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.grupo}>
            <label style={styles.label}>Email</label>
            <input
              name="email"
              type="email"
              placeholder="seu@email.com"
              value={form.email}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>


          <div style={styles.grupo}>
            <label style={styles.label}>Salário mensal</label>
            <input
              name="salarioMensal"
              type="number"
              placeholder="Ex: 5000.00"
              value={form.salarioMensal}
              onChange={handleChange}
              style={styles.input}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div style={styles.grupo}>
            <label style={styles.label}>Senha</label>
            <input
              name="senha"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={form.senha}
              onChange={handleChange}
              style={styles.input}
              minLength={6}
              required
            />
          </div>

          <div style={styles.grupo}>
            <label style={styles.label}>Confirmar senha</label>
            <input
              name="confirmarSenha"
              type="password"
              placeholder="Repita a senha"
              value={form.confirmarSenha}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          {erro && <p style={styles.erro}>{erro}</p>}

          <button type="submit" style={styles.botao} disabled={loading}>
            {loading ? "Criando conta..." : "Criar conta"}
          </button>

          <p style={styles.linkTexto}>
            Já tem uma conta?{" "}
            <Link to="/login" style={styles.link}>
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#0D0D0D",
    padding: "2rem",
  },
  card: {
    backgroundColor: "#0D0D0D",
    padding: "2.5rem",
    borderRadius: "12px",
    border: "none",
    width: "100%",
    maxWidth: "440px",
  },
  titulo: {
    color: "#FFFFFF",
    margin: "0 0 0.5rem 0",
    fontSize: "1.75rem",
    fontWeight: 700,
  },
  subtitulo: {
    color: "#A0A0A0",
    margin: "0 0 2rem 0",
    fontSize: "0.95rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  grupo: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  label: {
    color: "#A0A0A0",
    fontSize: "0.85rem",
    fontWeight: 500,
  },
  input: {
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    border: "1px solid #2A2A2A",
    backgroundColor: "#0D0D0D",
    color: "#FFFFFF",
    fontSize: "1rem",
    outline: "none",
  },
  botao: {
    padding: "0.85rem",
    backgroundColor: "#9BFF97",
    color: "#000000",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: "0.5rem",
  },
  erro: {
    color: "#FF5C5C",
    fontSize: "0.875rem",
    textAlign: "center",
    margin: 0,
  },
  linkTexto: {
    textAlign: "center",
    color: "#A0A0A0",
    fontSize: "0.9rem",
    margin: 0,
  },
  link: {
    color: "#9BFF97",
    textDecoration: "none",
    fontWeight: 600,
  },
};

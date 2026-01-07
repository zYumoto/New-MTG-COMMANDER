import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      nav("/lobby");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrap}>
      <form onSubmit={onSubmit} style={styles.card}>
        <h2 style={styles.h2}>Login</h2>

        <label style={styles.label}>E-mail</label>
        <input
          style={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
        />

        <label style={styles.label}>Senha</label>
        <input
          style={styles.input}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••"
        />

        {error && <p style={styles.error}>{error}</p>}

        <button style={styles.btn} disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <p style={styles.p}>
          Não tem conta? <Link to="/register">Criar agora</Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  wrap: { minHeight: "100vh", display: "grid", placeItems: "center", padding: 16 },
  card: { width: "100%", maxWidth: 420, border: "1px solid #333", borderRadius: 12, padding: 16 },
  h2: { marginTop: 0 },
  label: { display: "block", marginTop: 12, marginBottom: 6 },
  input: { width: "100%", padding: 10, borderRadius: 10, border: "1px solid #444" },
  btn: { width: "100%", marginTop: 16, padding: 10, borderRadius: 10, cursor: "pointer" },
  error: { color: "tomato", marginTop: 10 },
  p: { marginTop: 14 },
};

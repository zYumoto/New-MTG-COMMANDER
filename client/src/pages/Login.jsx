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
  <div className="auth-background">
    <form onSubmit={onSubmit} className="auth-card">
      <h2 className="auth-title">Login</h2>

      <label className="auth-label">E-mail</label>
      <input
        className="auth-input"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="seu@email.com"
      />

      <label className="auth-label">Senha</label>
      <input
        className="auth-input"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••"
      />

      {error && <p className="auth-error">{error}</p>}

      <button className="auth-button" disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </button>

      <div className="auth-footer">
        Não tem conta? <Link to="/register">Criar agora</Link>
      </div>
    </form>
  </div>
)
}
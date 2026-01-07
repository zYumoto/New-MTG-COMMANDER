import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const nav = useNavigate();
  const { register } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(username, email, password);
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
      <h2 className="auth-title">Criar Conta</h2>

      <label className="auth-label">Username</label>
      <input
        className="auth-input"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Victor"
      />

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
        {loading ? "Criando..." : "Criar conta"}
      </button>

      <div className="auth-footer">
        Já tem conta? <Link to="/login">Fazer login</Link>
      </div>
    </form>
  </div>
);
}
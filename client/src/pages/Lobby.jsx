import { useAuth } from "../context/AuthContext";

export default function Lobby() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: 16 }}>
      <h2>Lobby</h2>
      <p>Logado como: <b>{user?.username}</b> ({user?.email})</p>

      <button onClick={logout} style={{ padding: 10, borderRadius: 10, cursor: "pointer" }}>
        Sair
      </button>

      <hr style={{ margin: "16px 0" }} />

      <p>Próximo passo: criar sala / listar salas / entrar em sala.</p>
    </div>
  );
}

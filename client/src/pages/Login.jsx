import { useAuth } from "../context/AuthContext";

export default function Lobby() {
  const { user, logout } = useAuth();

  // mock (por enquanto) — depois vem do backend
  const rooms = [
    { id: "1", name: "Mesa do Caos", owner: "nick", players: "1/4", locked: false },
    { id: "2", name: "Commander Night", owner: "nick", players: "1/2", locked: false },
    { id: "3", name: "Tryhard", owner: "nick", players: "1/3", locked: false },
    { id: "4", name: "Fechada", owner: "nick", players: "1/4", locked: true },
  ];

  return (
    <div className="page-shell">
      <div className="lobby-shell">
        {/* Top title */}
        <div className="lobby-top-title">LOBBY</div>

        <div className="lobby-grid">
          {/* LEFT MAIN */}
          <section className="panel panel-main">
            <div className="panel-header">
              <div className="pill-title">Lobby</div>
            </div>

            <div className="lobby-actions">
              <input className="input" placeholder="Pesquisar sala" />
              <button className="btn">Criar Sala</button>
            </div>

            <div className="rooms-grid">
              {rooms.map((r) => (
                <div key={r.id} className="room-card">
                  <div className="room-title">
                    SALA: <span>{r.name}</span>
                  </div>
                  <div className="room-sub">dono: {r.owner}</div>
                  <div className="room-sub">{r.players}</div>

                  {r.locked && <div className="room-lock" title="Sala bloqueada">🔒</div>}
                </div>
              ))}
            </div>
          </section>

          {/* RIGHT SIDEBAR */}
          <aside className="panel panel-side">
            <div className="profile-row">
              <div className="avatar">FOTO</div>
              <div className="nickname">{user?.username || "NICKNAME"}</div>
            </div>

            <button className="btn btn-secondary">Meus Decks</button>

            <div className="friends-box">
              <div className="friends-title">Amigos</div>
              <div className="friends-empty">Sem amigos carregados (por enquanto)</div>
            </div>

            <button className="btn btn-ghost">Configurações</button>
            <button className="btn btn-danger" onClick={logout}>Sair</button>

            <div className="small-muted">logado: {user?.email}</div>
          </aside>
        </div>
      </div>
    </div>
  );
}

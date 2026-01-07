import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import CreateRoomModal from "../components/CreateRoomModal";
import { apiGet, apiPost } from "../services/api";

export default function Lobby() {
  const { user, token, logout } = useAuth();

  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // =========================
  // Carregar salas do backend
  // =========================
  async function loadRooms() {
    setLoadingRooms(true);
    try {
      const data = await apiGet("/api/rooms", token);
      setRooms(data.rooms || []);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoadingRooms(false);
    }
  }

  useEffect(() => {
    loadRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================
  // Criar sala
  // =========================
  async function handleCreateRoom(data) {
    try {
      await apiPost("/api/rooms", data, token);
      await loadRooms(); // atualiza lista após criar
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <>
      <div className="page-shell">
        <div className="lobby-shell">
          {/* Título topo */}
          <div className="lobby-top-title">LOBBY</div>

          <div className="lobby-grid">
            {/* ================= MAIN ================= */}
            <section className="panel panel-main">
              <div className="panel-header">
                <div className="pill-title">Lobby</div>
              </div>

              {/* Ações */}
              <div className="lobby-actions">
                <input className="input" placeholder="Pesquisar sala" />
                <button className="btn" onClick={() => setIsCreateOpen(true)}>
                  Criar Sala
                </button>
              </div>

              {/* Lista de salas */}
              <div className="rooms-grid">
                {loadingRooms ? (
                  <div style={{ opacity: 0.8 }}>Carregando salas...</div>
                ) : rooms.length === 0 ? (
                  <div style={{ opacity: 0.8 }}>Nenhuma sala criada ainda.</div>
                ) : (
                  rooms.map((room) => (
                    <div
                      key={room.id}
                      className={`room-card ${room.isPrivate ? "is-locked" : ""}`}
                      onClick={() => {
                        alert(`Entrar na sala: ${room.name} (em breve)`);
                      }}
                    >
                      <div className="room-title">
                        SALA: <span>{room.name}</span>
                      </div>

                      <div className="room-sub">
                        dono: {room.ownerUsername}
                      </div>

                      <div className="room-sub">
                        {room.playersCount}/{room.maxPlayers}
                      </div>

                      {room.isPrivate && (
                        <div className="room-lock" title="Sala privada">
                          🔒
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* ================= SIDEBAR ================= */}
            <aside className="panel panel-side">
              {/* Perfil */}
              <div className="profile-row">
                <div className="avatar">FOTO</div>
                <div className="nickname">
                  {user?.username || "Nickname"}
                </div>
              </div>

              <button className="btn btn-secondary">
                Meus Decks
              </button>

              {/* Amigos */}
              <div className="friends-box">
                <div className="friends-title">Amigos</div>
                <div className="friends-empty">
                  Nenhum amigo online
                </div>
              </div>

              <button className="btn btn-ghost">
                Configurações
              </button>

              <button
                className="btn btn-danger"
                onClick={logout}
              >
                Sair
              </button>

              <div className="small-muted">
                {user?.email}
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      <CreateRoomModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateRoom}
      />
    </>
  );
}

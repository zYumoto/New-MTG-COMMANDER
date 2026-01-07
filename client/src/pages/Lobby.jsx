import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CreateRoomModal from "../components/CreateRoomModal";
import { apiGet, apiPost } from "../services/api";

export default function Lobby() {
  const nav = useNavigate();
  const { user, token, logout } = useAuth();

  // Perfil real do backend (pra avatar/bio/etc)
  const [me, setMe] = useState(null);

  // Salas
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  // Modal criar sala
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // =========================
  // Carregar perfil (me)
  // =========================
  async function loadMe() {
    try {
      const data = await apiGet("/api/users/me", token);
      setMe(data.user);
    } catch (err) {
      console.error(err);
    }
  }

  // =========================
  // Carregar salas
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
    loadMe();
    loadRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================
  // Criar sala
  // =========================
  async function handleCreateRoom(payload) {
    try {
      await apiPost("/api/rooms", payload, token);
      await loadRooms();
    } catch (err) {
      alert(err.message);
      throw err;
    }
  }

  const avatarSrc = me?.avatarData || me?.avatarUrl || "";

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

                      <div className="room-sub">dono: {room.ownerUsername}</div>

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
              {/* Perfil (clicável) */}
              <div
                className="profile-row profile-click"
                onClick={() => nav("/profile")}
                title="Abrir perfil"
              >
                <div className="avatar" style={{ overflow: "hidden" }}>
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="avatar" className="avatar-img" />
                  ) : (
                    "FOTO"
                  )}
                </div>

                <div className="nickname">
                  {me?.username || user?.username || "Nickname"}
                </div>
              </div>

              <button className="btn btn-secondary">Meus Decks</button>

              {/* Amigos */}
              <div className="friends-box">
                <div className="friends-title">Amigos</div>
                <div className="friends-empty">Nenhum amigo online</div>
              </div>

              <button className="btn btn-ghost">Configurações</button>

              <button className="btn btn-danger" onClick={logout}>
                Sair
              </button>

              <div className="small-muted">{me?.email || user?.email}</div>
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

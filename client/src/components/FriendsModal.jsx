import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "../services/api";

export default function FriendsModal({ open, onClose, token }) {
  const [tab, setTab] = useState("FRIENDS"); // FRIENDS | REQUESTS
  const [friends, setFriends] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);

  const [usernameOrEmail, setUsernameOrEmail] = useState("");

  const onlineCount = useMemo(() => friends.filter((f) => f.status === "ONLINE").length, [friends]);

  async function loadAll() {
    setLoading(true);
    try {
      const f = await apiGet("/api/friends", token);
      const r = await apiGet("/api/friends/requests", token);
      setFriends(f.friends || []);
      setIncoming(r.incoming || []);
      setOutgoing(r.outgoing || []);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function doPing() {
    try {
      await apiPost("/api/friends/ping", {}, token);
    } catch (_) {}
  }

  useEffect(() => {
    if (!open) return;
    loadAll();
    doPing();

    const i1 = setInterval(() => doPing(), 20000);
    const i2 = setInterval(() => loadAll(), 15000);

    return () => {
      clearInterval(i1);
      clearInterval(i2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    function onKeyDown(e) {
      if (!open) return;
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  async function sendInvite() {
    try {
      if (!usernameOrEmail.trim()) return alert("Digite o username ou email.");
      await apiPost("/api/friends/requests", { usernameOrEmail: usernameOrEmail.trim() }, token);
      setUsernameOrEmail("");
      await loadAll();
    } catch (err) {
      alert(err.message);
    }
  }

  async function respond(id, action) {
    try {
      await apiPost(`/api/friends/requests/${id}/respond`, { action }, token);
      await loadAll();
    } catch (err) {
      alert(err.message);
    }
  }

  if (!open) return null;

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal-card modal-card-wide friends-card" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Amigos</div>
          <button className="modal-close" onClick={onClose} aria-label="Fechar">✕</button>
        </div>

        <div className="friends-tabs">
          <button className={`friends-tab ${tab === "FRIENDS" ? "active" : ""}`} onClick={() => setTab("FRIENDS")}>
            Lista ({onlineCount}/{friends.length})
          </button>
          <button className={`friends-tab ${tab === "REQUESTS" ? "active" : ""}`} onClick={() => setTab("REQUESTS")}>
            Requests ({incoming.length})
          </button>
        </div>

        <div className="friends-body">
          <div className="friends-add">
            <input
              className="auth-input"
              placeholder="Adicionar por username ou email"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
            />
            <button className="btn" onClick={sendInvite}>Enviar</button>
          </div>

          {loading ? (
            <div style={{ opacity: 0.8 }}>Carregando...</div>
          ) : tab === "FRIENDS" ? (
            <div className="friends-list">
              {friends.length === 0 ? (
                <div style={{ opacity: 0.8 }}>Você ainda não tem amigos.</div>
              ) : (
                friends.map((f) => {
                  const avatar = f.avatarData || f.avatarUrl || "";
                  return (
                    <div key={f.id} className="friend-item">
                      <div className="friend-avatar">
                        {avatar ? <img src={avatar} alt="avatar" /> : <div className="avatar-fallback">F</div>}
                      </div>

                      <div className="friend-info">
                        <div className="friend-name">{f.username}</div>
                        <div className="friend-sub">{f.email}</div>
                      </div>

                      <div className={`friend-status ${f.status === "ONLINE" ? "on" : "off"}`}>
                        <span className="dot" />
                        {f.status === "ONLINE" ? "Online" : "Ausente"}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="requests-wrap">
              <div className="requests-col">
                <div className="requests-title">Recebidos</div>
                {incoming.length === 0 ? (
                  <div style={{ opacity: 0.8 }}>Nenhum request.</div>
                ) : (
                  incoming.map((r) => {
                    const avatar = r.from.avatarData || r.from.avatarUrl || "";
                    return (
                      <div key={r.id} className="request-item">
                        <div className="friend-avatar">
                          {avatar ? <img src={avatar} alt="avatar" /> : <div className="avatar-fallback">F</div>}
                        </div>

                        <div className="friend-info">
                          <div className="friend-name">{r.from.username}</div>
                          <div className="friend-sub">{r.from.email}</div>
                        </div>

                        <div className="request-actions">
                          <button className="btn btn-secondary" onClick={() => respond(r.id, "ACCEPT")}>Aceitar</button>
                          <button className="btn btn-ghost" onClick={() => respond(r.id, "DENY")}>Negar</button>
                          <button className="btn btn-danger" onClick={() => respond(r.id, "BLOCK")}>Bloquear</button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="requests-col">
                <div className="requests-title">Enviados</div>
                {outgoing.length === 0 ? (
                  <div style={{ opacity: 0.8 }}>Nenhum request enviado.</div>
                ) : (
                  outgoing.map((r) => (
                    <div key={r.id} className="request-item">
                      <div className="friend-info" style={{ paddingLeft: 6 }}>
                        <div className="friend-name">{r.to.username}</div>
                        <div className="friend-sub">{r.to.email}</div>
                      </div>
                      <div className="friend-status off">
                        <span className="dot" />
                        Pendente
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

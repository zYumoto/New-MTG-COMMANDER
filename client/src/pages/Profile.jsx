// client/src/pages/Profile.jsx
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiGet, apiPut } from "../services/api";
import EditProfileModal from "../components/EditProfileModal";

export default function Profile() {
  const { token } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const bgStyle = useMemo(() => {
    const bg = profile?.profileBgUrl?.trim();
    if (!bg) return {};
    return { backgroundImage: `url("${bg}")` };
  }, [profile]);

  async function loadMe() {
    setLoading(true);
    try {
      const data = await apiGet("/api/users/me", token);
      setProfile(data.user);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveProfile(payload) {
    try {
      const data = await apiPut("/api/users/me", payload, token);
      setProfile(data.user);
    } catch (err) {
      alert(err.message);
    }
  }

  const avatarSrc =
    profile?.avatarData ||
    profile?.avatarUrl ||
    "";

  return (
    <>
      <div className="profile-bg" style={bgStyle}>
        <div className="profile-blur">
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar">
                {avatarSrc ? <img src={avatarSrc} alt="avatar" /> : <div className="avatar-fallback">FOTO</div>}
              </div>

              <div className="profile-info">
                <div className="profile-name">{profile?.username || "NICKNAME"}</div>
                <div className="profile-desc">{profile?.bio || "Descrição"}</div>

                <button className="btn btn-secondary" onClick={() => setEditOpen(true)}>
                  Editar perfil
                </button>
              </div>
            </div>

            <div className="profile-decks">
              <div className="profile-decks-title">Decks públicos</div>

              <div className="profile-decks-box">
                {loading ? (
                  <div style={{ opacity: 0.8 }}>Carregando...</div>
                ) : (
                  <div style={{ opacity: 0.8 }}>
                    Espaço separado pra decks públicos (em breve)
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initial={profile}
        onSave={saveProfile}
      />
    </>
  );
}

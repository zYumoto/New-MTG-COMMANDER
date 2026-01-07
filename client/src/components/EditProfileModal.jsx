import { useEffect, useState } from "react";

export default function EditProfileModal({ open, onClose, initial, onSave }) {
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [profileBgUrl, setProfileBgUrl] = useState("");
  const [avatarData, setAvatarData] = useState("");

  useEffect(() => {
    if (!open) return;
    setBio(initial?.bio || "");
    setAvatarUrl(initial?.avatarUrl || "");
    setProfileBgUrl(initial?.profileBgUrl || "");
    setAvatarData(initial?.avatarData || "");
  }, [open, initial]);

  useEffect(() => {
    function onKeyDown(e) {
      if (!open) return;
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      setAvatarData(dataUrl);
      setAvatarUrl("");
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      bio: bio.slice(0, 160),
      avatarUrl: avatarUrl.trim(),
      avatarData: avatarData || "",
      profileBgUrl: profileBgUrl.trim()
    });
    onClose();
  }

  if (!open) return null;

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Editar Perfil</div>
          <button className="modal-close" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <label className="auth-label">Descrição</label>
          <textarea
            className="input textarea"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Fale um pouco sobre você..."
            maxLength={160}
          />

          <label className="auth-label">Avatar por URL</label>
          <input
            className="auth-input"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://..."
          />

          <div className="modal-row">
            <div>
              <div className="modal-row-title">Ou enviar do dispositivo</div>
              <div className="modal-row-sub">Escolha uma imagem leve (PNG/JPG).</div>
            </div>

            <input className="file" type="file" accept="image/*" onChange={handleFile} />
          </div>

          <label className="auth-label">Fundo (URL)</label>
          <input
            className="auth-input"
            value={profileBgUrl}
            onChange={(e) => setProfileBgUrl(e.target.value)}
            placeholder="https://... (opcional)"
          />

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

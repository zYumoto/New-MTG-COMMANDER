import { useEffect, useMemo, useState } from "react";

export default function EditProfileModal({ open, onClose, initial, onSave, onChangePassword }) {
  // Perfil
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [profileBgUrl, setProfileBgUrl] = useState("");
  const [avatarData, setAvatarData] = useState("");
  const [fileName, setFileName] = useState("");

  // Senha
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const canShowAvatarPreview = useMemo(() => {
    const src = avatarData || avatarUrl || initial?.avatarData || initial?.avatarUrl || "";
    return src;
  }, [avatarData, avatarUrl, initial]);

  useEffect(() => {
    if (!open) return;

    setBio(initial?.bio || "");
    setAvatarUrl(initial?.avatarUrl || "");
    setProfileBgUrl(initial?.profileBgUrl || "");
    setAvatarData(initial?.avatarData || "");
    setFileName("");

    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
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

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      setAvatarData(dataUrl);
      setAvatarUrl(""); // se fizer upload, limpa url
    };
    reader.readAsDataURL(file);
  }

  async function handleSaveProfile(e) {
    e.preventDefault();

    await onSave({
      bio: bio.slice(0, 160),
      avatarUrl: avatarUrl.trim(),
      avatarData: avatarData || "",
      profileBgUrl: profileBgUrl.trim(),
    });

    onClose();
  }

  async function handleChangePassword(e) {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      alert("Preencha senha atual, nova senha e confirmação.");
      return;
    }

    if (newPassword.length < 6) {
      alert("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      alert("A confirmação não bate com a nova senha.");
      return;
    }

    await onChangePassword({
      currentPassword,
      newPassword,
    });

    alert("Senha alterada com sucesso!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  }

  if (!open) return null;

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal-card modal-card-wide" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Editar Perfil</div>
          <button className="modal-close" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>

        <div className="modal-cols">
          {/* ================= COLUNA PERFIL ================= */}
          <form onSubmit={handleSaveProfile} className="modal-body">
            <div className="section-title">Perfil</div>

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

            <div className="upload-box">
              <div className="upload-info">
                <div className="upload-title">Ou enviar do dispositivo</div>
                <div className="upload-sub">Escolha uma imagem leve (PNG/JPG).</div>

                <div className="upload-row">
                  <label className="file-btn">
                    Selecionar imagem
                    <input type="file" accept="image/*" onChange={handleFile} />
                  </label>
                  <div className="file-name">{fileName || "Nenhum arquivo"}</div>
                </div>
              </div>

              <div className="upload-preview">
                {canShowAvatarPreview ? (
                  <img src={canShowAvatarPreview} alt="preview" />
                ) : (
                  <div className="preview-empty">Preview</div>
                )}
              </div>
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
                Salvar Perfil
              </button>
            </div>
          </form>

          {/* ================= COLUNA SENHA ================= */}
          <form onSubmit={handleChangePassword} className="modal-body">
            <div className="section-title">Segurança</div>

            <label className="auth-label">Senha atual</label>
            <input
              className="auth-input"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••"
            />

            <label className="auth-label">Nova senha</label>
            <input
              className="auth-input"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="mínimo 6 caracteres"
            />

            <label className="auth-label">Confirmar nova senha</label>
            <input
              className="auth-input"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="repita a nova senha"
            />

            <div className="modal-actions">
              <button type="submit" className="btn btn-secondary">
                Trocar Senha
              </button>
            </div>

            <div className="small-muted">
              Dica: use uma senha forte e não reutilize em outros sites.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

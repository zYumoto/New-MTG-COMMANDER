import { useEffect, useState } from "react";

export default function CreateRoomModal({ open, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");

  // reset quando abrir
  useEffect(() => {
    if (open) {
      setName("");
      setIsPrivate(false);
      setPassword("");
    }
  }, [open]);

  // ESC fecha
  useEffect(() => {
    function onKeyDown(e) {
      if (!open) return;
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  function handleSubmit(e) {
    e.preventDefault();

    if (!name.trim()) {
      alert("Digite o nome da sala.");
      return;
    }

    if (isPrivate && !password.trim()) {
      alert("Digite uma senha para sala privada.");
      return;
    }

    onCreate({
      name: name.trim(),
      isPrivate,
      password: isPrivate ? password.trim() : "",
    });

    onClose();
  }

  if (!open) return null;

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Criar Sala</div>
          <button className="modal-close" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <label className="auth-label">Nome da sala</label>
          <input
            className="auth-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Commander Night"
            maxLength={32}
          />

          <div className="modal-row">
            <label className="switch">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
              />
              <span className="switch-ui" />
            </label>

            <div>
              <div className="modal-row-title">Sala privada</div>
              <div className="modal-row-sub">
                Se ativar, precisa de senha para entrar.
              </div>
            </div>
          </div>

          <div className={`modal-password ${isPrivate ? "show" : ""}`}>
            <label className="auth-label">Senha</label>
            <input
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha da sala"
              type="password"
              maxLength={32}
              disabled={!isPrivate}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn">
              Criar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

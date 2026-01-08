import { useEffect, useRef, useState } from "react";
import { apiGet } from "../services/api";

export default function CardAutocomplete({ token, placeholder, onPick }) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!q.trim()) {
      setItems([]);
      setOpen(false);
      return;
    }

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await apiGet(`/api/cards/search?q=${encodeURIComponent(q.trim())}`, token);
        setItems(data.cards || []);
        setOpen(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timerRef.current);
  }, [q, token]);

  return (
    <div className="auto">
      <input
        className="input"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        onFocus={() => items.length && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
      />

      {open && (
        <div className="auto-dd">
          {loading ? (
            <div className="auto-row muted">Carregando...</div>
          ) : items.length === 0 ? (
            <div className="auto-row muted">Sem resultados</div>
          ) : (
            items.map((c) => (
              <button
                key={c.id}
                type="button"
                className="auto-row"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onPick(c);
                  setQ("");
                  setOpen(false);
                }}
              >
                <div className="auto-left">
                  <div className="auto-name">{c.name}</div>
                  <div className="auto-sub">{c.type_line}</div>
                </div>
                <div className="auto-chip">{c.set?.toUpperCase()}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

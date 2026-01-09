import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiGet } from "../services/api";
import CardAutocomplete from "../components/CardAutocomplete";
import useDisableZoom from "../hooks/useDisableZoom";

export default function DeckBuilder() {
  const nav = useNavigate();
  const { token } = useAuth();

  useDisableZoom();

  const [view, setView] = useState("VISUAL");
  const [deckName, setDeckName] = useState("Meu Deck");

  // Preview flutuante
  const [previewCard, setPreviewCard] = useState(null);
  const [previewPos, setPreviewPos] = useState({ x: 0, y: 0 });

  const [commander, setCommander] = useState(null);
  const [cards, setCards] = useState([]);

  // Coleções
  const [sets, setSets] = useState([]);
  const [setCode, setSetCode] = useState("");

  // Busca
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Carregar set (grid)
  const [setLoading, setSetLoading] = useState(false);
  const [setPage, setSetPage] = useState(1);
  const [setHasMore, setSetHasMore] = useState(false);

  // Precon
  const [preconLoading, setPreconLoading] = useState(false);

  const [deckSearch, setDeckSearch] = useState("");
  const [typeFilters, setTypeFilters] = useState({});


  const totalCards = useMemo(
    () => cards.reduce((s, c) => s + (c.qty || 0), 0),
    [cards]
  );

  function handleCardEnter(card, e) {
    const padding = 20;
    let x = e.clientX + padding;
    let y = e.clientY;

    const previewWidth = 300;
    if (x + previewWidth > window.innerWidth) {
      x = e.clientX - previewWidth - padding;
    }

    setPreviewCard(card);
    setPreviewPos({ x, y });
  }

  function handleCardLeave() {
    setPreviewCard(null);
  }

  function addCard(card, isCommander = false) {
    if (isCommander) {
      setCommander(card);
      return;
    }

    setCards((prev) => {
      const i = prev.findIndex((x) => x.id === card.id);
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = { ...copy[i], qty: (copy[i].qty || 1) + 1 };
        return copy;
      }
      return [...prev, { ...card, qty: 1 }];
    });
  }

  function removeCard(cardId) {
    setCards((prev) => {
      const i = prev.findIndex((x) => x.id === cardId);
      if (i < 0) return prev;

      const copy = [...prev];
      const qty = (copy[i].qty || 1) - 1;

      if (qty <= 0) copy.splice(i, 1);
      else copy[i] = { ...copy[i], qty };

      return copy;
    });
  }

  // carregar sets
  useEffect(() => {
    async function loadSets() {
      try {
        const data = await apiGet("/api/cards/sets", token);
        setSets(data.sets || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadSets();
  }, [token]);

  // busca live
  useEffect(() => {
    if (!searchQ.trim()) {
      setSearchResults([]);
      return;
    }

    const t = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const qs = new URLSearchParams();
        qs.set("q", searchQ.trim());
        if (setCode.trim()) qs.set("set", setCode.trim());

        const data = await apiGet(`/api/cards/search?${qs.toString()}`, token);
        setSearchResults(data.cards || []);
      } catch (err) {
        console.error(err);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(t);
  }, [searchQ, setCode, token]);

  async function loadSetCards(reset = false) {
    if (!setCode.trim()) return alert("Escolha uma coleção primeiro.");

    const nextPage = reset ? 1 : setPage + 1;

    setSetLoading(true);
    try {
      const data = await apiGet(
        `/api/cards/set/${encodeURIComponent(setCode.trim())}?page=${nextPage}&limit=36`,
        token
      );

      if (reset) {
        setSearchResults(data.cards || []);
        setSetPage(1);
      } else {
        setSearchResults((prev) => [...prev, ...(data.cards || [])]);
        setSetPage(nextPage);
      }

      setSetHasMore(!!data.hasMore);
      setSearchQ("");
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setSetLoading(false);
    }
  }

  async function setPreconFromChosenSet() {
    if (!setCode.trim()) return alert("Escolha uma coleção primeiro.");

    setPreconLoading(true);
    try {
      const data = await apiGet(`/api/cards/precon/${encodeURIComponent(setCode.trim())}`, token);

      if (data?.set?.name) setDeckName(data.set.name);

      setCommander(data.commander || null);

      const imported = (data.cards || []).map((c) => ({
        ...c,
        qty: 1,
      }));

      setCards(imported);

      setSearchResults([...(data.commander ? [data.commander] : []), ...imported]);
      setSearchQ("");
      setSetHasMore(false);
      setSetPage(1);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setPreconLoading(false);
    }
  }

  function getTypeBucket(typeLine = "") {
    const t = typeLine.toLowerCase();

    if (t.includes("land")) return "Land";
    if (t.includes("creature")) return "Creature";
    if (t.includes("instant")) return "Instant";
    if (t.includes("sorcery")) return "Sorcery";
    if (t.includes("artifact")) return "Artifact";
    if (t.includes("enchantment")) return "Enchantment";
    if (t.includes("planeswalker")) return "Planeswalker";
    if (t.includes("battle")) return "Battle";
    return "Other";
  }

  const typeCounts = useMemo(() => {
    const counts = {};
    for (const c of cards) {
      const bucket = getTypeBucket(c.type_line);
      counts[bucket] = (counts[bucket] || 0) + (c.qty || 1);
    }
    return counts;
  }, [cards]);

  const anyTypeChecked = useMemo(() => {
    return Object.values(typeFilters).some(Boolean);
  }, [typeFilters]);

  // cartas do deck filtradas por texto + tipos marcados
  const filteredDeckCards = useMemo(() => {
    const q = deckSearch.trim().toLowerCase();

    return cards.filter((c) => {
      const matchesText =
        !q ||
        String(c.name || "").toLowerCase().includes(q);

      const bucket = getTypeBucket(c.type_line);
      const matchesType = !anyTypeChecked || !!typeFilters[bucket];

      return matchesText && matchesType;
    });
  }, [cards, deckSearch, typeFilters, anyTypeChecked]);


  return (
    <div className="page-shell">
      <div className="lobby-shell">
        <div className="lobby-top-title">CRIAÇÃO DE DECKS</div>

        <div className="deck-shell panel">
          <div className="deck-top">
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button type="button" className="btn btn-ghost" onClick={() => nav("/lobby")}>
                ← Voltar pro Lobby
              </button>

              <div className="deck-title">
                CRIAÇÃO DE DECKS {view === "VISUAL" ? "VISUAL" : "LISTA"}
              </div>
            </div>

            <div className="deck-toggle">
              <button
                type="button"
                className={`btn btn-ghost ${view === "VISUAL" ? "is-active" : ""}`}
                onClick={() => setView("VISUAL")}
              >
                Visual
              </button>
              <button
                type="button"
                className={`btn btn-ghost ${view === "LISTA" ? "is-active" : ""}`}
                onClick={() => setView("LISTA")}
              >
                Lista
              </button>
            </div>
          </div>

          <div className="deck-grid">
            {/* LEFT */}
            <section className="deck-left">
              <div className="deck-name-row">
                <div className="small-muted">MEU DECK:</div>
                <input className="input" value={deckName} onChange={(e) => setDeckName(e.target.value)} />
                <div className="small-muted">{totalCards}/99</div>
              </div>

              <div className="deck-area">
                <div className="deck-commander">
                  <div>
                    <div className="deck-slot-title">COMANDANTE</div>

                    <div className="card-slot big">
                      {commander?.image ? (
                        <img src={commander.image} alt="commander" />
                      ) : (
                        <div className="slot-text">ESPAÇO RESERVADO<br />COMANDANTE</div>
                      )}
                    </div>
                  </div>

                  <div className="deck-slot-actions">
                    <CardAutocomplete
                      token={token}
                      placeholder="Definir comandante..."
                      onPick={(c) => setCommander(c)}
                    />

                    {/* 🔎 Pesquisa no deck */}
                    <div style={{ marginTop: 12 }}>
                      <div className="small-muted" style={{ marginBottom: 6 }}>Pesquisar no deck</div>
                      <input
                        className="input"
                        placeholder="ex: Sol Ring, Counterspell..."
                        value={deckSearch}
                        onChange={(e) => setDeckSearch(e.target.value)}
                      />
                    </div>

                    {/* ✅ Filtros por tipo (apenas os que existem) */}
                    <div style={{ marginTop: 12 }}>
                      <div className="small-muted" style={{ marginBottom: 6 }}>Filtrar por tipo</div>

                      <div className="type-filters">
                        {Object.entries(typeCounts).map(([type, count]) => (
                          <label key={type} className="type-filter-item">
                            <input
                              type="checkbox"
                              checked={!!typeFilters[type]}
                              onChange={(e) =>
                                setTypeFilters((prev) => ({ ...prev, [type]: e.target.checked }))
                              }
                            />
                            <span>{count} {type}{count > 1 ? "s" : ""}</span>
                          </label>
                        ))}
                      </div>

                      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => setTypeFilters({})}
                        >
                          Limpar filtros
                        </button>

                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => setDeckSearch("")}
                        >
                          Limpar busca
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

                {view === "VISUAL" ? (
                  <div className="deck-cards-visual">
                    {filteredDeckCards.length === 0 ? (
                      <div className="muted">Nenhuma carta com esse filtro.</div>
                    ) : (
                      <div className="deck-cards-row deck-cards-scroll">
                        {filteredDeckCards.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            className="card-slot"
                            onClick={() => removeCard(c.id)}
                            title="Remover 1"
                            onMouseEnter={(e) => handleCardEnter(c, e)}
                            onMouseMove={(e) => handleCardEnter(c, e)}
                            onMouseLeave={handleCardLeave}
                          >
                            {c.image ? <img src={c.image} alt={c.name} /> : <div className="slot-text">{c.name}</div>}
                            <div className="qty-badge">{c.qty}x</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="deck-cards-list">
                    <div className="list-box deck-cards-scroll">
                      <div style={{ marginBottom: 10 }}>
                        {commander ? <div>1 {commander.name}</div> : <div className="muted">1 Comandante</div>}
                      </div>

                      {filteredDeckCards.length === 0 ? (
                        <div className="muted">Nenhuma carta com esse filtro.</div>
                      ) : (
                        filteredDeckCards
                          .slice()
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((c) => (
                            <div key={c.id} className="list-row">
                              <span>{c.qty} {c.name}</span>
                              <button type="button" className="btn btn-ghost" onClick={() => removeCard(c.id)}>−</button>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                )}

              </div>
            </section>

            {/* RIGHT */}
            <aside className="deck-right">
              <div className="deck-filters">
                <div className="filter-row">
                  <div className="filter-label">Coleção</div>

                  <div style={{ width: "100%" }}>
                    <input
                      className="input"
                      list="sets-datalist"
                      placeholder="ex: mh3 ou Modern Horizons 3"
                      value={setCode}
                      onChange={(e) => setSetCode(e.target.value)}
                    />

                    <datalist id="sets-datalist">
                      {sets.map((s) => (
                        <option
                          key={s.code}
                          value={s.code}
                          label={`${s.name} (${String(s.code || "").toUpperCase()})`}
                        />
                      ))}
                    </datalist>

                    <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => loadSetCards(true)}
                        disabled={setLoading || !setCode.trim()}
                      >
                        {setLoading ? "Carregando..." : "Carregar coleção"}
                      </button>

                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setSearchResults([]);
                          setSetHasMore(false);
                          setSetPage(1);
                        }}
                      >
                        Limpar
                      </button>

                      {/* ✅ NOVO BOTÃO */}
                      <button
                        type="button"
                        className="btn"
                        onClick={setPreconFromChosenSet}
                        disabled={preconLoading || !setCode.trim()}
                        title="Importa como deck (1x cada carta)"
                      >
                        {preconLoading ? "Setando..." : "Set Precon"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="deck-results">
                <div className="deck-results-title">CARTAS</div>

                <input
                  className="input"
                  placeholder="Pesquisar carta..."
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                />

                <div className="deck-results-grid">
                  {searchLoading ? (
                    <div className="muted" style={{ marginTop: 10 }}>Carregando...</div>
                  ) : searchQ.trim() && searchResults.length === 0 ? (
                    <div className="muted" style={{ marginTop: 10 }}>Sem resultados</div>
                  ) : (
                    searchResults.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className="deck-result-card"
                        onClick={() => addCard(c, false)}
                        onMouseEnter={(e) => handleCardEnter(c, e)}
                        onMouseMove={(e) => handleCardEnter(c, e)}
                        onMouseLeave={handleCardLeave}
                        title="Clique para adicionar"
                      >
                        <div className="deck-result-img">
                          {c.image ? <img src={c.image} alt={c.name} /> : <div className="slot-text">{c.name}</div>}
                        </div>

                        <div className="deck-result-meta">
                          <div className="deck-result-name">{c.name}</div>
                          <div className="deck-result-sub">{c.type_line}</div>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {setHasMore && (
                  <div style={{ marginTop: 12 }}>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => loadSetCards(false)}
                      disabled={setLoading}
                    >
                      {setLoading ? "Carregando..." : "Mais"}
                    </button>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>

      {previewCard?.image && (
        <div className="card-preview" style={{ left: previewPos.x, top: previewPos.y }}>
          <img src={previewCard.image} alt={previewCard.name} />
        </div>
      )}
    </div>
  );
}

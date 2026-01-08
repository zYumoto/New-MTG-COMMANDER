let SETS_CACHE = null;
let SETS_CACHE_AT = 0;

export async function listSets(req, res) {
  try {
    const TTL_MS = 1000 * 60 * 60 * 6;
    const now = Date.now();

    if (SETS_CACHE && now - SETS_CACHE_AT < TTL_MS) {
      return res.json({ sets: SETS_CACHE });
    }

    const r = await fetch("https://api.scryfall.com/sets");
    if (!r.ok) {
      return res.status(502).json({ message: "Falha ao buscar coleções", detail: await r.text() });
    }

    const data = await r.json();

    const sets = (data?.data || [])
      .map((s) => ({
        code: s.code,
        name: s.name,
        released_at: s.released_at || "",
        set_type: s.set_type || "",
      }))
      .sort((a, b) => (a.released_at || "").localeCompare(b.released_at || ""));

    SETS_CACHE = sets;
    SETS_CACHE_AT = now;

    return res.json({ sets });
  } catch (err) {
    return res.status(500).json({ message: "Erro ao listar coleções", detail: err.message });
  }
}

export async function listCardsBySet(req, res) {
  try {
    const code = String(req.params.code || "").trim().toLowerCase();
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(60, Math.max(12, Number(req.query.limit || 36)));

    if (!code) return res.status(400).json({ message: "Set code obrigatório" });

    const url =
      `https://api.scryfall.com/cards/search?` +
      `q=${encodeURIComponent(`set:${code}`)}` +
      `&unique=cards&order=name&page=${page}`;

    const r = await fetch(url);
    if (!r.ok) {
      return res.status(502).json({ message: "Falha ao listar cartas da coleção", detail: await r.text() });
    }

    const data = await r.json();

    const cards = (data?.data || []).slice(0, limit).map((c) => {
      const image =
        c?.image_uris?.normal ||
        c?.card_faces?.[0]?.image_uris?.normal ||
        "";

      return {
        id: c.id,
        name: c.name,
        type_line: c.type_line,
        mana_cost: c.mana_cost || "",
        set: c.set || "",
        image,
      };
    });

    return res.json({
      cards,
      page,
      hasMore: !!data?.has_more,
    });
  } catch (err) {
    return res.status(500).json({ message: "Erro ao listar cartas", detail: err.message });
  }
}

export async function searchCards(req, res) {
  try {
    const q = String(req.query.q || "").trim();
    const set = String(req.query.set || "").trim().toLowerCase();

    if (!q) return res.json({ cards: [] });

    if (set) {
      const url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(
        `set:${set} ${q}`
      )}&unique=cards&order=name`;

      const r = await fetch(url);

      if (!r.ok) {
        return res.status(502).json({ message: "Falha ao buscar cartas", detail: await r.text() });
      }

      const data = await r.json();

      const cards = (data?.data || []).slice(0, 18).map((c) => {
        const image =
          c?.image_uris?.normal ||
          c?.card_faces?.[0]?.image_uris?.normal ||
          "";

        return {
          id: c.id,
          name: c.name,
          type_line: c.type_line,
          mana_cost: c.mana_cost || "",
          set: c.set || "",
          image,
        };
      });

      return res.json({ cards });
    }

    const url = `https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(q)}`;
    const r = await fetch(url);

    if (!r.ok) {
      return res.status(502).json({ message: "Falha ao buscar cartas", detail: await r.text() });
    }

    const data = await r.json();
    const names = Array.isArray(data?.data) ? data.data.slice(0, 12) : [];

    const details = await Promise.all(
      names.map(async (name) => {
        const rr = await fetch(
          `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}`
        );
        if (!rr.ok) return null;

        const c = await rr.json();

        const image =
          c?.image_uris?.normal ||
          c?.card_faces?.[0]?.image_uris?.normal ||
          "";

        return {
          id: c.id,
          name: c.name,
          type_line: c.type_line,
          mana_cost: c.mana_cost || "",
          set: c.set || "",
          image,
        };
      })
    );

    return res.json({ cards: details.filter(Boolean) });
  } catch (err) {
    return res.status(500).json({ message: "Erro na busca", detail: err.message });
  }
}

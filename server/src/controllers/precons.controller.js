// server/src/controllers/precons.controller.js
const MTGJSON_BASE = "https://mtgjson.com/api/v5";
const DECKLIST_URL = `${MTGJSON_BASE}/DeckList.json`;
const MTGJSON_DECKS_BASE = `${MTGJSON_BASE}/decks`;

let CACHE_LIST = null;
let CACHE_AT = 0;

function ttlOk(ms) {
  return Date.now() - CACHE_AT < ms;
}

function normalizeDeckType(t) {
  return String(t || "").toLowerCase();
}

async function getDeckListCached() {
  const TTL = 1000 * 60 * 60 * 12;
  if (CACHE_LIST && ttlOk(TTL)) return CACHE_LIST;

  const r = await fetch(DECKLIST_URL);
  if (!r.ok) throw new Error(await r.text());
  const json = await r.json();

  const data = Array.isArray(json?.data) ? json.data : [];
  CACHE_LIST = data;
  CACHE_AT = Date.now();
  return data;
}

async function scryfallCollectionByIds(ids) {
  const chunks = [];
  const size = 75;

  for (let i = 0; i < ids.length; i += size) {
    chunks.push(ids.slice(i, i + size));
  }

  const out = [];
  for (const chunk of chunks) {
    const body = {
      identifiers: chunk.map((id) => ({ id })),
    };

    const r = await fetch("https://api.scryfall.com/cards/collection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!r.ok) throw new Error(await r.text());
    const json = await r.json();

    const data = Array.isArray(json?.data) ? json.data : [];
    out.push(...data);
  }

  return out;
}

function pickImage(c) {
  return (
    c?.image_uris?.normal ||
    c?.card_faces?.[0]?.image_uris?.normal ||
    ""
  );
}

export async function listPrecons(req, res) {
  try {
    const list = await getDeckListCached();

    const onlyCommander = list.filter((d) => {
      const t = normalizeDeckType(d.type);
      return t.includes("commander");
    });

    return res.json({
      precons: onlyCommander
        .map((d) => ({
          code: d.code,
          name: d.name,
          releaseDate: d.releaseDate || null,
          type: d.type,
        }))
        .sort((a, b) => String(b.releaseDate || "").localeCompare(String(a.releaseDate || ""))),
    });
  } catch (err) {
    return res.status(500).json({ message: "Erro ao listar precons", detail: err.message });
  }
}

export async function getPreconByCode(req, res) {
  try {
    const code = String(req.params.code || "").trim();
    if (!code) return res.status(400).json({ message: "code obrigatório" });

    const list = await getDeckListCached();
    const meta = list.find((d) => String(d.code).toLowerCase() === code.toLowerCase());

    if (!meta?.fileName) {
      return res.status(404).json({ message: "Precon não encontrado" });
    }

    const deckUrl = `${MTGJSON_DECKS_BASE}/${encodeURIComponent(meta.fileName)}`;
    const r = await fetch(deckUrl);
    if (!r.ok) return res.status(502).json({ message: "Falha ao buscar deck MTGJSON", detail: await r.text() });

    const json = await r.json();
    const deck = json?.data;

    const commander = Array.isArray(deck?.commander) ? deck.commander[0] : null;
    const main = Array.isArray(deck?.mainBoard) ? deck.mainBoard : [];

    const mainCount = main.reduce((s, c) => s + (Number(c.count) || 0), 0);
    if (mainCount !== 99) {
      return res.status(422).json({
        message: "Deck não parece Commander 100 (99 + commander).",
        detail: { mainCount },
      });
    }

    const scryIds = [];
    const addIf = (c) => {
      const id = c?.identifiers?.scryfallId;
      if (id) scryIds.push(id);
    };

    if (commander) addIf(commander);
    main.forEach(addIf);

    const scryData = await scryfallCollectionByIds([...new Set(scryIds)]);
    const byId = new Map(scryData.map((c) => [c.id, c]));

    const commanderOut = commander
      ? (() => {
          const sc = byId.get(commander?.identifiers?.scryfallId);
          return {
            cardId: sc?.id || commander?.identifiers?.scryfallId || "",
            name: sc?.name || commander?.name || "",
            set: sc?.set || commander?.setCode || "",
            image: pickImage(sc),
            type_line: sc?.type_line || commander?.type || "",
            mana_cost: sc?.mana_cost || commander?.manaCost || "",
            qty: 1,
          };
        })()
      : null;

    const cardsOut = main.map((c) => {
      const sc = byId.get(c?.identifiers?.scryfallId);
      return {
        cardId: sc?.id || c?.identifiers?.scryfallId || "",
        name: sc?.name || c?.name || "",
        set: sc?.set || c?.setCode || "",
        image: pickImage(sc),
        type_line: sc?.type_line || c?.type || "",
        mana_cost: sc?.mana_cost || c?.manaCost || "",
        qty: Number(c.count) || 1,
      };
    });

    return res.json({
      meta: { code: meta.code, name: meta.name, releaseDate: meta.releaseDate || null, type: meta.type },
      commander: commanderOut,
      cards: cardsOut,
    });
  } catch (err) {
    return res.status(500).json({ message: "Erro ao carregar precon", detail: err.message });
  }
}

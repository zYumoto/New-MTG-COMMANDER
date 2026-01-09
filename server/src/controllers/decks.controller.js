import Deck from "../models/deck.model.js";

function totalQty(cards = []) {
  return cards.reduce((s, c) => s + (Number(c.qty) || 0), 0);
}

export async function createDeck(req, res) {
  try {
    const userId = req.user.id;

    const name = String(req.body?.name || "").trim() || "Meu Deck";
    const commander = req.body?.commander;
    const cards = Array.isArray(req.body?.cards) ? req.body.cards : [];
    const isPublic = !!req.body?.isPublic;

    if (!commander?.cardId || !commander?.name) {
      return res.status(400).json({ message: "Defina um comandante antes de salvar." });
    }

    const qty = totalQty(cards);
    if (qty !== 99) {
      return res.status(400).json({ message: "O deck precisa ter 99 cartas além do comandante." });
    }

    const deck = await Deck.create({
      ownerId: userId,
      name,
      commander: {
        cardId: commander.cardId,
        name: commander.name,
        set: commander.set || "",
        image: commander.image || "",
        type_line: commander.type_line || "",
        mana_cost: commander.mana_cost || "",
      },
      cards: cards.map((c) => ({
        cardId: c.cardId,
        name: c.name,
        qty: Number(c.qty) || 1,
        set: c.set || "",
        image: c.image || "",
        type_line: c.type_line || "",
        mana_cost: c.mana_cost || "",
      })),
      isPublic,
    });

    return res.json({ deck });
  } catch (err) {
    return res.status(500).json({ message: "Erro ao salvar deck", detail: err.message });
  }
}

export async function listMyDecks(req, res) {
  try {
    const userId = req.user.id;

    const decks = await Deck.find({ ownerId: userId })
      .sort({ createdAt: -1 })
      .select("name commander isPublic createdAt updatedAt");

    return res.json({ decks });
  } catch (err) {
    return res.status(500).json({ message: "Erro ao listar decks", detail: err.message });
  }
}

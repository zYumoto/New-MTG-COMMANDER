import mongoose from "mongoose";

const DeckCardSchema = new mongoose.Schema(
  {
    cardId: { type: String, required: true },
    name: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    set: { type: String, default: "" },
    image: { type: String, default: "" },
    type_line: { type: String, default: "" },
    mana_cost: { type: String, default: "" },
  },
  { _id: false }
);

const DeckSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    commander: {
      cardId: { type: String, required: true },
      name: { type: String, required: true },
      set: { type: String, default: "" },
      image: { type: String, default: "" },
      type_line: { type: String, default: "" },
      mana_cost: { type: String, default: "" },
    },
    cards: { type: [DeckCardSchema], default: [] },
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Deck", DeckSchema);

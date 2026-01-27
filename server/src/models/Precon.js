import mongoose from "mongoose";

const PreconCardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    qty: { type: Number, required: true, min: 1 },
    scryfallId: { type: String, default: "" },
  },
  { _id: false }
);

const PreconSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    setCode: { type: String, default: "", lowercase: true, trim: true },
    releaseDate: { type: Date },

    commanderName: { type: String, required: true, trim: true },
    commanderScryfallId: { type: String, default: "" },

    colors: { type: [String], default: [] },

    cards: { type: [PreconCardSchema], required: true },
    totalCards: { type: Number, default: 100 },
  },
  { timestamps: true }
);

export default mongoose.model("Precon", PreconSchema);

import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 32 },

    // dono da sala
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ownerUsername: { type: String, required: true },

    // sala privada
    isPrivate: { type: Boolean, default: false },
    passwordHash: { type: String, default: "" },

    // jogadores (por enquanto só lista de ids)
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // status
    status: { type: String, enum: ["OPEN", "IN_GAME", "CLOSED"], default: "OPEN" },

    // limite (Commander = 4)
    maxPlayers: { type: Number, default: 4 }
  },
  { timestamps: true }
);

export default mongoose.model("Room", RoomSchema);

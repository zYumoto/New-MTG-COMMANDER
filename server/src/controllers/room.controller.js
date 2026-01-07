import bcrypt from "bcryptjs";
import Room from "../models/Room.js";

export async function createRoom(req, res) {
  try {
    const { name, isPrivate, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Nome da sala é obrigatório" });
    }

    const roomName = name.trim().slice(0, 32);

    let passwordHash = "";
    const privateFlag = !!isPrivate;

    if (privateFlag) {
      if (!password || !password.trim()) {
        return res.status(400).json({ message: "Senha é obrigatória para sala privada" });
      }
      passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    const room = await Room.create({
      name: roomName,
      ownerId: req.user.id,
      ownerUsername: req.user.username,
      isPrivate: privateFlag,
      passwordHash,
      players: [req.user.id], // dono já entra
      status: "OPEN",
      maxPlayers: 4
    });

    return res.status(201).json({
      room: {
        id: room._id,
        name: room.name,
        ownerUsername: room.ownerUsername,
        isPrivate: room.isPrivate,
        playersCount: room.players.length,
        maxPlayers: room.maxPlayers,
        status: room.status,
        createdAt: room.createdAt
      }
    });
  } catch (err) {
    return res.status(500).json({ message: "Erro ao criar sala", detail: err.message });
  }
}

export async function listRooms(req, res) {
  try {
    const rooms = await Room.find({ status: { $ne: "CLOSED" } })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json({
      rooms: rooms.map((r) => ({
        id: r._id,
        name: r.name,
        ownerUsername: r.ownerUsername,
        isPrivate: r.isPrivate,
        playersCount: r.players.length,
        maxPlayers: r.maxPlayers,
        status: r.status,
        createdAt: r.createdAt
      }))
    });
  } catch (err) {
    return res.status(500).json({ message: "Erro ao listar salas", detail: err.message });
  }
}

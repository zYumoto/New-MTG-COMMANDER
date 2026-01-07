import mongoose from "mongoose";
import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

const ONLINE_SECONDS = 60;

function toObjId(id) {
  return new mongoose.Types.ObjectId(id);
}

export async function ping(req, res) {
  try {
    await User.updateOne({ _id: req.user.id }, { $set: { lastSeen: new Date() } });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ message: "Erro no ping", detail: err.message });
  }
}

export async function listFriends(req, res) {
  try {
    const me = await User.findById(req.user.id).select("friends blocked");
    if (!me) return res.status(404).json({ message: "Usuário não encontrado" });

    const friends = await User.find({ _id: { $in: me.friends } }).select(
      "username email avatarUrl avatarData lastSeen"
    );

const now = Date.now();
const list = friends
  .filter((f) => !me.blocked.some((b) => String(b) === String(f._id)))
  .map((f) => {
    const last = f.lastSeen ? new Date(f.lastSeen).getTime() : 0;
    const diff = now - last;

    let status = "OFFLINE";
    if (diff <= 60 * 1000) status = "ONLINE";          // <= 60s
    else if (diff <= 15 * 60 * 1000) status = "AWAY";  // <= 15min

    return {
      id: f._id,
      username: f.username,
      email: f.email,
      avatarUrl: f.avatarUrl || "",
      avatarData: f.avatarData || "",
      lastSeen: f.lastSeen,
      status
    };
  });


    return res.json({ friends: list });
  } catch (err) {
    return res.status(500).json({ message: "Erro ao listar amigos", detail: err.message });
  }
}

export async function listRequests(req, res) {
  try {
    const incoming = await FriendRequest.find({
      toUser: req.user.id,
      status: "PENDING"
    })
      .sort({ createdAt: -1 })
      .populate("fromUser", "username email avatarUrl avatarData");

    const outgoing = await FriendRequest.find({
      fromUser: req.user.id,
      status: "PENDING"
    })
      .sort({ createdAt: -1 })
      .populate("toUser", "username email avatarUrl avatarData");

    return res.json({
      incoming: incoming.map((r) => ({
        id: r._id,
        from: {
          id: r.fromUser._id,
          username: r.fromUser.username,
          email: r.fromUser.email,
          avatarUrl: r.fromUser.avatarUrl || "",
          avatarData: r.fromUser.avatarData || ""
        },
        createdAt: r.createdAt
      })),
      outgoing: outgoing.map((r) => ({
        id: r._id,
        to: {
          id: r.toUser._id,
          username: r.toUser.username,
          email: r.toUser.email,
          avatarUrl: r.toUser.avatarUrl || "",
          avatarData: r.toUser.avatarData || ""
        },
        createdAt: r.createdAt
      }))
    });
  } catch (err) {
    return res.status(500).json({ message: "Erro ao listar requests", detail: err.message });
  }
}

export async function sendRequest(req, res) {
  try {
    const { usernameOrEmail } = req.body;

    if (!usernameOrEmail || !String(usernameOrEmail).trim()) {
      return res.status(400).json({ message: "usernameOrEmail é obrigatório" });
    }

    const target = await User.findOne({
      $or: [
        { username: String(usernameOrEmail).trim() },
        { email: String(usernameOrEmail).trim().toLowerCase() }
      ]
    }).select("_id username");

    if (!target) return res.status(404).json({ message: "Usuário não encontrado" });
    if (String(target._id) === String(req.user.id)) {
      return res.status(400).json({ message: "Você não pode adicionar você mesmo" });
    }

    const me = await User.findById(req.user.id).select("friends blocked");
    if (!me) return res.status(404).json({ message: "Usuário não encontrado" });

    if (me.blocked.some((b) => String(b) === String(target._id))) {
      return res.status(400).json({ message: "Você bloqueou esse usuário" });
    }

    if (me.friends.some((f) => String(f) === String(target._id))) {
      return res.status(400).json({ message: "Esse usuário já é seu amigo" });
    }

    const targetUser = await User.findById(target._id).select("blocked");
    if (targetUser?.blocked?.some((b) => String(b) === String(req.user.id))) {
      return res.status(400).json({ message: "Não foi possível enviar request" });
    }

    const existing = await FriendRequest.findOne({
      $or: [
        { fromUser: req.user.id, toUser: target._id, status: "PENDING" },
        { fromUser: target._id, toUser: req.user.id, status: "PENDING" }
      ]
    });

    if (existing) return res.status(400).json({ message: "Já existe um request pendente" });

    const created = await FriendRequest.create({
      fromUser: req.user.id,
      toUser: target._id,
      status: "PENDING"
    });

    return res.status(201).json({ ok: true, requestId: created._id });
  } catch (err) {
    if (String(err?.code) === "11000") {
      return res.status(400).json({ message: "Já existe um request entre vocês" });
    }
    return res.status(500).json({ message: "Erro ao enviar request", detail: err.message });
  }
}

export async function respondRequest(req, res) {
  try {
    const { id } = req.params;
    const { action } = req.body;

    if (!["ACCEPT", "DENY", "BLOCK"].includes(String(action))) {
      return res.status(400).json({ message: "action deve ser ACCEPT, DENY ou BLOCK" });
    }

    const request = await FriendRequest.findById(id);
    if (!request) return res.status(404).json({ message: "Request não encontrado" });

    if (String(request.toUser) !== String(req.user.id)) {
      return res.status(403).json({ message: "Você não pode responder esse request" });
    }

    const fromId = String(request.fromUser);

    if (action === "DENY") {
      request.status = "DENIED";
      await request.save();
      return res.json({ ok: true });
    }

    if (action === "BLOCK") {
      await User.updateOne({ _id: req.user.id }, { $addToSet: { blocked: toObjId(fromId) } });
      await User.updateOne({ _id: req.user.id }, { $pull: { friends: toObjId(fromId) } });
      await User.updateOne({ _id: fromId }, { $pull: { friends: toObjId(req.user.id) } });

      await FriendRequest.deleteMany({
        $or: [
          { fromUser: req.user.id, toUser: fromId },
          { fromUser: fromId, toUser: req.user.id }
        ]
      });

      return res.json({ ok: true });
    }

    // ACCEPT
    request.status = "ACCEPTED";
    await request.save();

    await User.updateOne({ _id: req.user.id }, { $addToSet: { friends: toObjId(fromId) } });
    await User.updateOne({ _id: fromId }, { $addToSet: { friends: toObjId(req.user.id) } });

    await FriendRequest.deleteMany({
      $or: [
        { fromUser: req.user.id, toUser: fromId },
        { fromUser: fromId, toUser: req.user.id }
      ]
    });

    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ message: "Erro ao responder request", detail: err.message });
  }
}

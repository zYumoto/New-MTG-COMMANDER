import User from "../models/User.js";

function safeUser(u) {
  return {
    id: u._id,
    username: u.username,
    email: u.email,
    bio: u.bio || "",
    avatarUrl: u.avatarUrl || "",
    avatarData: u.avatarData || "",
    profileBgUrl: u.profileBgUrl || ""
  };
}

export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Usuário não encontrado" });
    return res.json({ user: safeUser(user) });
  } catch (err) {
    return res.status(500).json({ message: "Erro ao buscar perfil", detail: err.message });
  }
}

export async function updateMe(req, res) {
  try {
    const { bio, avatarUrl, avatarData, profileBgUrl } = req.body;

    // validação simples do avatarData (evitar payload gigante)
    if (avatarData && typeof avatarData === "string" && avatarData.length > 450_000) {
      return res.status(413).json({ message: "Imagem muito grande. Use uma menor." });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

    if (typeof bio === "string") user.bio = bio.slice(0, 160);
    if (typeof avatarUrl === "string") user.avatarUrl = avatarUrl.slice(0, 500);
    if (typeof avatarData === "string") user.avatarData = avatarData; // dataURL
    if (typeof profileBgUrl === "string") user.profileBgUrl = profileBgUrl.slice(0, 500);

    await user.save();

    return res.json({ user: safeUser(user) });
  } catch (err) {
    return res.status(500).json({ message: "Erro ao atualizar perfil", detail: err.message });
  }
}

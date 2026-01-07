import bcrypt from "bcryptjs";
import User from "../models/User.js";

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "currentPassword e newPassword são obrigatórios" });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: "A nova senha deve ter no mínimo 6 caracteres" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Senha atual inválida" });

    const hash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = hash;
    await user.save();

    return res.json({ ok: true, message: "Senha alterada com sucesso" });
  } catch (err) {
    return res.status(500).json({ message: "Erro ao trocar senha", detail: err.message });
  }
}

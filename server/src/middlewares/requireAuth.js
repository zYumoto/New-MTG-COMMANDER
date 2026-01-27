// server/src/middlewares/requireAuth.js
import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const [, token] = auth.split(" ");

    if (!token) {
      return res.status(401).json({ message: "Token ausente." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id || decoded._id || decoded.userId,
      email: decoded.email,
    };

    return next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido." });
  }
}

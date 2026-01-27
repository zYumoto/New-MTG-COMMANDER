// server/src/app.js
// ===========================================
// APP principal: registra middlewares e rotas
// ===========================================

import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import roomRoutes from "./routes/room.routes.js";
import userRoutes from "./routes/user.routes.js";
import friendsRoutes from "./routes/friends.routes.js";
import cardsRoutes from "./routes/cards.routes.js"; // ✅ ADD AQUI
import preconRoutes from "./routes/precons.routes.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true, service: "mtg-commander-api" }));

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/users", userRoutes);
app.use("/api/friends", friendsRoutes);
app.use("/api/cards", cardsRoutes); // ✅ ADD AQUI
app.use("/api/precons", preconRoutes);

export default app;

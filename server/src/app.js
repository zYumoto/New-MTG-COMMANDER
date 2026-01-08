import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import roomRoutes from "./routes/room.routes.js";
import userRoutes from "./routes/user.routes.js";
import friendsRoutes from "./routes/friends.routes.js";
import cardsRoutes from "./routes/cards.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "2mb" }));
app.use("/api/cards", cardsRoutes);

app.get("/health", (req, res) => res.json({ ok: true, service: "mtg-commander-api" }));
app.get("/api/friends/_ping", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/users", userRoutes);
app.use("/api/friends", friendsRoutes);

export default app;

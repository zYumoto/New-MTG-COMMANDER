import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true, service: "mtg-commander-api" }));

app.use("/api/auth", authRoutes);

export default app;

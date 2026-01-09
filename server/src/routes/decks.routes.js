import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { createDeck, listMyDecks } from "../controllers/decks.controller.js";

const router = Router();

router.get("/me", requireAuth, listMyDecks);
router.post("/", requireAuth, createDeck);

export default router;

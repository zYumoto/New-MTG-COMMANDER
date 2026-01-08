import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { searchCards, listSets, listCardsBySet } from "../controllers/cards.controller.js";

const router = Router();

router.get("/sets", requireAuth, listSets);
router.get("/set/:code", requireAuth, listCardsBySet);
router.get("/search", requireAuth, searchCards);

export default router;

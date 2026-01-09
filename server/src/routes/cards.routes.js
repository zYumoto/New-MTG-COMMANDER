import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  searchCards,
  listSets,
  listCardsBySet,
  getPreconFromSet,
} from "../controllers/cards.controller.js";

const router = Router();

router.get("/sets", requireAuth, listSets);
router.get("/set/:code", requireAuth, listCardsBySet);
router.get("/search", requireAuth, searchCards);

router.get("/precon/:code", requireAuth, getPreconFromSet);

export default router;

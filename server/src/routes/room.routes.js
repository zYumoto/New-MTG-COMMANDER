import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { createRoom, listRooms } from "../controllers/room.controller.js";

const router = Router();

router.get("/", requireAuth, listRooms);
router.post("/", requireAuth, createRoom);

export default router;

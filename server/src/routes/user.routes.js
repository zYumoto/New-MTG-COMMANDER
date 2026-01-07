import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { getMe, updateMe } from "../controllers/user.controller.js";

const router = Router();

router.get("/me", requireAuth, getMe);
router.put("/me", requireAuth, updateMe);

export default router;
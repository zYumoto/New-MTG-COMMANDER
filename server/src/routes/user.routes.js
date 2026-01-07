import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { getMe, updateMe } from "../controllers/user.controller.js";
import { changePassword } from "../controllers/password.controller.js";

const router = Router();

router.get("/me", requireAuth, getMe);
router.put("/me", requireAuth, updateMe);
router.put("/password", requireAuth, changePassword);

export default router;

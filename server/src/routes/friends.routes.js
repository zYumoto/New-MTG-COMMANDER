import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  listFriends,
  listRequests,
  ping,
  respondRequest,
  sendRequest
} from "../controllers/friends.controller.js";

const router = Router();

router.post("/ping", requireAuth, ping);
router.get("/", requireAuth, listFriends);
router.get("/requests", requireAuth, listRequests);
router.post("/requests", requireAuth, sendRequest);
router.post("/requests/:id/respond", requireAuth, respondRequest);

export default router;

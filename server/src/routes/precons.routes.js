import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { listPrecons, getPreconByCode } from "../controllers/precons.controller.js";

const r = Router();

r.get("/", requireAuth, listPrecons);
r.get("/:code", requireAuth, getPreconByCode);

export default r;

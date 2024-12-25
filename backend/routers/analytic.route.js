import express from "express";
import { adminRoute, protecRoute } from "../middleware/auth_middleware.js";
import { analyticstRoutes } from "../controllers/analytic.controller.js";

const router = express.Router();

router.get(`/`, protecRoute, adminRoute, analyticstRoutes)

export default router
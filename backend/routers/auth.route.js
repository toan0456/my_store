import express from "express";
import { login, logout,getprofile, refresh_Token, signin } from "../controllers/auth.controller.js";
import { protecRoute } from "../middleware/auth_middleware.js";

const router = express.Router()

router.post(`/signin`, signin)

router.post(`/login`, login)

router.post(`/logout`, logout)
router.post(`/refresh-token`, refresh_Token)
router.get(`/profile`, protecRoute, getprofile)

export default router
import express from "express";
import { login, logout,getprofile, refresh_Token, signin } from "../controllers/auth.controller.js";

const router = express.Router()

router.post(`/signin`, signin)

router.post(`/login`, login)

router.post(`/logout`, logout)
router.post(`/refresh-token`, refresh_Token)
router.get(`/profile`, getprofile)

export default router
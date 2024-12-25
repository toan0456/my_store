import express from "express";
import { protecRoute } from "../middleware/auth_middleware.js";
import { getCoupon, validateCoupon } from "../controllers/coupon.controler.js";

const router = express.Router()

router.get(`/`, protecRoute, getCoupon)
router.get(`/validate`, protecRoute, validateCoupon)

export default router
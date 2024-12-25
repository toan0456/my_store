import express from "express";
import { protecRoute } from "../middleware/auth_middleware.js";
import { checkoutSuccess, createCheckoutSession } from "../controllers/payment.controller.js";

const router = express.Router()

router.post(`/create-checkout-session`, protecRoute, createCheckoutSession)
router.post(`/checkout-success`, protecRoute, checkoutSuccess)

export default router
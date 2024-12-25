import express from "express";
import { addToCart, getCartProducts, removeAllFromCart, updateQuantity } from "../controllers/cart.controller.js";
import { protecRoute } from "../middleware/auth_middleware.js";

const router = express.Router()

router.get(`/`, protecRoute, getCartProducts)
router.post(`/`, protecRoute, addToCart)
router.delete(`/`, protecRoute, removeAllFromCart)
router.put(`/:id`, protecRoute, updateQuantity)

export default router
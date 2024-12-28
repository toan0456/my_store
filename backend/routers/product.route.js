import express from "express";
import { createProducts, deleteProducts, getAllProducts, getFeaturedProducts, getProductsByCategory, getRecomentProducts, toggleFeatureProduct } from "../controllers/product.controller.js";
import { adminRoute, protecRoute } from "../middleware/auth_middleware.js";

const router = express.Router()

router.get(`/`, protecRoute, adminRoute, getAllProducts)
router.get(`/featured`, getFeaturedProducts)
router.get(`/category/:category`, getProductsByCategory)
router.get(`/recomendation`, getRecomentProducts)
router.post(`/`, protecRoute, adminRoute, createProducts)
router.patch(`/toggle-featured-product/:id`, protecRoute, adminRoute, toggleFeatureProduct)
router.delete(`/delete-products/:id`, protecRoute, adminRoute, deleteProducts)

export default router
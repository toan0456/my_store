import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routers/auth.route.js";
import productRoutes from "./routers/product.route.js";
import cartRoutes from "./routers/cart.route.js";
import couponRoutes from "./routers/coupon.route.js";
import paymentRoutes from "./routers/payment.route.js";
import analyticstRoutes from "./routers/analytic.route.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

// console.log(process.env.PORT)
const PORT = process.env.PORT || 3080;

app.use(express.json());
app.use(cookieParser());
app.use(`/api/auth`, authRoutes);
app.use(`/api/product`, productRoutes);
app.use(`/api/cart`, cartRoutes);
app.use(`/api/coupons`, couponRoutes);
app.use(`/api/payment`, paymentRoutes);
app.use(`/api/analytics`, analyticstRoutes);

app.listen(PORT, () => {
  console.log("server running on port: http://localhost:" + PORT);
  connectDB();
});

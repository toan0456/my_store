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
import cors from 'cors'

dotenv.config();
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

const app = express();
app.use(cors(corsOptions));

// console.log(process.env.PORT)
const PORT = process.env.PORT || 3000;

app.use(express.json({limit: "10mb"}));
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

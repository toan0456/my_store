import express from "express"
import dotenv from "dotenv"
import authRoutes from "./routers/auth.route.js"
import { connectDB } from "./lib/db.js";

dotenv.config()

const app = express();

// console.log(process.env.PORT)
const PORT = process.env.PORT || 3080;

app.use(express.json())
app.use(`/api/auth`, authRoutes)

app.listen(PORT, ()=> {
    console.log("server running on port: http://localhost:"+ PORT)
    connectDB()
})
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";

export const protecRoute = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        if (!accessToken) {
            return res.status(401).json({ message: "Unauthorized - Access token not found" });
        }
        try {
            const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            const user = await userModel.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user;
        next();
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Access token expired" });
            }
            throw error;
        }
    } catch (error) {
        console.log("Error in auth middleware", error.message);
        res.status(401).json({ message: "Error in auth middleware", error: error.message });
    }
}

export const adminRoute = async (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next()
    }else{
        return res.status(403).json({ message: "Access denied - Admin only" });
    }
}
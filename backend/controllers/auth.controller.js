import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { redis } from "../lib/redis.js";
import userValidate from "../schemas/user.schema.js";

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(
    `refresh_token:${userId}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60
  ); // 7 ngay
};

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true, // prevent XSS attack, cross site scripting attack
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // prevent CSRF attack, cross site request forgery attack
    maxAge: 15 * 60 * 1000, // 15 phut
  }),
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // prevent XSS attack, cross site scripting attack
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", // prevent CSRF attack, cross site request forgery attack
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngay
    });
};

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const checkEmail = await userModel.findOne({ email: email });
    if (checkEmail) {
      return res.status(400).json({ message: "Email da ton tai" });
    }

    const { error } = userValidate.validate(req.body, { abortEarly: false });
    if (error) {
      const errMess = error.details.map((mess) => mess.message);
      return res.status(400).json(errMess);
    }
    const passMK = await bcrypt.hash(password, 10);

    const user = await userModel.create({ name, email, password: passMK });
    user.password = undefined;

    // authentication
    const { accessToken, refreshToken } = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);

    setCookies(res, accessToken, refreshToken);

    res.status(201).json({
        message: "Dang ky thanh cong",
        data: { id:user._id, name: user.name, email: user.email, role: user.role },
      });
  } catch (error) {
    console.log("signup controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
    const user = await userModel.findOne({ email: email})
    if (!user) {
        return res.status(400).json({ message: "Email khong ton tai" });
    }
    const checkPass = await bcrypt.compare( password, user.password )
    if (!checkPass) {
        return res.status(400).json({ message: "Mat khau khong dung" });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);

    setCookies(res, accessToken, refreshToken);

    res.status(200).json({
        message: "Dang nhap thanh cong",
         id:user._id, name: user.name, email: user.email, role: user.role ,
      });
    } catch (error) {
        console.log("Lỗi login controller", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const logout = async (req, res) => {
  try {
    const refresh_token = req.cookies.refreshToken;
    if (refresh_token) {
        const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);
        await redis.del(`refresh_token:${decoded.userId}`);
    }
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logout thanh cong" });
  } catch (error) {
    console.log("Logout controller", error.message);
    res.status(500).json({ message:"Lỗi server", error: error.message });
  }
};

export const refresh_Token = async (req, res) => {
    try {
        const refresh_token = req.cookies.refreshToken;
        if (!refresh_token) {
            return res.status(401).json({ message: "Refresh token khong ton tai" });
        }

        const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);
        const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

        if (storedToken !== refresh_token) {
            return res.status(401).json({ message: "Refresh token khong hop le" });
        }

        const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

        res.cookie("accessToken", accessToken, {
            httpOnly: true, // prevent XSS attack, cross site scripting attack
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict", // prevent CSRF attack, cross site request forgery attack
            maxAge: 15 * 60 * 1000, // 15 phut
        });
        res.status(200).json({ message: "Refresh token thanh cong" });
    } catch (error) {
        console.log("Refresh token controller", error.message);
        res.status(500).json({ message:"Lỗi server", error: error.message });
    }
}
//TODO get profile
export const getprofile = async (req, res) => {
  try {
    res.status(200).json(req.user)
  } catch (error) {
    res.status(500).json({ message:"Lỗi server", error: error.message });
  }
}
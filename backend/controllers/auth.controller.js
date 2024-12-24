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

export const signin = async (req, res) => {
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
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  res.send("login router called");
};

export const logout = async (req, res) => {
  res.send("logout router called");
};

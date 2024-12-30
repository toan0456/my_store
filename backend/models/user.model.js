import e from "express";
import bcrypt from "bcryptjs";

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    cartItems: [
      {
        quantity: {
          type: Number,
          default: 1,
        },
        products: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Products",
        },
      },
    ],
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    // createAt and updateAt
  },
  {
    timestamps: true,
  }
);

// Pre hook to hash password before saving to database
// userSchema.pre("save", async function (next) {
//     if (!this.isModified("password")) {
//         return next()
//     }
//     try {
//         const salt = await bcrypt.genSalt(10)
//         this.password = await bcrypt.hash(this.password, salt)
//         next()
//     } catch (error) {
//         next(error)
//     }
// })

// userSchema.methods.comparePassword = async function (password) {
//     try {
//         const isMatch = await bcrypt.compare(password, this.password)
//         return isMatch
//     } catch (error) {
//         throw error
//     }
// }

export default mongoose.model("Users", userSchema);

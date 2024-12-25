import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    products: [
        {
            product:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Products",
                required: true
            },
            quatity: {
                type: Number,
                required: true,
                min: 1
            },
            price: {
                type: Number,
                required: true,
                min: 0
            }
        }
    ],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    stripeSessionId: {
        type: String,
        unique: true
    }
},{
    timestamps: true
})

export default mongoose.model("Orders", orderSchema)
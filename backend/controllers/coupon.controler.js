import couponModel from "../models/coupon.model.js"

export const getCoupon = async (req, res) => {
    try {
        const coupon = await couponModel.findOne({userId: req.user._id, isActive: true})
        res.status(200).json(coupon || null)
    } catch (error) {
        console.log("Lỗi server get coupon", error.message);
        res.status(500).json({ message:"Lỗi server", error: error.message});
    }
}

export const validateCoupon = async (req, res) => {
    try {
        const {code}= req.body
        const coupon = await couponModel.findOne({ code: code, userId: req.user._id, isActive: true})
        if (!coupon) {
            return res.status(404).json({message: "Khong tim thay coupon"})
        }
        if (coupon.expirationDate < new Date()) {
            coupon.isActive = false;
            await coupon.save();
            return res.status(404).json({message: "Coupon da het han"})
        }
        res.status(200).json({message: "Coupon hop le", data: coupon, discountPercentage: coupon.discountPercentage})
    } catch (error) {
        console.log("Lỗi server validate coupon", error.message);
        res.status(500).json({ message:"Lỗi server", error: error.message});
    }
}
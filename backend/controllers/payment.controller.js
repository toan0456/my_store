import { stripe } from "../lib/stripe.js";
import couponModel from "../models/coupon.model.js";
import orderModel from "../models/order.model.js";

export const createCheckoutSession = async (req, res) => {
    try {
        const {products, couponCode} = req.body;

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: "Vui long chon san pham" });
        }

        let totalAmount = 0;

        const lineItems = products.map((product)=> {
            const amount = Math.round(product.price * 100);
            totalAmount += amount* product.quantity;

            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: product.name,
                        images: [product.images]
                    },
                    unit_amount: amount
                }
            }
        })

        let coupons = null;
        if (couponCode) {
            coupons = await couponModel.findOne({code: couponCode, userId: req.user._id ,isActive: true});
            if (coupons) {
                totalAmount -= totalAmount * (coupons.discountPercentage / 100);
            }
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
            discounts: coupons ? [
                {
                    coupon: await createStripeCoupon(coupons.discountPercentage)
                }
            ] : [],
            metadata: {
                userId: req.user._id.toString(),
                couponCode: couponCode || "",
                products : JSON.stringify(
                    products.map((p)=> ({
                        id:p._id,
                        quantity:p.quantity,
                        name:p.name
                    }))
                )
            }
        })

        if (totalAmount >= 20000) {
            await createNewCoupon(req.user._id)
        }

        res.status(200).json({id: session.id, totalAmount: totalAmount / 100})
    } catch (error) {
        console.log("Lỗi server create checkout session", error.message);
        res.status(500).json({ message:"Lỗi server", error: error.message });
    }
}

const createStripeCoupon = async (discountPercentage)=> {
    const coupon = await stripe.coupons.create({
        percent_off: discountPercentage,
        duration: "once"
    })
    return coupon.id
}

async function createNewCoupon(userId) {
    const newCoupon = new couponModel({
        code: "GIF"+ Math.random().toString(36).substring(2, 8).toUpperCase(),
        discountPercentage: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        userId: userId,
    })
    await newCoupon.save();

    return newCoupon
}

export const checkoutSuccess = async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === "paid") {
            if (session.metadata.couponCode) {
                await couponModel.findByIdAndUpdate({
                    code: session.metadata.couponCode, userId: session.metadata.userId
                }, {
                    isActive: false
                })
            }
            // create order
            const products = JSON.parse(session.metadata.products)
            const newOrder = new orderModel({
                user: session.metadata.userId,
                products: products.map((p)=> ({
                    products:p.id,
                    quantity:p.quantity,
                    price:p.price
                })),
                totalAmount: session.amount_total / 100, // convert to usd
                stripeSessionId: sessionId
            })

            newOrder.save();
            res.status(200).json({
                success: true,
                message: "Thanh toan thanh cong",
                orderId: newOrder._id
            })
        }
    } catch (error) {
        console.log("Lỗi server checkout success", error.message);
        res.status(500).json({ message:"Lỗi server", error: error.message });
    }
}
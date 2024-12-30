import productModel from "../models/product.model.js";

export const addToCart = async (req, res) => {
    try {
        const {productId} = req.body;
        const user = req.user;

        const exitstingItem = user.cartItems.find((item) => item.id === productId)
        if (exitstingItem) {
            exitstingItem.quantity +=1;
        }else{
            user.cartItems.push(productId)
        }
        await user.save();
        res.status(200).json(user.cartItems)
    } catch (error) {
        console.log("Lỗi server add to cart", error.message);
        res.status(500).json({ message:"Lỗi server", error: error.message });
    }
}

export const removeAllFromCart = async (req, res)=>{
    try {
        const {productId}= req.body;
        const user = req.user;
        if (!productId) {
            user.cartItems = [];
        }else{
            user.cartItems = user.cartItems.filter(item => item.id !== productId)
        }
        await user.save();
        res.status(200).json({message: "Thanh cong", data: user.cartItems})
    } catch (error) {
        console.log("Lỗi server remove from cart", error.message);
        res.status(500).json({ message:"Lỗi server", error: error.message });
    }
}

export const updateQuantity = async (req, res)=>{
    try {
        const {id: productId} = req.params
        const {quantity} = req.body
        const user = req.user;

        const exitstingItem = user.cartItems.find(item => item.id === productId)
        if (exitstingItem) {
            if (quantity === 0) {
                user.cartItems = user.cartItems.filter(item => item.id !== productId)
                await user.save();
                res.status(200).json({message: "Thanh cong", data: user.cartItems})
            }
            exitstingItem.quantity = quantity;
            await user.save();
            res.status(200).json({message: "Thanh cong", data: user.cartItems})
        }else{
            res.status(404).json({message: "Khong tim thay san pham"})
        }
    } catch (error) {
        console.log("Lỗi server update quantity", error.message);
        res.status(500).json({ message:"Lỗi server", error: error.message });
    }
}

export const getCartProducts = async (req, res)=> {
    try {
        const products = await productModel.find({ _id: { $in: req.user.cartItems } })
        // console.log("product", products)
        // thêm số lượng vào mỗi sản phẩm
        const cartItems = products.map((prod) => {
            const items = req.user.cartItems.find((cartItem) => cartItem.id === prod.id)
            return {...prod.toJSON(), quantity: items.quantity}
        })
        res.status(200).json(cartItems)
    } catch (error) {
        console.log("Lỗi server get cart products", error.message);
        res.status(500).json({ message:"Lỗi server", error: error.message });
    }
}
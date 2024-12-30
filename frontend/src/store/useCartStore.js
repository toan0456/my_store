import {create} from "zustand"
import axios from "../lib/axios"
import {toast} from "react-hot-toast"
import axiosInstance from "../lib/axios"

export const useCartStore = create((set, get)=>( {
    cart: [],
    coupon: null,
    total: 0,
    subtotal:0,
    isCouponApplied: false,

    getMyyCoupon: async ()=> {
        try {
            const res = await axios.get("/coupons")
            console.log("coupon", res)
            set({coupon: res.data})
        } catch (error) {
            console.log("error get coupon", error.message)
        }
    },
    applyCoupon: async(code)=> {
        try {
            const res = await axios.post(`/coupons/validate`, {code: code})
        set({coupon: res.data, isCouponApplied: true})
        get().caculateTotal()
        toast.success("Nhập mã thành công!")
        } catch (error) {
            toast.error(error.response.data.message || "Nhập mã thất bại")
        }
    },
    removeCoupon: async()=> {
        set({coupon: null, isCouponApplied: false})
        get().caculateTotal()
        toast.success("Xoa ma khuyen mai thanh cong")
    },
    
    getCartItem: async()=> {
        try {
            const res = await axios.get("/cart")
            // console.log("get cart", res.data)
            set({cart: res.data})
            get().caculateTotal();
        } catch (error) {
            set({cart:[]})
            toast.error(error.response.data.message || "Lỗi server")
        }
    },
    addToCart: async (product) => {
		try {
			await axios.post("/cart", { productId: product._id });
			toast.success("Product added to cart");

			set((prevState) => {
				const existingItem = prevState.cart.find((item) => item._id === product._id);
				const newCart = existingItem
					? prevState.cart.map((item) =>
							item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
					  )
					: [...prevState.cart, { ...product, quantity: 1 }];
				return { cart: newCart };
			});
			get().calculateTotals();
		} catch (error) {
			toast.error(error.response.data.message || "An error occurred");
		}
	},
    removeFromCart: async(id)=> {
        await axios.delete(`/cart`, {data: {productId: id}})
        set((preState)=> ({
            cart: preState.cart.filter((item)=> item._id !== id)
        }))
        get().caculateTotal()
    },
    updateQuantity: async(id, quantity)=> {
        if (quantity === 0) {
            return get().removeFromCart(id)
        }
        await axios.put(`/cart/${id}`, {quantity: quantity})
        set((preState)=> ({
            cart: preState.cart.map((item)=> item._id === id ? {...item, quantity} : item)
        }))
        get().caculateTotal()
    },
    caculateTotal: async()=> {
        const { cart, coupon} = get()
        const subtotal = cart.reduce((sum,item)=> sum + item.price * item.quantity, 0)
        let total =subtotal
        if (coupon) {
            const discount = subtotal * (coupon.discountPercentage /100)
            total = subtotal - discount
        }

        set({subtotal, total})
    },
    clearCart: async()=> {
        set({cart: [], total: 0, subtotal: 0, coupon: null})
    },
    
}))
import {create} from "zustand"
import axios from "../lib/axios"
import {toast} from "react-hot-toast"

export const useProductStore = create((set)=> ({
    products: [],
    loading: false,

    setProducts: (products)=> set({products}),
    createProduct: async(productData)=> {
        set({loading: true})

        try {
            const res = await axios.post(`/product`, productData)
            set((preState)=> ({
                products:[...preState.products, res.data],
                loading: false
            }))
            toast.success("Tao san pham thanh cong")
        } catch (error) {
            toast.error(error.response.data.message || "Lỗi server")
            set({loading: false})
        }
    },

    fetchAllProducts: async()=> {
        set({loading: true})
        try {
            const res= await axios.get(`/product`)
            console.log(res.data)
            set({products: res.data.data, loading: false})
        } catch (error) {
            set({loading: false})
            toast.error(error.response.data.message || "Lỗi server")
        }
    },

    deleteProduct: async(id)=> {
        set({ loading: true})
        try {
            const res = await axios.delete(`/product/delete-products/${id}`)
            set((preState)=> ({
                products: preState.products.filter((product)=> product._id !== id),
                loading: false
            }))
        } catch (error) {
            set({loading: false})
            toast.error(error.response.data.message || "Lỗi server")
        }
    },

    toggleFeaturedProduct: async (productId) => {
		set({ loading: true });
		try {
			const response = await axios.patch(`/product/toggle-featured-product/${productId}`);
			// this will update the isFeatured prop of the product
			set((prevProducts) => ({
				products: prevProducts.products.map((product) =>
					product._id === productId ? { ...product, isFeatured: response.data.isFeatured } : product
				),
				loading: false,
			}));
		} catch (error) {
			set({ loading: false });
			toast.error(error.response.data.message || "Failed to update product");
		}
	},

    fetchProductByCategory: async (category) => {
        set({loading: true})
        try {
            const res = await axios.get(`/product/category/${category}`)
            // console.log("category is here", res.data.data)
            set({products: res.data.data, loading: false})
        } catch (error) {
            set({loading: false})
            toast.error(error.response.data.message || "Lỗi server")
        }
    },
}))
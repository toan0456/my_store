import {create} from "zustand"
import axios from "../lib/axios"
import {toast} from "react-hot-toast"

export const useUserStore = create((set)=>( {
    user: null,
    loading: false,
    checkingAuth: true,

    signup: async({name, email, password, confirmPassword})=> {
        set({ loading: true })

        if (password !== confirmPassword) {
            set({ loading: false })
            return toast.error("Mật khẩu không khớp!")
        }

        try {
            const res = await axios.post("/auth/signup", {name, email, password})
            set({ user: res.data, loading: false })
        } catch (error) {
            console.log(error)
            set({ loading: false })
            toast.error(error.response.data.message || "Lỗi server")
        }
    },

    login: async({email, password})=> {
        set({ loading: true })

        try {
            const res = await axios.post("/auth/login", { email, password})
            set({ user: res.data, loading: false })
            toast.success("Dang nhap thanh cong")
        } catch (error) {
            console.log(error)
            set({ loading: false })
            toast.error(error.response.data.message || "Lỗi server")
        }
    },

    checkAuth: async ()=> {
        set: ({ checkingAuth: true})
        try {
            const res = await axios.get(`/auth/profile`)
            // console.log("res", res.data)
            set({user: res.data,checkingAuth: false})
        } catch (error) {
            set({ checkingAuth: false, user: null})
        }
    },

    logout: async()=> {
        try {
            await axios.post(`/auth/logout`)
            set({ user: null})
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi server")
        }
    },

}) )
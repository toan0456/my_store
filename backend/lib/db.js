import mongoose from "mongoose";

export const connectDB = async ()=> {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL)
        console.log(`MongoDB kết nối thành công`)
    } catch (error) {
        console.log("Kết nối tới MongoDB thất bại", error.message)
        process.exit(1)
    }
}
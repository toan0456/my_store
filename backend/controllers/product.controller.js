import cloudinary from "../lib/cloudnary.js";
import { redis } from "../lib/redis.js";
import productModel from "../models/product.model.js"

export const getAllProducts = async (req, res) => {
    try {
        const products = await productModel.find()
        res.status(200).json({message: "Toan bo san pham", data: products})
    } catch (error) {
        console.log("Lỗi server get all products", error.message);
        res.status(500).json({ message:"Lỗi server", error: error.message });
    }
}

export const getFeaturedProducts = async (req, res) => {
    try {
        let featuredProducts = await redis.get("featured_products");
        if (featuredProducts) {
            return res.json(JSON.parse(featuredProducts));
        }
        // Nếu không có dữ liệu trong redis, lấy dữ liệu từ mongoDB
        // .lean() sẽ trả về một đối tượng javascript object thay vì tài liệu mongodb
        featuredProducts = await productModel.find({ isFeatured: true }).lean();
        if (!featuredProducts) {
            return res.status(404).json({ message: "Khong tim thay san pham" });
        }
        
        await redis.set("featured_products", JSON.stringify(featuredProducts));
        res.status(200).json({ message: "Thanh cong", data: featuredProducts });
    } catch (error) {
        console.log("Lỗi server get featured products", error.message);
        res.status(500).json({ message:"Lỗi server", error: error.message });
    }
}

export const createProducts = async ( req, res ) => {
    try {
        const { name, price, description, image, category } = req.body;

        let cloudinaryResponse = null;
        if (image) {
           cloudinaryResponse = await cloudinary.uploader.upload(image, {folder:"products"})
        }

        const product = await productModel.create({
            name,
            price,
            description,
            image: cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url: "",
            category
        })
        res.status(201).json({message: "Tao san pham thanh cong", data: product})
    } catch (error) {
        console.log("Lỗi server create product", error.message);
        res.status(500).json({ message:"Lỗi server", error: error.message });
    }
}

export const deleteProducts = async (req, res)=> {
    try {
        const product = await productModel.findById(req.params.id)
        if (!product) {
            return res.status(404).json({ message: "Khong tim thay san pham" });
        }
        if (product.image) {
            const public_id = product.image.split("/").pop().split(".")[0];// Lấy id hình ảnh
            try {
                await cloudinary.uploader.destroy(`products/${public_id}`);
                console.log("delete image on cloudinary");
            } catch (error) {
                console.log("Lỗi xóa hình ảnh", error.message);
            }
        }
        await productModel.findByIdAndDelete(req.params.id)
        res.status(200).json({message: "Xoa san pham thanh cong"})
    } catch (error) {
        console.log("Lỗi server delete product", error.message);
        res.status(500).json({ message:"Lỗi server", error: error.message });
    }
}

export const getRecomentProducts = async (req, res)=> {
    try {
        const product = await productModel.aggregate([
            {
                $sample: {
                    size: 3
                }
            },{
                $project: {
                    _id:1,
                    name:1,
                    price:1,
                    image:1,
                    description:1
                }
            }
        ])
        res.status(200).json({message: "San pham khuyen mai", data: product})
    } catch (error) {
        console.log("Lỗi server get recoment products", error.message);
        res.status(500).json({ message:"Lỗi server", error: error.message });
    }
}

export const getProductsByCategory = async (req, res)=> {
    const {category}= req.params;
    try {
        const product = await productModel.find({ category})
        res.status(200).json({message: "San pham theo danh muc", data: product})
    } catch (error) {
        console.log("Lỗi server get products by category", error.message);
        res.status(500).json({ message:"Lỗi server", error: error.message });
    }
}

export const toggleFeatureProduct =async (req, res)=> {
    try {
        const product = await productModel.findById(req.params.id)
        if (product) {
            product.isFeatured = !product.isFeatured;
            const updateProduct = await product.save();
            await updateFeaturedProductsCache()
            res.status(200).json({message: "Thanh cong", data: updateProduct})
        }else{
            res.status(404).json({message: "Khong tim thay san pham"})
        }
    } catch (error) {
        console.log("Lỗi server toggle feature product", error.message);
        res.status(500).json({ message:"Lỗi server", error: error.message });
    }
}

const updateFeaturedProductsCache = async () => {
    try {
        const featuredProducts = await productModel.find({ isFeatured: true }).lean();
        await redis.set("featured_products", JSON.stringify(featuredProducts));
    } catch (error) {
        console.log("Lỗi update featured products cache", error.message);
    }
}
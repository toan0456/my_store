import Joi from "joi";

const productValidate = Joi.object({
    name: Joi.string().required().messages({
        "any.required": "Ten san pham la bat buoc",
        "string.empty": "Ten san pham khong duoc de trong"
    }),
    description: Joi.string().required().messages({
        "any.required": "Mo ta san pham la bat buoc",
        "string.empty": "Mo ta san pham khong duoc de trong"
    }),
    price: Joi.number().required().min.messages({
        "any.required": "Gia san pham la bat buoc",
        "string.empty": "Gia san pham khong duoc de trong",
        "string.number": "Gia san pham khong dung dinh dang",
        "number.min": "Gia san pham phai lon hon hoac bang 0"
    }),
    image: Joi.string().required().messages({
        "any.required": "Hinh anh san pham la bat buoc",
        "string.empty": "Hinh anh san pham khong duoc de trong"
    }),
    category: Joi.string().required().messages({
        "any.required": "Danh muc san pham la bat buoc",
        "string.empty": "Danh muc san pham khong duoc de trong"
    }),
})

export default productValidate
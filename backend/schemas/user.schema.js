import Joi from "joi";

const userValidate = Joi.object({
    name: Joi.string().required().messages({
        "any.required": "Ten nguoi dung la bat buoc",
        "string.empty": "Ten nguoi dung khong duoc de trong"
    }),
    email: Joi.string().required().email().trim().messages({
        "any.required": "Email la bat buoc",
        "string.empty": "Email khong duoc de trong",
        "string.email": "Email khong dung dinh dang"
    }),
    password: Joi.string().required().min(8).trim().messages({
        "any.required": "password la bat buoc",
        "string.empty": "password khong duoc de trong",
        "string.password": "password khong dung dinh dang",
        "string.min": "password phai lon hon hoac bang 8 ky tu"
    })
})

export default userValidate
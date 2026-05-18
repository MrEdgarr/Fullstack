const Joi = require("joi");

const registerSchema = Joi.object({
  full_name: Joi.string().trim().min(3).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^[0-9]{10,11}$/)
    .required(),
  password: Joi.string().min(6).required(),
  avatar_url: Joi.string().uri().allow("", null).optional(),
  date_of_birth: Joi.date().allow(null).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = {
  registerSchema,
  loginSchema,
};

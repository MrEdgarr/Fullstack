const Joi = require("joi");

const customerUpdateSchema = Joi.object({
  full_name: Joi.string().trim().min(3).max(100).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string()
    .pattern(/^[0-9]{10,11}$/)
    .optional(),
  avatar_url: Joi.string().uri().allow("", null).optional(),
  date_of_birth: Joi.date().allow(null).optional(),
});

module.exports = {
  customerUpdateSchema,
};

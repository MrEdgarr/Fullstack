const Joi = require("joi");

const brandSchema = Joi.object({
  brand_name: Joi.string().trim().min(2).max(100).required(),
  logo_url: Joi.string().uri().allow("", null).optional(),
});

module.exports = {
  brandSchema,
};

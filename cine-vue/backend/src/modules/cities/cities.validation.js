const Joi = require("joi");

const citySchema = Joi.object({
  city_name: Joi.string().trim().min(2).max(100).required(),
  country: Joi.string().max(50).default("Vietnam"),
  province_code: Joi.string().max(10).allow("", null).optional(),
});

module.exports = {
  citySchema,
};

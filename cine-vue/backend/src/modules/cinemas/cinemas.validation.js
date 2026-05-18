const Joi = require("joi");

const cinemaSchema = Joi.object({
  brand_id: Joi.number().integer().positive().required(),
  city_id: Joi.number().integer().positive().required(),
  cinema_name: Joi.string().trim().min(3).max(150).required(),
  address: Joi.string().trim().min(5).max(255).required(),
  phone: Joi.string()
    .pattern(/^[0-9]{10,11}$/)
    .allow("", null)
    .optional(),
});

module.exports = {
  cinemaSchema,
};

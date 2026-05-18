const Joi = require("joi");

const seatSchema = Joi.object({
  room_id: Joi.number().integer().positive().required(),
  row_letter: Joi.string().trim().max(2).required(),
  seat_number: Joi.number().integer().positive().required(),
  seat_type: Joi.string().valid("standard", "vip", "couple").default("standard"),
});

const seatStatusSchema = Joi.object({
  status: Joi.string().valid("active", "inactive").required(),
});

module.exports = {
  seatSchema,
  seatStatusSchema,
};

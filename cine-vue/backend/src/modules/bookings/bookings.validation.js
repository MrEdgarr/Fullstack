const Joi = require("joi");

const bookingSchema = Joi.object({
  showtime_id: Joi.number().integer().positive().required(),
  showtime_seat_ids: Joi.array().items(Joi.number().integer().positive()).min(1).unique().required(),
  food_combos: Joi.array()
    .items(
      Joi.object({
        food_combo_id: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().positive().max(20).required(),
      }),
    )
    .default([]),
  promotion_code: Joi.string().trim().uppercase().max(50).allow("", null).optional(),
});

const bookingStatusSchema = Joi.object({
  status: Joi.string().valid("pending", "confirmed", "cancelled", "completed").required(),
});

module.exports = {
  bookingSchema,
  bookingStatusSchema,
};

const Joi = require("joi");

const ticketSchema = Joi.object({
  booking_id: Joi.number().integer().positive().required(),
  showtime_seat_id: Joi.number().integer().positive().required(),
  actual_price: Joi.number().min(0).required(),
});

module.exports = {
  ticketSchema,
};

const Joi = require("joi");

const paymentSchema = Joi.object({
  booking_id: Joi.number().integer().positive().required(),
  amount: Joi.number().min(0).required(),
  payment_method: Joi.string().valid("cash", "card", "momo", "vnpay", "zalopay").required(),
  transaction_id: Joi.string().allow("", null).optional(),
});

const paymentStatusSchema = Joi.object({
  status: Joi.string().valid("pending", "success", "failed").required(),
});

module.exports = {
  paymentSchema,
  paymentStatusSchema,
};

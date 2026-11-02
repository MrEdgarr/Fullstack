import Joi from "joi";

export const showtimeCreateSchema = Joi.object({
  movie_id: Joi.number().integer().positive().required(),
  room_id: Joi.number().integer().positive().required(),
  start_time: Joi.date().iso().required(),
  end_time: Joi.date().iso().required(),
  price_standard: Joi.number().min(0).required(),
  price_vip: Joi.number().min(0).required(),
  price_couple: Joi.number().min(0).required(),
});

export const showtimeUpdateSchema = Joi.object({
  start_time: Joi.date().iso().required(),
  end_time: Joi.date().iso().required(),
  price_standard: Joi.number().min(0).required(),
  price_vip: Joi.number().min(0).required(),
  price_couple: Joi.number().min(0).required(),
});

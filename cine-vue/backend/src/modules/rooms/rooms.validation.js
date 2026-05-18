const Joi = require("joi");

const roomCreateSchema = Joi.object({
  cinema_id: Joi.number().integer().positive().required(),
  room_name: Joi.string().trim().min(2).max(50).required(),
  room_type: Joi.string().valid("2D", "3D", "IMAX", "4DX").required(),
});

const roomUpdateSchema = Joi.object({
  room_name: Joi.string().trim().min(2).max(50).required(),
  room_type: Joi.string().valid("2D", "3D", "IMAX", "4DX").required(),
});

module.exports = {
  roomCreateSchema,
  roomUpdateSchema,
};

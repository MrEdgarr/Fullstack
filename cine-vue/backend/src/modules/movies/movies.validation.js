const Joi = require("joi");

const movieSchema = Joi.object({
  title: Joi.string().trim().min(3).max(255).required(),
  title_en: Joi.string().trim().max(255).allow("", null).optional(),
  duration_minutes: Joi.number().integer().min(30).max(300).required(),
  genre: Joi.string().max(100).allow("", null).optional(),
  age_rating: Joi.string().valid("G", "P", "K", "T13", "T16", "T18", "C18").required(),
  rating_percent: Joi.number().min(0).max(100).default(0),
  banner_url: Joi.string().uri().allow("", null).optional(),
  poster_url: Joi.string().uri().allow("", null).optional(),
  trailer_url: Joi.string().uri().allow("", null).optional(),
  description: Joi.string().max(2000).allow("", null).optional(),
  release_date: Joi.date().allow("", null).optional(),
  status: Joi.string().valid("upcoming", "now_showing", "ended").default("upcoming"),
});

module.exports = {
  movieSchema,
};

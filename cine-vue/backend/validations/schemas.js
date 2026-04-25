const Joi = require("joi");

const schemas = {
  // Auth
  register: Joi.object({
    full_name: Joi.string().min(3).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string()
      .pattern(/^[0-9]{10,11}$/)
      .required(),
    password: Joi.string().min(6).required(),
    date_of_birth: Joi.date().optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  // Brands
  brand: Joi.object({
    brand_name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500).optional(),
    website: Joi.string().uri().optional(),
    logo_url: Joi.string().uri().optional(),
  }),

  // Cities
  city: Joi.object({
    city_name: Joi.string().min(2).max(100).required(),
    country: Joi.string().max(50).default("Vietnam"),
    province_code: Joi.string().max(10).optional(),
  }),

  // Cinemas
  cinema: Joi.object({
    brand_id: Joi.number().integer().positive().required(),
    cinema_name: Joi.string().min(3).max(150).required(),
    city_id: Joi.number().integer().positive().required(),
    address: Joi.string().min(5).max(255).required(),
    phone: Joi.string()
      .pattern(/^[0-9]{10,11}$/)
      .optional(),
    email: Joi.string().email().optional(),
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
  }),

  // Screening Rooms
  room: Joi.object({
    cinema_id: Joi.number().integer().positive().required(),
    room_name: Joi.string().min(2).max(50).required(),
    capacity: Joi.number().integer().min(1).max(1000).required(),
    room_type: Joi.string().valid("2D", "3D", "IMAX", "4DX").required(),
    total_seats: Joi.number().integer().min(1).required(),
    description: Joi.string().max(255).optional(),
  }),

  // Room Seat Config
  roomConfig: Joi.object({
    room_id: Joi.number().integer().positive().required(),
    total_seats: Joi.number().integer().min(1).required(),
    standard_seats: Joi.number().integer().min(0).default(0),
    vip_seats: Joi.number().integer().min(0).default(0),
    couple_seats: Joi.number().integer().min(0).default(0),
    layout_note: Joi.string().max(255).optional(),
  }),

  // Seats
  seat: Joi.object({
    room_id: Joi.number().integer().positive().required(),
    row_letter: Joi.string().max(2).required(),
    seat_number: Joi.number().integer().positive().required(),
    seat_type: Joi.string().valid("standard", "vip", "couple").default("standard"),
  }),

  // Movies
  movie: Joi.object({
    title: Joi.string().min(3).max(255).required(),
    duration_minutes: Joi.number().integer().min(1).required(),
    genre: Joi.string().max(100).optional(),
    director: Joi.string().max(150).optional(),
    cast: Joi.string().max(500).optional(),
    release_date: Joi.date().optional(),
    description: Joi.string().optional(),
    poster_url: Joi.string().uri().optional(),
    status: Joi.string().valid("upcoming", "now_showing", "ended").default("upcoming"),
  }),

  // Showtimes
  showtime: Joi.object({
    movie_id: Joi.number().integer().positive().required(),
    room_id: Joi.number().integer().positive().required(),
    start_time: Joi.date().iso().required(),
    end_time: Joi.date().iso().required(),
    base_price: Joi.number().min(0).required(),
  }),

  // Customers
  customerUpdate: Joi.object({
    full_name: Joi.string().min(3).max(100).optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string()
      .pattern(/^[0-9]{10,11}$/)
      .optional(),
    date_of_birth: Joi.date().optional(),
  }),

  // Bookings
  booking: Joi.object({
    customer_id: Joi.number().integer().positive().required(),
    showtime_id: Joi.number().integer().positive().required(),
    total_amount: Joi.number().min(0).required(),
  }),

  // Tickets
  ticket: Joi.object({
    booking_id: Joi.number().integer().positive().required(),
    seat_id: Joi.number().integer().positive().required(),
    actual_price: Joi.number().min(0).required(),
  }),

  // Payments
  payment: Joi.object({
    booking_id: Joi.number().integer().positive().required(),
    amount: Joi.number().min(0).required(),
    payment_method: Joi.string().valid("cash", "card", "momo", "vnpay", "zalopay").required(),
    transaction_id: Joi.string().optional(),
  }),
};

module.exports = schemas;

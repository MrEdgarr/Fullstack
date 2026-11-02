import * as showtimesRepository from "./showtimes.repository.js";
import * as showtimesService from "./showtimes.service.js";
import * as showtimeSeatsService from "./showtime-seats.service.js";
import * as showtimeSeatsRepository from "./showtime-seats.repository.js";

export const getAll = async (req, res, next) => {
  try {
    const [rows] = await showtimesRepository.getAll();
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const getByMovie = async (req, res, next) => {
  try {
    const [rows] = await showtimesRepository.getByMovie(req.params.movieId);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const getMovieScheduleTree = async (req, res, next) => {
  try {
    const data = await showtimesService.getMovieScheduleTree(req.params.movieId, req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getScheduleTree = async (req, res, next) => {
  try {
    const data = await showtimesService.getScheduleTree(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getSeats = async (req, res, next) => {
  try {
    const [rows] = await showtimeSeatsService.getByShowtime(req.params.id);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const {
      movie_id,
      room_id,
      start_time,
      end_time,
      price_standard,
      price_vip,
      price_couple,
    } = req.body;
    const [result] = await showtimesRepository.create(
      movie_id,
      room_id,
      start_time,
      end_time,
      price_standard,
      price_vip,
      price_couple,
    );
    await showtimeSeatsRepository.seedForShowtime(result.insertId);
    res.status(201).json({ success: true, message: "Showtime created successfully" });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { start_time, end_time, price_standard, price_vip, price_couple } = req.body;
    await showtimesRepository.update(
      req.params.id,
      start_time,
      end_time,
      price_standard,
      price_vip,
      price_couple,
    );
    res.json({ success: true, message: "Showtime updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await showtimesRepository.remove(req.params.id);
    res.json({ success: true, message: "Showtime deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export { remove as delete };

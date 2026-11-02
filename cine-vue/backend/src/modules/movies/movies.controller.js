import * as moviesRepository from "./movies.repository.js";
import * as moviesService from "./movies.service.js";

export const getAll = async (req, res, next) => {
  try {
    const [rows] = await moviesRepository.getAll();
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const [rows] = await moviesRepository.getById(req.params.id);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

export const getNowShowing = async (req, res, next) => {
  try {
    const [rows] = await moviesRepository.getNowShowing();
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const getUpcoming = async (req, res, next) => {
  try {
    const [rows] = await moviesRepository.getUpcoming();
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const getByStatus = async (req, res, next) => {
  try {
    const [rows] = await moviesRepository.getByStatus(req.params.status);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    await moviesService.create(req.body, req.files);
    res.status(201).json({ success: true, message: "Movie created successfully" });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    await moviesService.update(req.params.id, req.body, req.files);
    res.json({ success: true, message: "Movie updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await moviesService.remove(req.params.id);
    res.json({ success: true, message: "Movie deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export { remove as delete };

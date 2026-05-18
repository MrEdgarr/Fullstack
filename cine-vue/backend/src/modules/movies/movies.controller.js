const moviesRepository = require("./movies.repository");
const moviesService = require("./movies.service");

exports.getAll = async (req, res, next) => {
  try {
    const [rows] = await moviesRepository.getAll();
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
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

exports.getNowShowing = async (req, res, next) => {
  try {
    const [rows] = await moviesRepository.getNowShowing();
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

exports.getUpcoming = async (req, res, next) => {
  try {
    const [rows] = await moviesRepository.getUpcoming();
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

exports.getByStatus = async (req, res, next) => {
  try {
    const [rows] = await moviesRepository.getByStatus(req.params.status);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    await moviesService.create(req.body, req.files);
    res.status(201).json({ success: true, message: "Movie created successfully" });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    await moviesService.update(req.params.id, req.body, req.files);
    res.json({ success: true, message: "Movie updated successfully" });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await moviesService.delete(req.params.id);
    res.json({ success: true, message: "Movie deleted successfully" });
  } catch (error) {
    next(error);
  }
};

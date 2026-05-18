const showtimesRepository = require("./showtimes.repository");
const showtimeSeatsRepository = require("./showtime-seats.repository");

exports.getAll = async (req, res, next) => {
  try {
    const [rows] = await showtimesRepository.getAll();
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

exports.getByMovie = async (req, res, next) => {
  try {
    const [rows] = await showtimesRepository.getByMovie(req.params.movieId);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

exports.getSeats = async (req, res, next) => {
  try {
    const [rows] = await showtimeSeatsRepository.getByShowtime(req.params.id);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
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

exports.update = async (req, res, next) => {
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

exports.delete = async (req, res, next) => {
  try {
    await showtimesRepository.delete(req.params.id);
    res.json({ success: true, message: "Showtime deleted successfully" });
  } catch (error) {
    next(error);
  }
};

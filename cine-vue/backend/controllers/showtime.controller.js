const queries = require("../queries/showtimesQueries");

exports.getAll = async (req, res) => {
  try {
    const [rows] = await queries.getAll();
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getByMovie = async (req, res) => {
  try {
    const [rows] = await queries.getByMovie(req.params.movieId);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { movie_id, room_id, start_time, end_time, base_price } = req.body;
    await queries.create(movie_id, room_id, start_time, end_time, base_price);
    res.status(201).json({ success: true, message: "Showtime created successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { start_time, end_time, base_price } = req.body;
    await queries.update(req.params.id, start_time, end_time, base_price);
    res.json({ success: true, message: "Showtime updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await queries.delete(req.params.id);
    res.json({ success: true, message: "Showtime deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

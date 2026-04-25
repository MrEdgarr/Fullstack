const queries = require('../queries/moviesQueries');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await queries.getAll();
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const [rows] = await queries.getById(req.params.id);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Movie not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, duration_minutes, genre, director, cast, release_date, description, poster_url, status } = req.body;
    await queries.create(title, duration_minutes, genre, director, cast, release_date, description, poster_url, status);
    res.status(201).json({ success: true, message: 'Movie created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { title, duration_minutes, genre, director, cast, release_date, description, poster_url, status } = req.body;
    await queries.update(req.params.id, title, duration_minutes, genre, director, cast, release_date, description, poster_url, status);
    res.json({ success: true, message: 'Movie updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await queries.delete(req.params.id);
    res.json({ success: true, message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
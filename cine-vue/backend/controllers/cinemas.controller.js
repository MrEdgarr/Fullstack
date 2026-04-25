const queries = require('../queries/cinemasQueries');

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
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Cinema not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { brand_id, cinema_name, city_id, address, phone, email, latitude, longitude } = req.body;
    await queries.create(brand_id, cinema_name, city_id, address, phone, email, latitude, longitude);
    res.status(201).json({ success: true, message: 'Cinema created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { brand_id, cinema_name, city_id, address, phone, email, latitude, longitude } = req.body;
    await queries.update(req.params.id, brand_id, cinema_name, city_id, address, phone, email, latitude, longitude);
    res.json({ success: true, message: 'Cinema updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await queries.delete(req.params.id);
    res.json({ success: true, message: 'Cinema deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
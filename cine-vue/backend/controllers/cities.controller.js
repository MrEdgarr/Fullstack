const queries = require("../queries/citiesQueries");

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
    if (rows.length === 0)
      return res.status(404).json({ success: false, message: "City not found" });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { city_name, country, province_code } = req.body;
    await queries.create(city_name, country, province_code);
    res.status(201).json({ success: true, message: "City created successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { city_name, country, province_code } = req.body;
    await queries.update(req.params.id, city_name, country, province_code);
    res.json({ success: true, message: "City updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await queries.delete(req.params.id);
    res.json({ success: true, message: "City deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

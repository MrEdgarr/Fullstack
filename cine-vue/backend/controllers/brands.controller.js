const queries = require("../queries/brandsQueries");

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
      return res.status(404).json({ success: false, message: "Brand not found" });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { brand_name, description, website, logo_url } = req.body;
    await queries.create(brand_name, description, website, logo_url);
    res.status(201).json({ success: true, message: "Brand created successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { brand_name, description, website, logo_url } = req.body;
    await queries.update(req.params.id, brand_name, description, website, logo_url);
    res.json({ success: true, message: "Brand updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await queries.delete(req.params.id);
    res.json({ success: true, message: "Brand deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

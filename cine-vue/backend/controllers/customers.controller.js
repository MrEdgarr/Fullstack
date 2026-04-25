const queries = require("../queries/customersQueries");

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
      return res.status(404).json({ success: false, message: "Customer not found" });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { full_name, email, phone, password_hash, date_of_birth } = req.body;
    await queries.create(full_name, email, phone, password_hash, date_of_birth);
    res.status(201).json({ success: true, message: "Customer created successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { full_name, email, phone, date_of_birth } = req.body;
    await queries.update(req.params.id, full_name, email, phone, date_of_birth);
    res.json({ success: true, message: "Customer updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await queries.delete(req.params.id);
    res.json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const queries = require('../queries/bookingsQueries');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await queries.getAll();
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getByCustomer = async (req, res) => {
  try {
    const [rows] = await queries.getByCustomer(req.params.customerId);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { customer_id, showtime_id, total_amount } = req.body;
    await queries.create(customer_id, showtime_id, total_amount);
    res.status(201).json({ success: true, message: 'Booking created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    await queries.updateStatus(req.params.id, req.body.status);
    res.json({ success: true, message: 'Booking status updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await queries.delete(req.params.id);
    res.json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
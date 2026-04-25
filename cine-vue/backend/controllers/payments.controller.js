const queries = require('../queries/paymentsQueries');

exports.getByBooking = async (req, res) => {
  try {
    const [rows] = await queries.getByBooking(req.params.bookingId);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { booking_id, amount, payment_method, transaction_id } = req.body;
    await queries.create(booking_id, amount, payment_method, transaction_id);
    res.status(201).json({ success: true, message: 'Payment created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    await queries.updateStatus(req.params.id, req.body.status);
    res.json({ success: true, message: 'Payment status updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
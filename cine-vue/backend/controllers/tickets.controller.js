const queries = require('../queries/ticketsQueries');

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
    const { booking_id, seat_id, actual_price } = req.body;
    await queries.create(booking_id, seat_id, actual_price);
    res.status(201).json({ success: true, message: 'Ticket created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await queries.delete(req.params.id);
    res.json({ success: true, message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
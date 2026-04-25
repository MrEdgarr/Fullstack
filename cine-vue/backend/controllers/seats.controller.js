const queries = require('../queries/seatsQueries');

exports.getByRoom = async (req, res) => {
  try {
    const [rows] = await queries.getByRoom(req.params.roomId);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { room_id, row_letter, seat_number, seat_type } = req.body;
    await queries.create(room_id, row_letter, seat_number, seat_type);
    res.status(201).json({ success: true, message: 'Seat created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    await queries.updateStatus(req.params.id, req.body.status);
    res.json({ success: true, message: 'Seat status updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await queries.delete(req.params.id);
    res.json({ success: true, message: 'Seat deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const queries = require('../queries/roomSeatConfigsQueries');

exports.getByRoom = async (req, res) => {
  try {
    const [rows] = await queries.getByRoom(req.params.roomId);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Config not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { room_id, total_seats, standard_seats, vip_seats, couple_seats, layout_note } = req.body;
    await queries.create(room_id, total_seats, standard_seats, vip_seats, couple_seats, layout_note);
    res.status(201).json({ success: true, message: 'Seat config created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { total_seats, standard_seats, vip_seats, couple_seats, layout_note } = req.body;
    await queries.update(req.params.roomId, total_seats, standard_seats, vip_seats, couple_seats, layout_note);
    res.json({ success: true, message: 'Seat config updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
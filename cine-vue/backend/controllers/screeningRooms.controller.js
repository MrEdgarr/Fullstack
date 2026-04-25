const queries = require("../queries/screeningRoomsQueries");

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
      return res.status(404).json({ success: false, message: "Room not found" });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { cinema_id, room_name, capacity, room_type, total_seats, description } = req.body;
    await queries.create(cinema_id, room_name, capacity, room_type, total_seats, description);
    res.status(201).json({ success: true, message: "Room created successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { room_name, capacity, room_type, total_seats, description } = req.body;
    await queries.update(req.params.id, room_name, capacity, room_type, total_seats, description);
    res.json({ success: true, message: "Room updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await queries.delete(req.params.id);
    res.json({ success: true, message: "Room deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

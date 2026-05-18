const roomsRepository = require("./rooms.repository");

exports.getAll = async (req, res, next) => {
  try {
    const [rows] = await roomsRepository.getAll();
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const [rows] = await roomsRepository.getById(req.params.id);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { cinema_id, room_name, room_type } = req.body;
    await roomsRepository.create(cinema_id, room_name, room_type);
    res.status(201).json({ success: true, message: "Room created successfully" });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { room_name, room_type } = req.body;
    await roomsRepository.update(req.params.id, room_name, room_type);
    res.json({ success: true, message: "Room updated successfully" });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await roomsRepository.delete(req.params.id);
    res.json({ success: true, message: "Room deleted successfully" });
  } catch (error) {
    next(error);
  }
};

import * as seatsRepository from "./seats.repository.js";

export const getByRoom = async (req, res, next) => {
  try {
    const [rows] = await seatsRepository.getByRoom(req.params.roomId);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const { room_id, row_letter, seat_number, seat_type } = req.body;
    await seatsRepository.create(room_id, row_letter, seat_number, seat_type);
    res.status(201).json({ success: true, message: "Seat created successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    await seatsRepository.updateStatus(req.params.id, req.body.status);
    res.json({ success: true, message: "Seat status updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await seatsRepository.remove(req.params.id);
    res.json({ success: true, message: "Seat deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export { remove as delete };

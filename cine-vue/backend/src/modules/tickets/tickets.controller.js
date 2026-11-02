import * as ticketsRepository from "./tickets.repository.js";
import * as ticketsService from "./tickets.service.js";

export const getByBooking = async (req, res, next) => {
  try {
    const [rows] = await ticketsService.getByBooking(req.user, req.params.bookingId);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const { booking_id, showtime_seat_id, actual_price } = req.body;
    await ticketsRepository.create(booking_id, showtime_seat_id, actual_price);
    res.status(201).json({ success: true, message: "Ticket created successfully" });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await ticketsRepository.remove(req.params.id);
    res.json({ success: true, message: "Ticket deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export { remove as delete };

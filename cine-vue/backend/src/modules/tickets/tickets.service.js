import * as ticketsRepository from "./tickets.repository.js";
import * as bookingsRepository from "../bookings/bookings.repository.js";
import * as bookingsService from "../bookings/bookings.service.js";
import AppError from "../../shared/utils/app-error.js";

export const getByBooking = async (currentUser, bookingId) => {
  const [bookingRows] = await bookingsRepository.getById(bookingId);
  const booking = bookingRows[0];

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  bookingsService.assertCanAccessBooking(currentUser, booking);
  return ticketsRepository.getByBooking(bookingId);
};

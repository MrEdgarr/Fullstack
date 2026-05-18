const ticketsRepository = require("./tickets.repository");
const bookingsRepository = require("../bookings/bookings.repository");
const bookingsService = require("../bookings/bookings.service");
const AppError = require("../../shared/utils/app-error");

exports.getByBooking = async (currentUser, bookingId) => {
  const [bookingRows] = await bookingsRepository.getById(bookingId);
  const booking = bookingRows[0];

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  bookingsService.assertCanAccessBooking(currentUser, booking);
  return ticketsRepository.getByBooking(bookingId);
};

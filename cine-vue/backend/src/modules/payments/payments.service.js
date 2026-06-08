const db = require("../../shared/config/database");
const paymentsRepository = require("./payments.repository");
const bookingsRepository = require("../bookings/bookings.repository");
const bookingsService = require("../bookings/bookings.service");
const AppError = require("../../shared/utils/app-error");

exports.getMethods = () => paymentsRepository.getMethods();

exports.getByBooking = async (currentUser, bookingId) => {
  const [bookingRows] = await bookingsRepository.getById(bookingId);
  const booking = bookingRows[0];

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  bookingsService.assertCanAccessBooking(currentUser, booking);
  return paymentsRepository.getByBooking(bookingId);
};

exports.create = async (
  currentUser,
  { booking_id: bookingId, amount, payment_method: paymentMethod, transaction_id: transactionId },
) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [bookingRows] = await bookingsRepository.getByIdForUpdate(connection, bookingId);
    const booking = bookingRows[0];

    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    bookingsService.assertCanAccessBooking(currentUser, booking);

    if (booking.status !== "pending") {
      throw new AppError("Booking is not payable", 409);
    }

    if (booking.expires_at && new Date(booking.expires_at) <= new Date()) {
      throw new AppError("Booking hold has expired", 409);
    }

    if (Number(amount) !== Number(booking.final_amount)) {
      throw new AppError("Payment amount mismatch", 400);
    }

    const [paymentMethodRows] =
      await paymentsRepository.getActiveMethodByPaymentMethod(paymentMethod);

    if (!paymentMethodRows.length) {
      throw new AppError("Payment method is not supported", 400);
    }

    const [paymentResult] = await paymentsRepository.create(
      connection,
      bookingId,
      amount,
      paymentMethod,
      transactionId,
    );

    await connection.commit();
    return { payment_id: paymentResult.insertId };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

exports.updateStatus = async (currentUser, paymentId, status) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();
    const [paymentRows] = await paymentsRepository.getByIdForUpdate(connection, paymentId);
    const payment = paymentRows[0];

    if (!payment) {
      throw new AppError("Payment not found", 404);
    }

    const [bookingRows] = await bookingsRepository.getByIdForUpdate(connection, payment.booking_id);
    const booking = bookingRows[0];

    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    bookingsService.assertCanAccessBooking(currentUser, booking);
    await paymentsRepository.updateStatus(connection, paymentId, status);

    if (status === "success" && booking.status === "pending") {
      await bookingsService.confirmBooking(
        connection,
        booking.booking_id,
        "Booking hold expired before payment confirmation",
      );
      await bookingsRepository.updateStatus(connection, booking.booking_id, "confirmed");
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

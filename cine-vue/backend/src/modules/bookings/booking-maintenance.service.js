const db = require("../../shared/config/database");
const bookingsRepository = require("./bookings.repository");

exports.expireStaleHolds = async () => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [expiredBookings] = await bookingsRepository.getExpiredHeldBookingIds(connection);
    await bookingsRepository.releaseExpiredHeldSeats(connection);

    const bookingIds = expiredBookings.map((row) => row.booking_id);

    if (bookingIds.length > 0) {
      await bookingsRepository.cancelPendingBookings(connection, bookingIds);
    }

    await connection.commit();
    return { expired_booking_count: bookingIds.length };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

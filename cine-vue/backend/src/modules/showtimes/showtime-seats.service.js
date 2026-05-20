const db = require("../../shared/config/database");
const bookingsRepository = require("../bookings/bookings.repository");
const showtimeSeatsRepository = require("./showtime-seats.repository");

exports.getByShowtime = async (showtimeId) => {
  await releaseExpiredHolds();
  return showtimeSeatsRepository.getByShowtime(showtimeId);
};

async function releaseExpiredHolds() {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [expiredBookings] = await bookingsRepository.getExpiredHeldBookingIds(connection);
    const expiredBookingIds = expiredBookings.map((booking) => booking.booking_id);

    await bookingsRepository.releaseExpiredHeldSeats(connection);

    if (expiredBookingIds.length > 0) {
      await bookingsRepository.cancelPendingBookings(connection, expiredBookingIds);
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

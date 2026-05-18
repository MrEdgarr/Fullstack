const db = require("../../shared/config/database");

exports.getByCustomer = (customerId) =>
  db.execute("SELECT * FROM bookings WHERE customer_id = ? ORDER BY created_at DESC", [customerId]);

exports.getById = (bookingId) =>
  db.execute("SELECT * FROM bookings WHERE booking_id = ?", [bookingId]);

exports.getSelectedSeatsForUpdate = (connection, showtimeId, seatIds) =>
  connection.query(
    `
    SELECT showtime_seat_id, price, status, held_until
    FROM showtime_seats
    WHERE showtime_id = ?
      AND showtime_seat_id IN (?)
    FOR UPDATE
    `,
    [showtimeId, seatIds],
  );

exports.releaseExpiredSelectedSeats = (connection, showtimeId, seatIds, now) =>
  connection.query(
    `
    UPDATE showtime_seats
    SET status = 'available',
        held_by_booking_id = NULL,
        held_until = NULL
    WHERE showtime_id = ?
      AND showtime_seat_id IN (?)
      AND status = 'held'
      AND held_until <= ?
    `,
    [showtimeId, seatIds, now],
  );

exports.getShowtimeCinema = (connection, showtimeId) =>
  connection.query(
    `
    SELECT st.showtime_id, r.cinema_id
    FROM showtimes st
    JOIN screening_rooms r ON r.room_id = st.room_id
    WHERE st.showtime_id = ?
    `,
    [showtimeId],
  );

exports.getActiveCombosForUpdate = (connection, comboIds) =>
  connection.query(
    `
    SELECT food_combo_id, cinema_id, price
    FROM food_combos
    WHERE food_combo_id IN (?)
      AND status = 'active'
    FOR UPDATE
    `,
    [comboIds],
  );

exports.getPromotionForUpdate = (connection, promotionCode) =>
  connection.query(
    `
    SELECT *
    FROM promotions
    WHERE code = ?
      AND status = 'active'
      AND starts_at <= NOW()
      AND ends_at >= NOW()
    FOR UPDATE
    `,
    [promotionCode],
  );

exports.create = (
  connection,
  customerId,
  showtimeId,
  promotionId,
  subtotalAmount,
  discountAmount,
  finalAmount,
  expiresAt,
) =>
  connection.query(
    `
    INSERT INTO bookings (
      customer_id,
      showtime_id,
      promotion_id,
      subtotal_amount,
      discount_amount,
      final_amount,
      expires_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      customerId,
      showtimeId,
      promotionId,
      subtotalAmount,
      discountAmount,
      finalAmount,
      expiresAt,
    ],
  );

exports.holdSeats = (connection, bookingId, expiresAt, showtimeId, seatIds) =>
  connection.query(
    `
    UPDATE showtime_seats
    SET status = 'held',
        held_by_booking_id = ?,
        held_until = ?
    WHERE showtime_id = ?
      AND showtime_seat_id IN (?)
    `,
    [bookingId, expiresAt, showtimeId, seatIds],
  );

exports.createFoodComboLines = (connection, comboValues) =>
  connection.query(
    `
    INSERT INTO booking_food_combos (
      booking_id,
      food_combo_id,
      quantity,
      unit_price,
      line_total
    )
    VALUES ?
    `,
    [comboValues],
  );

exports.getByIdForUpdate = (connection, bookingId) =>
  connection.query("SELECT * FROM bookings WHERE booking_id = ? FOR UPDATE", [bookingId]);

exports.getActiveHeldSeatsForBooking = (connection, bookingId) =>
  connection.query(
    `
    SELECT showtime_seat_id
    FROM showtime_seats
    WHERE held_by_booking_id = ?
      AND status = 'held'
      AND held_until > NOW()
    FOR UPDATE
    `,
    [bookingId],
  );

exports.createTicketsFromHeldSeats = (connection, bookingId) =>
  connection.query(
    `
    INSERT INTO tickets (booking_id, showtime_seat_id, seat_id, actual_price)
    SELECT ?, showtime_seat_id, seat_id, price
    FROM showtime_seats
    WHERE held_by_booking_id = ?
      AND status = 'held'
    `,
    [bookingId, bookingId],
  );

exports.markHeldSeatsBooked = (connection, bookingId) =>
  connection.query(
    `
    UPDATE showtime_seats
    SET status = 'booked',
        held_until = NULL
    WHERE held_by_booking_id = ?
    `,
    [bookingId],
  );

exports.releaseHeldSeats = (connection, bookingId) =>
  connection.query(
    `
    UPDATE showtime_seats
    SET status = 'available',
        held_by_booking_id = NULL,
        held_until = NULL
    WHERE held_by_booking_id = ?
      AND status = 'held'
    `,
    [bookingId],
  );

exports.updateStatus = (connection, bookingId, status) =>
  connection.query("UPDATE bookings SET status = ? WHERE booking_id = ?", [status, bookingId]);

exports.delete = (connection, bookingId) =>
  connection.query("DELETE FROM bookings WHERE booking_id = ?", [bookingId]);

exports.getExpiredHeldBookingIds = (connection) =>
  connection.query(
    `
    SELECT DISTINCT held_by_booking_id AS booking_id
    FROM showtime_seats
    WHERE status = 'held'
      AND held_until <= NOW()
      AND held_by_booking_id IS NOT NULL
    FOR UPDATE
    `,
  );

exports.releaseExpiredHeldSeats = (connection) =>
  connection.query(
    `
    UPDATE showtime_seats
    SET status = 'available',
        held_by_booking_id = NULL,
        held_until = NULL
    WHERE status = 'held'
      AND held_until <= NOW()
    `,
  );

exports.cancelPendingBookings = (connection, bookingIds) =>
  connection.query(
    `
    UPDATE bookings
    SET status = 'cancelled',
        cancelled_at = NOW()
    WHERE booking_id IN (?)
      AND status = 'pending'
    `,
    [bookingIds],
  );

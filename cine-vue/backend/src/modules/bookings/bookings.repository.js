import db from "../../shared/config/database.js";

export const getByCustomer = (customerId) =>
  db.execute(
    `
    SELECT 
      b.booking_id,
      b.booking_code,
      b.status AS booking_status,
      b.final_amount,
      b.created_at,
      NULL AS expires_at,
      s.start_time,
      s.end_time,
      m.title AS movie_title,
      m.poster_url,
      c.cinema_name,
      r.room_name,
      (
        SELECT GROUP_CONCAT(CONCAT(se.row_letter, se.seat_number) SEPARATOR ', ')
        FROM tickets t
        JOIN seats se ON se.seat_id = t.seat_id
        WHERE t.booking_id = b.booking_id
      ) AS ticket_seats
    FROM bookings b
    JOIN showtimes s ON b.showtime_id = s.showtime_id
    JOIN movies m ON s.movie_id = m.movie_id
    JOIN screening_rooms r ON s.room_id = r.room_id
    JOIN cinemas c ON r.cinema_id = c.cinema_id
    WHERE b.customer_id = ?
    ORDER BY b.created_at DESC
    `,
    [customerId],
  );

export const getById = (bookingId) =>
  db.execute("SELECT * FROM bookings WHERE booking_id = ?", [bookingId]);

export const getSelectedSeatsForUpdate = (connection, showtimeId, seatIds) =>
  connection.query(
    `
    SELECT showtime_seat_id, seat_id, price, status
    FROM showtime_seats
    WHERE showtime_id = ?
      AND showtime_seat_id IN (?)
    ORDER BY showtime_seat_id ASC
    FOR UPDATE
    `,
    [showtimeId, seatIds],
  );

export const getShowtimeCinema = (connection, showtimeId) =>
  connection.query(
    `
    SELECT st.showtime_id, r.cinema_id
    FROM showtimes st
    JOIN screening_rooms r ON r.room_id = st.room_id
    WHERE st.showtime_id = ?
    `,
    [showtimeId],
  );

export const getActiveCombosForUpdate = (connection, comboIds) =>
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

export const getPromotionForUpdate = (connection, promotionCode) =>
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

export const create = (
  connection,
  customerId,
  showtimeId,
  promotionId,
  subtotalAmount,
  discountAmount,
  finalAmount,
) =>
  connection.query(
    `
    INSERT INTO bookings (
      customer_id,
      showtime_id,
      promotion_id,
      subtotal_amount,
      discount_amount,
      final_amount
    )
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      customerId,
      showtimeId,
      promotionId,
      subtotalAmount,
      discountAmount,
      finalAmount,
    ],
  );

export const createTicketsForSeats = (connection, bookingId, seatIds) =>
  connection.query(
    `
    INSERT INTO tickets (booking_id, showtime_seat_id, seat_id, actual_price)
    SELECT ?, showtime_seat_id, seat_id, price
    FROM showtime_seats
    WHERE showtime_seat_id IN (?)
    ORDER BY showtime_seat_id ASC
    `,
    [bookingId, seatIds],
  );

export const markSeatsBooked = (connection, seatIds) =>
  connection.query(
    `
    UPDATE showtime_seats
    SET status = 'booked'
    WHERE showtime_seat_id IN (?)
    `,
    [seatIds],
  );

export const releaseSeatsByBooking = (connection, bookingId) =>
  connection.query(
    `
    UPDATE showtime_seats ss
    JOIN tickets t ON t.showtime_seat_id = ss.showtime_seat_id
    SET ss.status = 'available'
    WHERE t.booking_id = ?
    `,
    [bookingId],
  );

export const createFoodComboLines = (connection, comboValues) =>
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

export const getByIdForUpdate = (connection, bookingId) =>
  connection.query("SELECT * FROM bookings WHERE booking_id = ? FOR UPDATE", [bookingId]);

export const updateStatus = (connection, bookingId, status) =>
  connection.query("UPDATE bookings SET status = ? WHERE booking_id = ?", [status, bookingId]);

export const remove = (connection, bookingId) =>
  connection.query("DELETE FROM bookings WHERE booking_id = ?", [bookingId]);

export { remove as delete };

export const deleteFoodCombos = (connection, bookingId) =>
  connection.query("DELETE FROM booking_food_combos WHERE booking_id = ?", [bookingId]);

export const updateBookingDetails = (
  connection,
  bookingId,
  promotionId,
  subtotalAmount,
  discountAmount,
  finalAmount,
) =>
  connection.query(
    `
    UPDATE bookings
    SET promotion_id = ?,
        subtotal_amount = ?,
        discount_amount = ?,
        final_amount = ?
    WHERE booking_id = ?
    `,
    [promotionId, subtotalAmount, discountAmount, finalAmount, bookingId],
  );

export const getSeatsForBooking = (connection, bookingId) =>
  connection.query(
    `
    SELECT showtime_seat_id, actual_price AS price
    FROM tickets
    WHERE booking_id = ?
    `,
    [bookingId],
  );

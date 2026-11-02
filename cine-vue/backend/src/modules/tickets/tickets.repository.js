import db from "../../shared/config/database.js";

export const getByBooking = (booking_id) =>
  db.execute(
    `
    SELECT
      t.*,
      s.row_letter,
      s.seat_number,
      s.seat_type
    FROM tickets t
    JOIN showtime_seats ss ON ss.showtime_seat_id = t.showtime_seat_id
    JOIN seats s ON s.seat_id = ss.seat_id
    WHERE t.booking_id = ?
    ORDER BY s.row_letter, s.seat_number
    `,
    [booking_id],
  );
export const create = (booking_id, showtime_seat_id, actual_price) =>
  db.execute(
    `
    INSERT INTO tickets (booking_id, showtime_seat_id, seat_id, actual_price)
    SELECT ?, ss.showtime_seat_id, ss.seat_id, ?
    FROM showtime_seats ss
    WHERE ss.showtime_seat_id = ?
    `,
    [booking_id, actual_price, showtime_seat_id],
  );
export const remove = (ticket_id) =>
  db.execute("DELETE FROM tickets WHERE ticket_id = ?", [ticket_id]);
export { remove as delete };

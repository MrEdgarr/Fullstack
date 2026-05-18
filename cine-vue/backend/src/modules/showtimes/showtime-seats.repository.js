const db = require("../../shared/config/database");

exports.getByShowtime = (showtimeId) =>
  db.execute(
    `
    SELECT
      ss.showtime_seat_id,
      ss.showtime_id,
      ss.seat_id,
      ss.status,
      ss.held_until,
      ss.price,
      s.row_letter,
      s.seat_number,
      s.seat_type
    FROM showtime_seats ss
    JOIN seats s ON s.seat_id = ss.seat_id
    WHERE ss.showtime_id = ?
    ORDER BY s.row_letter, s.seat_number
    `,
    [showtimeId],
  );

exports.seedForShowtime = (showtimeId) =>
  db.execute(
    `
    INSERT INTO showtime_seats (showtime_id, seat_id, price)
    SELECT
      st.showtime_id,
      s.seat_id,
      CASE s.seat_type
        WHEN 'vip' THEN st.price_vip
        WHEN 'couple' THEN st.price_couple
        ELSE st.price_standard
      END AS price
    FROM showtimes st
    JOIN seats s ON s.room_id = st.room_id
    LEFT JOIN showtime_seats ss
      ON ss.showtime_id = st.showtime_id
     AND ss.seat_id = s.seat_id
    WHERE st.showtime_id = ?
      AND s.status = 'active'
      AND ss.showtime_seat_id IS NULL
    `,
    [showtimeId],
  );

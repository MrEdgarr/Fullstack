const db = require("../../shared/config/database");

exports.getAll = () =>
  db.execute(`
  SELECT s.*, m.title, r.room_name, c.cinema_name 
  FROM showtimes s 
  JOIN movies m ON s.movie_id = m.movie_id 
  JOIN screening_rooms r ON s.room_id = r.room_id 
  JOIN cinemas c ON r.cinema_id = c.cinema_id 
  ORDER BY s.start_time
`);
exports.getByMovie = (movie_id) =>
  db.execute("SELECT * FROM showtimes WHERE movie_id = ? ORDER BY start_time", [movie_id]);
exports.create = (
  movie_id,
  room_id,
  start_time,
  end_time,
  price_standard,
  price_vip,
  price_couple,
) =>
  db.execute(
    `
    INSERT INTO showtimes (
      movie_id,
      room_id,
      start_time,
      end_time,
      price_standard,
      price_vip,
      price_couple
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [movie_id, room_id, start_time, end_time, price_standard, price_vip, price_couple],
  );
exports.update = (id, start_time, end_time, price_standard, price_vip, price_couple) =>
  db.execute(
    "UPDATE showtimes SET start_time = ?, end_time = ?, price_standard = ?, price_vip = ?, price_couple = ? WHERE showtime_id = ?",
    [start_time, end_time, price_standard, price_vip, price_couple, id],
  );
exports.delete = (id) => db.execute("DELETE FROM showtimes WHERE showtime_id = ?", [id]);

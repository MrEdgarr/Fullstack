const db = require("../../shared/config/database");

const SHOWTIME_SELECT = `
  SELECT
    s.showtime_id,
    s.movie_id,
    s.room_id,
    s.start_time,
    s.end_time,
    DATE_FORMAT(s.start_time, '%Y-%m-%d') AS show_date,
    DATE_FORMAT(s.start_time, '%H:%i') AS show_time,
    s.price_standard,
    s.price_vip,
    s.price_couple,
    s.status,
    m.title,
    m.genre,
    m.age_rating,
    m.duration_minutes,
    m.poster_url,
    r.room_name,
    r.room_type,
    b.brand_id,
    b.brand_name,
    b.logo_url AS brand_logo_url,
    c.cinema_id,
    c.cinema_name,
    c.address AS cinema_address,
    c.city_id,
    city.city_name
  FROM showtimes s
  JOIN movies m ON s.movie_id = m.movie_id
  JOIN screening_rooms r ON s.room_id = r.room_id
  JOIN cinemas c ON r.cinema_id = c.cinema_id
  JOIN cinema_brands b ON c.brand_id = b.brand_id
  JOIN cities city ON c.city_id = city.city_id
`;

exports.getAll = () =>
  db.execute(`
  ${SHOWTIME_SELECT}
  WHERE s.status = 'scheduled'
  ORDER BY s.start_time
`);

exports.getByMovie = (movie_id) =>
  db.execute(
    `
    ${SHOWTIME_SELECT}
    WHERE s.status = 'scheduled'
      AND s.movie_id = ?
    ORDER BY s.start_time
    `,
    [movie_id],
  );

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

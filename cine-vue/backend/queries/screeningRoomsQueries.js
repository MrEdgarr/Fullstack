const db = require("../config/database");

exports.getAll = () => db.execute("SELECT * FROM screening_rooms ORDER BY room_name");
exports.getByCinema = (cinema_id) =>
  db.execute("SELECT * FROM screening_rooms WHERE cinema_id = ? ORDER BY room_name", [cinema_id]);
exports.getById = (id) => db.execute("SELECT * FROM screening_rooms WHERE room_id = ?", [id]);
exports.create = (cinema_id, room_name, capacity, room_type, total_seats, description) =>
  db.execute(
    "INSERT INTO screening_rooms (cinema_id, room_name, capacity, room_type, total_seats, description) VALUES (?, ?, ?, ?, ?, ?)",
    [cinema_id, room_name, capacity, room_type, total_seats, description],
  );
exports.update = (id, room_name, capacity, room_type, total_seats, description) =>
  db.execute(
    "UPDATE screening_rooms SET room_name = ?, capacity = ?, room_type = ?, total_seats = ?, description = ? WHERE room_id = ?",
    [room_name, capacity, room_type, total_seats, description, id],
  );
exports.delete = (id) => db.execute("DELETE FROM screening_rooms WHERE room_id = ?", [id]);

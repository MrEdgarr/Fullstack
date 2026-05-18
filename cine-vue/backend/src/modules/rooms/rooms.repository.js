const db = require("../../shared/config/database");

exports.getAll = () => db.execute("SELECT * FROM screening_rooms ORDER BY room_name");
exports.getById = (id) => db.execute("SELECT * FROM screening_rooms WHERE room_id = ?", [id]);
exports.create = (cinema_id, room_name, room_type) =>
  db.execute(
    "INSERT INTO screening_rooms (cinema_id, room_name, room_type) VALUES (?, ?, ?)",
    [cinema_id, room_name, room_type],
  );
exports.update = (id, room_name, room_type) =>
  db.execute(
    "UPDATE screening_rooms SET room_name = ?, room_type = ? WHERE room_id = ?",
    [room_name, room_type, id],
  );
exports.delete = (id) => db.execute("DELETE FROM screening_rooms WHERE room_id = ?", [id]);

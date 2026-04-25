const db = require("../config/database");

exports.getByRoom = (room_id) =>
  db.execute("SELECT * FROM room_seat_configs WHERE room_id = ?", [room_id]);
exports.create = (room_id, total_seats, standard_seats, vip_seats, couple_seats, layout_note) =>
  db.execute(
    "INSERT INTO room_seat_configs (room_id, total_seats, standard_seats, vip_seats, couple_seats, layout_note) VALUES (?, ?, ?, ?, ?, ?)",
    [room_id, total_seats, standard_seats, vip_seats, couple_seats, layout_note],
  );
exports.update = (room_id, total_seats, standard_seats, vip_seats, couple_seats, layout_note) =>
  db.execute(
    "UPDATE room_seat_configs SET total_seats = ?, standard_seats = ?, vip_seats = ?, couple_seats = ?, layout_note = ? WHERE room_id = ?",
    [total_seats, standard_seats, vip_seats, couple_seats, layout_note, room_id],
  );

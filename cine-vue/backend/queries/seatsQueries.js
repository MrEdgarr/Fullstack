const db = require("../config/database");

exports.getByRoom = (room_id) =>
  db.execute("SELECT * FROM seats WHERE room_id = ? ORDER BY row_letter, seat_number", [room_id]);
exports.create = (room_id, row_letter, seat_number, seat_type) =>
  db.execute(
    "INSERT INTO seats (room_id, row_letter, seat_number, seat_type) VALUES (?, ?, ?, ?)",
    [room_id, row_letter, seat_number, seat_type],
  );
exports.updateStatus = (seat_id, status) =>
  db.execute("UPDATE seats SET status = ? WHERE seat_id = ?", [status, seat_id]);
exports.delete = (seat_id) => db.execute("DELETE FROM seats WHERE seat_id = ?", [seat_id]);

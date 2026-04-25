const db = require("../config/database");

exports.getByBooking = (booking_id) =>
  db.execute("SELECT * FROM tickets WHERE booking_id = ?", [booking_id]);
exports.create = (booking_id, seat_id, actual_price) =>
  db.execute("INSERT INTO tickets (booking_id, seat_id, actual_price) VALUES (?, ?, ?)", [
    booking_id,
    seat_id,
    actual_price,
  ]);
exports.delete = (ticket_id) => db.execute("DELETE FROM tickets WHERE ticket_id = ?", [ticket_id]);

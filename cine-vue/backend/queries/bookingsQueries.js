const db = require("../config/database");

exports.getAll = () => db.execute("SELECT * FROM bookings ORDER BY booking_time DESC");
exports.getByCustomer = (customer_id) =>
  db.execute("SELECT * FROM bookings WHERE customer_id = ? ORDER BY booking_time DESC", [
    customer_id,
  ]);
exports.create = (customer_id, showtime_id, total_amount) =>
  db.execute("INSERT INTO bookings (customer_id, showtime_id, total_amount) VALUES (?, ?, ?)", [
    customer_id,
    showtime_id,
    total_amount,
  ]);
exports.updateStatus = (id, status) =>
  db.execute("UPDATE bookings SET status = ? WHERE booking_id = ?", [status, id]);
exports.delete = (id) => db.execute("DELETE FROM bookings WHERE booking_id = ?", [id]);

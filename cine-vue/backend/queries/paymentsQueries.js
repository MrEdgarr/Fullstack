const db = require("../config/database");

exports.getByBooking = (booking_id) =>
  db.execute("SELECT * FROM payments WHERE booking_id = ?", [booking_id]);
exports.create = (booking_id, amount, payment_method, transaction_id) =>
  db.execute(
    "INSERT INTO payments (booking_id, amount, payment_method, transaction_id) VALUES (?, ?, ?, ?)",
    [booking_id, amount, payment_method, transaction_id],
  );
exports.updateStatus = (id, status) =>
  db.execute("UPDATE payments SET status = ? WHERE payment_id = ?", [status, id]);

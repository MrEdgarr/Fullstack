const db = require("../../shared/config/database");

exports.getByBooking = (bookingId) =>
  db.execute("SELECT * FROM payments WHERE booking_id = ?", [bookingId]);

exports.create = (connection, bookingId, amount, paymentMethod, transactionId) =>
  connection.query(
    `
    INSERT INTO payments (
      booking_id,
      amount,
      payment_method,
      transaction_id
    )
    VALUES (?, ?, ?, ?)
    `,
    [bookingId, amount, paymentMethod, transactionId || null],
  );

exports.getByIdForUpdate = (connection, paymentId) =>
  connection.query("SELECT * FROM payments WHERE payment_id = ? FOR UPDATE", [paymentId]);

exports.updateStatus = (connection, paymentId, status) =>
  connection.query("UPDATE payments SET status = ?, payment_time = NOW() WHERE payment_id = ?", [
    status,
    paymentId,
  ]);

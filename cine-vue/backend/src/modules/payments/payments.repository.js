const db = require("../../shared/config/database");

exports.getMethods = () =>
  db.execute(`
    SELECT
      payment_method_id,
      code,
      name,
      payment_method,
      icon_key,
      description,
      sort_order
    FROM payment_methods
    WHERE status = 'active'
    ORDER BY sort_order ASC, payment_method_id ASC
  `);

exports.getActiveMethodByPaymentMethod = (paymentMethod) =>
  db.execute(
    `
    SELECT payment_method_id
    FROM payment_methods
    WHERE payment_method = ?
      AND status = 'active'
    LIMIT 1
    `,
    [paymentMethod],
  );

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

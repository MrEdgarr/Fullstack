const db = require("../config/database");

exports.getAll = () => db.execute("SELECT * FROM customers");
exports.getById = (id) => db.execute("SELECT * FROM customers WHERE customer_id = ?", [id]);
exports.create = (full_name, email, phone, password_hash, date_of_birth) =>
  db.execute(
    "INSERT INTO customers (full_name, email, phone, password_hash, date_of_birth) VALUES (?, ?, ?, ?, ?)",
    [full_name, email, phone, password_hash, date_of_birth],
  );
exports.update = (id, full_name, email, phone, date_of_birth) =>
  db.execute(
    "UPDATE customers SET full_name = ?, email = ?, phone = ?, date_of_birth = ? WHERE customer_id = ?",
    [full_name, email, phone, date_of_birth, id],
  );
exports.delete = (id) => db.execute("DELETE FROM customers WHERE customer_id = ?", [id]);

const db = require("../../shared/config/database");

const PUBLIC_CUSTOMER_SELECT = `
  SELECT
    customer_id,
    full_name,
    email,
    phone,
    avatar_url,
    DATE_FORMAT(date_of_birth, '%Y-%m-%d') AS date_of_birth,
    role,
    status,
    created_at,
    updated_at
  FROM customers
`;

exports.getByEmail = (email) => db.execute("SELECT * FROM customers WHERE email = ?", [email]);
exports.getById = (id) => db.execute("SELECT * FROM customers WHERE customer_id = ?", [id]);
exports.getPublicById = (id) =>
  db.execute(`${PUBLIC_CUSTOMER_SELECT} WHERE customer_id = ?`, [id]);

exports.create = (full_name, email, phone, password_hash, avatar_url, date_of_birth) => {
  if (avatar_url) {
    return db.execute(
      "INSERT INTO customers (full_name, email, phone, password_hash, avatar_url, date_of_birth) VALUES (?, ?, ?, ?, ?, ?)",
      [full_name, email, phone, password_hash, avatar_url, date_of_birth],
    );
  }

  return db.execute(
    "INSERT INTO customers (full_name, email, phone, password_hash, date_of_birth) VALUES (?, ?, ?, ?, ?)",
    [full_name, email, phone, password_hash, date_of_birth],
  );
};
exports.update = (id, full_name, email, phone, avatar_url, date_of_birth) =>
  db.execute(
    "UPDATE customers SET full_name = ?, email = ?, phone = ?, avatar_url = COALESCE(?, avatar_url), date_of_birth = ? WHERE customer_id = ?",
    [full_name, email, phone, avatar_url, date_of_birth, id],
  );

exports.updateProfile = (id, profile) =>
  db.execute(
    `UPDATE customers
     SET full_name = ?,
         email = ?,
         phone = ?,
         avatar_url = ?,
         date_of_birth = ?
     WHERE customer_id = ?`,
    [
      profile.full_name,
      profile.email,
      profile.phone,
      profile.avatar_url,
      profile.date_of_birth,
      id,
    ],
  );

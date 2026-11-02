import db from "../../shared/config/database.js";

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

export const getByEmail = (email) => db.execute("SELECT * FROM customers WHERE email = ?", [email]);
export const getById = (id) => db.execute("SELECT * FROM customers WHERE customer_id = ?", [id]);
export const getPublicById = (id) =>
  db.execute(`${PUBLIC_CUSTOMER_SELECT} WHERE customer_id = ?`, [id]);

export const create = (full_name, email, phone, password_hash, avatar_url, date_of_birth) => {
  const safeDob = date_of_birth === undefined ? null : date_of_birth;
  const safeAvatar = avatar_url === undefined ? null : avatar_url;

  if (safeAvatar) {
    return db.execute(
      "INSERT INTO customers (full_name, email, phone, password_hash, avatar_url, date_of_birth) VALUES (?, ?, ?, ?, ?, ?)",
      [full_name, email, phone, password_hash, safeAvatar, safeDob],
    );
  }

  return db.execute(
    "INSERT INTO customers (full_name, email, phone, password_hash, date_of_birth) VALUES (?, ?, ?, ?, ?)",
    [full_name, email, phone, password_hash, safeDob],
  );
};
export const update = (id, full_name, email, phone, avatar_url, date_of_birth) =>
  db.execute(
    "UPDATE customers SET full_name = ?, email = ?, phone = ?, avatar_url = COALESCE(?, avatar_url), date_of_birth = ? WHERE customer_id = ?",
    [full_name, email, phone, avatar_url, date_of_birth, id],
  );

export const updateProfile = (id, profile) =>
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

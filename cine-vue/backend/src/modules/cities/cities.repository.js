import db from "../../shared/config/database.js";

export const getAll = () => db.execute("SELECT * FROM cities ORDER BY city_name");
export const getById = (id) => db.execute("SELECT * FROM cities WHERE city_id = ?", [id]);
export const create = (city_name, country, province_code) =>
  db.execute("INSERT INTO cities (city_name, country, province_code) VALUES (?, ?, ?)", [
    city_name,
    country,
    province_code,
  ]);
export const update = (id, city_name, country, province_code) =>
  db.execute("UPDATE cities SET city_name = ?, country = ?, province_code = ? WHERE city_id = ?", [
    city_name,
    country,
    province_code,
    id,
  ]);
export const remove = (id) => db.execute("DELETE FROM cities WHERE city_id = ?", [id]);
export { remove as delete };

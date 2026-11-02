import db from "../../shared/config/database.js";

export const getAll = () =>
  db.execute(`
  SELECT c.*, b.brand_name, ci.city_name 
  FROM cinemas c 
  JOIN cinema_brands b ON c.brand_id = b.brand_id 
  JOIN cities ci ON c.city_id = ci.city_id 
  ORDER BY c.cinema_name
`);
export const getById = (id) => db.execute("SELECT * FROM cinemas WHERE cinema_id = ?", [id]);
export const create = (brand_id, cinema_name, city_id, address, phone) =>
  db.execute(
    "INSERT INTO cinemas (brand_id, cinema_name, city_id, address, phone) VALUES (?, ?, ?, ?, ?)",
    [brand_id, cinema_name, city_id, address, phone],
  );
export const update = (id, brand_id, cinema_name, city_id, address, phone) =>
  db.execute(
    "UPDATE cinemas SET brand_id = ?, cinema_name = ?, city_id = ?, address = ?, phone = ? WHERE cinema_id = ?",
    [brand_id, cinema_name, city_id, address, phone, id],
  );
export const remove = (id) => db.execute("DELETE FROM cinemas WHERE cinema_id = ?", [id]);
export { remove as delete };

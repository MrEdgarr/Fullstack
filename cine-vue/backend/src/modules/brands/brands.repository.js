import db from "../../shared/config/database.js";

export const getAll = () => db.execute("SELECT * FROM cinema_brands ORDER BY brand_name");
export const getById = (id) => db.execute("SELECT * FROM cinema_brands WHERE brand_id = ?", [id]);
export const create = (brand_name, logo_url) =>
  db.execute("INSERT INTO cinema_brands (brand_name, logo_url) VALUES (?, ?)", [
    brand_name,
    logo_url,
  ]);
export const update = (id, brand_name, logo_url) =>
  db.execute("UPDATE cinema_brands SET brand_name = ?, logo_url = ? WHERE brand_id = ?", [
    brand_name,
    logo_url,
    id,
  ]);
export const remove = (id) => db.execute("DELETE FROM cinema_brands WHERE brand_id = ?", [id]);
export { remove as delete };

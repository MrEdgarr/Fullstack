const db = require("../config/database");

exports.getAll = () => db.execute("SELECT * FROM cinema_brands ORDER BY brand_name");
exports.getById = (id) => db.execute("SELECT * FROM cinema_brands WHERE brand_id = ?", [id]);
exports.create = (brand_name, description, website, logo_url) =>
  db.execute(
    "INSERT INTO cinema_brands (brand_name, description, website, logo_url) VALUES (?, ?, ?, ?)",
    [brand_name, description, website, logo_url],
  );
exports.update = (id, brand_name, description, website, logo_url) =>
  db.execute(
    "UPDATE cinema_brands SET brand_name = ?, description = ?, website = ?, logo_url = ? WHERE brand_id = ?",
    [brand_name, description, website, logo_url, id],
  );
exports.delete = (id) => db.execute("DELETE FROM cinema_brands WHERE brand_id = ?", [id]);

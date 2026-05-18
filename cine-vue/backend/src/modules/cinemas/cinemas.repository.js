const db = require("../../shared/config/database");

exports.getAll = () =>
  db.execute(`
  SELECT c.*, b.brand_name, ci.city_name 
  FROM cinemas c 
  JOIN cinema_brands b ON c.brand_id = b.brand_id 
  JOIN cities ci ON c.city_id = ci.city_id 
  ORDER BY c.cinema_name
`);
exports.getById = (id) => db.execute("SELECT * FROM cinemas WHERE cinema_id = ?", [id]);
exports.create = (brand_id, cinema_name, city_id, address, phone) =>
  db.execute(
    "INSERT INTO cinemas (brand_id, cinema_name, city_id, address, phone) VALUES (?, ?, ?, ?, ?)",
    [brand_id, cinema_name, city_id, address, phone],
  );
exports.update = (id, brand_id, cinema_name, city_id, address, phone) =>
  db.execute(
    "UPDATE cinemas SET brand_id = ?, cinema_name = ?, city_id = ?, address = ?, phone = ? WHERE cinema_id = ?",
    [brand_id, cinema_name, city_id, address, phone, id],
  );
exports.delete = (id) => db.execute("DELETE FROM cinemas WHERE cinema_id = ?", [id]);

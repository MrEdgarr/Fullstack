const db = require("../config/database");

exports.getAll = () => db.execute("SELECT * FROM cities ORDER BY city_name");
exports.getById = (id) => db.execute("SELECT * FROM cities WHERE city_id = ?", [id]);
exports.create = (city_name, country, province_code) =>
  db.execute("INSERT INTO cities (city_name, country, province_code) VALUES (?, ?, ?)", [
    city_name,
    country,
    province_code,
  ]);
exports.update = (id, city_name, country, province_code) =>
  db.execute("UPDATE cities SET city_name = ?, country = ?, province_code = ? WHERE city_id = ?", [
    city_name,
    country,
    province_code,
    id,
  ]);
exports.delete = (id) => db.execute("DELETE FROM cities WHERE city_id = ?", [id]);

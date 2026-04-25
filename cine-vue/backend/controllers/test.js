const db = require("../config/database");

exports.getAllCinemas = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT c.*, b.brand_name, ci.city_name 
      FROM cinemas c
      JOIN cinema_brands b ON c.brand_id = b.brand_id
      JOIN cities ci ON c.city_id = ci.city_id
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

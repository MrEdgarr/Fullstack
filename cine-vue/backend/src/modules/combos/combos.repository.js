import db from "../../shared/config/database.js";

export const getActive = () =>
  db.execute(
    `
    SELECT food_combo_id, cinema_id, combo_name, description, image_url, price
    FROM food_combos
    WHERE status = 'active'
    ORDER BY combo_name
    `,
  );

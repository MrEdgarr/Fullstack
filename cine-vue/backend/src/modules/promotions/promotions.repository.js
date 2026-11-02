import db from "../../shared/config/database.js";

export const getActiveByCode = (code) =>
  db.execute(
    `
    SELECT *
    FROM promotions
    WHERE code = ?
      AND status = 'active'
      AND starts_at <= NOW()
      AND ends_at >= NOW()
    `,
    [code],
  );

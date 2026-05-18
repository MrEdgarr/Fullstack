const db = require("../../shared/config/database");

exports.getActiveByCode = (code) =>
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

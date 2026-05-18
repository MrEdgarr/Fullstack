//.env

const fs = require("fs");
const mysql = require("mysql2");

const ssl =
  process.env.DB_SSL_CA_BASE64
    ? {
        ca: Buffer.from(process.env.DB_SSL_CA_BASE64, "base64").toString("utf8"),
      }
    : process.env.DB_SSL_CA_PATH
      ? {
          ca: fs.readFileSync(process.env.DB_SSL_CA_PATH, "utf8"),
        }
      : undefined;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DBNAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: process.env.DB_TIMEZONE || "Z",
  ...(ssl && { ssl }),
});

pool.getConnection((err, conn) => {
  if (err) {
    console.error("Database connection failed:", err.message);
    return;
  }

  console.log("Database connected successfully");
  conn.release();
});

module.exports = pool.promise();

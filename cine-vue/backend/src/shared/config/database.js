const mysql = require("mysql2");
const { getDatabaseConfig } = require("./database-env");

const databaseConfig = getDatabaseConfig();

const pool = mysql.createPool({
  host: databaseConfig.host,
  port: databaseConfig.port,
  user: databaseConfig.user,
  password: databaseConfig.password,
  database: databaseConfig.database,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 2,
  maxIdle: 2,
  idleTimeout: 30000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  queueLimit: 0,
  timezone: databaseConfig.timezone,
  ...(databaseConfig.ssl && { ssl: databaseConfig.ssl }),
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

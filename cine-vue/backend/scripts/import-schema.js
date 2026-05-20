require("dotenv").config({ quiet: true });

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const requiredEnvVars = [
  "DB_HOST",
  "DB_PORT",
  "DB_USERNAME",
  "DB_PASSWORD",
  "DB_DBNAME",
];

const missingEnvVars = requiredEnvVars.filter((name) => !process.env[name]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
  process.exit(1);
}

const schemaPath = path.join(__dirname, "../sql/lean_ticketing_schema.mysql.sql");

if (!fs.existsSync(schemaPath)) {
  console.error(`Schema file not found: ${schemaPath}`);
  process.exit(1);
}

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

async function importSchema() {
  const sql = fs.readFileSync(schemaPath, "utf8");

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DBNAME,
    timezone: process.env.DB_TIMEZONE || "Z",
    multipleStatements: true,
    ...(ssl && { ssl }),
  });

  try {
    await connection.query(sql);
    console.log(
      `Schema imported successfully into database "${process.env.DB_DBNAME}" on "${process.env.DB_HOST}".`,
    );
  } finally {
    await connection.end();
  }
}

importSchema().catch((error) => {
  console.error("Schema import failed:", error.message);
  process.exit(1);
});

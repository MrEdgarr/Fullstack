const fs = require("fs");

function hasEnv(name) {
  return Object.prototype.hasOwnProperty.call(process.env, name);
}

function pickEnv(names, { allowEmpty = false } = {}) {
  for (const name of names) {
    if (!hasEnv(name)) continue;
    const value = process.env[name];

    if (allowEmpty || value !== "") {
      return value;
    }
  }

  return undefined;
}

function getSslConfig() {
  if (process.env.DB_SSL_CA_BASE64) {
    return {
      ca: Buffer.from(process.env.DB_SSL_CA_BASE64, "base64").toString("utf8"),
    };
  }

  if (process.env.DB_SSL_CA_PATH) {
    return {
      ca: fs.readFileSync(process.env.DB_SSL_CA_PATH, "utf8"),
    };
  }

  return undefined;
}

function getDatabaseConfig() {
  const config = {
    host: pickEnv(["DB_HOST", "MYSQL_ADDON_HOST"]),
    port: Number(pickEnv(["DB_PORT", "MYSQL_ADDON_PORT"]) || 3306),
    user: pickEnv(["DB_USERNAME", "MYSQL_ADDON_USER"]),
    password: pickEnv(["DB_PASSWORD", "MYSQL_ADDON_PASSWORD"], { allowEmpty: true }),
    database: pickEnv(["DB_DBNAME", "MYSQL_ADDON_DB"]),
    timezone: process.env.DB_TIMEZONE || "Z",
  };

  const ssl = getSslConfig();
  if (ssl) config.ssl = ssl;

  return config;
}

module.exports = {
  getDatabaseConfig,
};

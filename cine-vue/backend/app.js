const express = require("express");
const logger = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

require("dotenv").config();

const indexRouter = require("./src/routes");
const errorHandler = require("./src/shared/middleware/error-handler");

const app = express();
const allowedOrigins = (process.env.FRONTEND_URLS ||
  "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/v1", limiter, indexRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Not Found",
  });
});

app.use(errorHandler);

module.exports = app;

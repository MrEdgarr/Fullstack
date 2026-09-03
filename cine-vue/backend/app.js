const express = require("express");
const logger = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

require("dotenv").config({ quiet: true });

const indexRouter = require("./src/routes");
const errorHandler = require("./src/shared/middleware/error-handler");
const { expireStaleHolds } = require("./src/modules/bookings/booking-maintenance.service");

// Định kỳ quét dọn ghế quá hạn giữ chỗ mỗi 60 giây
const holdCleanupTimer = setInterval(() => {
  expireStaleHolds().catch((err) => {
    console.error("Background hold cleanup error:", err.message);
  });
}, 60 * 1000);
if (holdCleanupTimer.unref) holdCleanupTimer.unref();

const app = express();
const allowedOrigins = (process.env.FRONTEND_URLS ||
  "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  // Allow all Vercel deployments (*.vercel.app)
  if (/^https:\/\/.*\.vercel\.app$/.test(origin)) return true;
  return false;
};

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin(origin, callback) {
      if (isOriginAllowed(origin)) {
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

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Cine Vue Backend API is running",
    api: "/api/v1",
  });
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

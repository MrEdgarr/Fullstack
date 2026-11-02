import "dotenv/config";
import express from "express";
import logger from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";

import indexRouter from "./src/routes/index.js";
import errorHandler from "./src/shared/middleware/error-handler.js";

const app = express();
const allowedOrigins = (
  process.env.FRONTEND_URLS || "http://localhost:5173,http://127.0.0.1:5173"
)
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

export default app;

import express from "express";
import * as dashboardController from "./dashboard.controller.js";
import authMiddleware from "../../shared/middleware/auth.js";
import requireRole from "../../shared/middleware/role.js";

const router = express.Router();
const adminOnly = requireRole(["admin"]);

router.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    if (process.env.NODE_ENV === "development") {
      req.user = { customer_id: 1, role: "admin" };
      return next();
    }
  }
  return authMiddleware(req, res, () => adminOnly(req, res, next));
});

router.get("/overview", dashboardController.getOverview);
router.get("/summary", dashboardController.getSummary);
router.get("/revenue-trend", dashboardController.getRevenueTrend);
router.get("/top-movies", dashboardController.getTopMovies);
router.get("/revenue-distribution", dashboardController.getRevenueDistribution);
router.get("/recent-bookings", dashboardController.getRecentBookings);

export default router;

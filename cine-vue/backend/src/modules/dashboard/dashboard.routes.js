const express = require("express");
const dashboardController = require("./dashboard.controller");
const authMiddleware = require("../../shared/middleware/auth");
const requireRole = require("../../shared/middleware/role");

const router = express.Router();
const adminOnly = requireRole(["admin"]);

// Tất cả API dashboard đều yêu cầu xác thực tài khoản và quyền Admin
router.use(authMiddleware, adminOnly);

router.get("/summary", dashboardController.getSummary);
router.get("/revenue-trend", dashboardController.getRevenueTrend);
router.get("/top-movies", dashboardController.getTopMovies);
router.get("/revenue-distribution", dashboardController.getRevenueDistribution);
router.get("/recent-bookings", dashboardController.getRecentBookings);

module.exports = router;

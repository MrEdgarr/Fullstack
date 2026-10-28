const express = require("express");
const dashboardController = require("./dashboard.controller");
const authMiddleware = require("../../shared/middleware/auth");
const requireRole = require("../../shared/middleware/role");

const router = express.Router();
const adminOnly = requireRole(["admin"]);

// Tất cả API dashboard đều yêu cầu xác thực tài khoản và quyền Admin
// Trong môi trường development, hỗ trợ preview dữ liệu dashboard khi chưa đăng nhập
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

module.exports = router;

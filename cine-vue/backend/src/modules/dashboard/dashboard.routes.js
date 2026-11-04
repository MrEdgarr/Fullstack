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

router.get("/admin-state", dashboardController.getAdminState);

router.post("/chains/sync", dashboardController.syncAllChains);
router.post("/chains/:chainId/ping", dashboardController.pingChain);
router.patch("/chains/:chainId/commission", dashboardController.updateChainCommission);

router.patch("/multiplexes/:multiplexId/toggle-status", dashboardController.toggleMultiplexStatus);

router.get("/showtimes/:showtimeId/seats", dashboardController.getShowtimeSeatMap);
router.patch(
  "/showtimes/:showtimeId/seats/:seatCode/toggle-block",
  dashboardController.toggleShowtimeSeatBlock,
);
router.patch(
  "/showtimes/:showtimeId/seats/:seatCode/release",
  dashboardController.releaseHeldSeat,
);

router.post("/movies", dashboardController.createMovie);
router.put("/movies/:movieId", dashboardController.updateMovie);
router.patch("/movies/:movieId/status", dashboardController.updateMovieStatus);
router.delete("/movies/:movieId", dashboardController.deleteMovie);

router.post("/orders/:orderId/resync", dashboardController.resyncOrder);
router.post("/orders/:orderId/refund", dashboardController.refundOrder);

router.post("/promotions", dashboardController.createPromotion);

router.patch("/settlements/:settlementId/approve", dashboardController.approveSettlement);

export default router;

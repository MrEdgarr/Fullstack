const dashboardService = require("./dashboard.service");

exports.getSummary = async (req, res, next) => {
  try {
    const period = req.query.period || "7d";
    const data = await dashboardService.getSummary(period);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getRevenueTrend = async (req, res, next) => {
  try {
    const period = req.query.period || "7d";
    const data = await dashboardService.getRevenueTrend(period);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getTopMovies = async (req, res, next) => {
  try {
    const period = req.query.period || "7d";
    const limit = req.query.limit || 5;
    const data = await dashboardService.getTopMovies(period, limit);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getRevenueDistribution = async (req, res, next) => {
  try {
    const period = req.query.period || "7d";
    const data = await dashboardService.getRevenueDistribution(period);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getRecentBookings = async (req, res, next) => {
  try {
    const limit = req.query.limit || 8;
    const data = await dashboardService.getRecentBookings(limit);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getOverview = async (req, res, next) => {
  try {
    const period = req.query.period || "7d";
    const data = await dashboardService.getOverview(period);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};


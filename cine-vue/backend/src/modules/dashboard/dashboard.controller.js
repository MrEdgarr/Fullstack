import * as dashboardService from "./dashboard.service.js";

export const getSummary = async (req, res, next) => {
  try {
    const period = req.query.period || "7d";
    const data = await dashboardService.getSummary(period);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getRevenueTrend = async (req, res, next) => {
  try {
    const period = req.query.period || "7d";
    const data = await dashboardService.getRevenueTrend(period);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getTopMovies = async (req, res, next) => {
  try {
    const period = req.query.period || "7d";
    const limit = req.query.limit || 5;
    const data = await dashboardService.getTopMovies(period, limit);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getRevenueDistribution = async (req, res, next) => {
  try {
    const period = req.query.period || "7d";
    const data = await dashboardService.getRevenueDistribution(period);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getRecentBookings = async (req, res, next) => {
  try {
    const limit = req.query.limit || 8;
    const period = req.query.period || "all";
    const data = await dashboardService.getRecentBookings(limit, period);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getOverview = async (req, res, next) => {
  try {
    const period = req.query.period || "7d";
    const data = await dashboardService.getOverview(period);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

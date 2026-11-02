import * as dashboardService from "./dashboard.service.js";

export const getSummary = async (req, res, next) => {
  try {
    const period = req.query.period || "7d";
    const brandId = req.query.brand_id || null;
    const data = await dashboardService.getSummary(period, brandId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getRevenueTrend = async (req, res, next) => {
  try {
    const period = req.query.period || "7d";
    const brandId = req.query.brand_id || null;
    const data = await dashboardService.getRevenueTrend(period, brandId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getTopMovies = async (req, res, next) => {
  try {
    const period = req.query.period || "7d";
    const limit = req.query.limit || 5;
    const brandId = req.query.brand_id || null;
    const data = await dashboardService.getTopMovies(period, limit, brandId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getRevenueDistribution = async (req, res, next) => {
  try {
    const period = req.query.period || "7d";
    const brandId = req.query.brand_id || null;
    const data = await dashboardService.getRevenueDistribution(period, brandId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getRecentBookings = async (req, res, next) => {
  try {
    const limit = req.query.limit || 8;
    const period = req.query.period || "all";
    const brandId = req.query.brand_id || null;
    const data = await dashboardService.getRecentBookings(limit, period, brandId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getOverview = async (req, res, next) => {
  try {
    const period = req.query.period || "7d";
    const brandId = req.query.brand_id || null;
    const data = await dashboardService.getOverview(period, brandId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

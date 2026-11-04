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

export const getAdminState = async (req, res, next) => {
  try {
    const data = await dashboardService.getAdminAggregatorState();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const syncAllChains = async (req, res, next) => {
  try {
    const data = await dashboardService.syncAllChains();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const pingChain = async (req, res, next) => {
  try {
    const data = await dashboardService.pingChain(req.params.chainId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateChainCommission = async (req, res, next) => {
  try {
    const data = await dashboardService.updateChainCommission(
      req.params.chainId,
      req.body.commissionRate,
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const toggleMultiplexStatus = async (req, res, next) => {
  try {
    const data = await dashboardService.toggleMultiplexStatus(req.params.multiplexId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getShowtimeSeatMap = async (req, res, next) => {
  try {
    const data = await dashboardService.getShowtimeSeatMap(req.params.showtimeId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const toggleShowtimeSeatBlock = async (req, res, next) => {
  try {
    const data = await dashboardService.toggleShowtimeSeatBlock(
      req.params.showtimeId,
      req.params.seatCode,
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const releaseHeldSeat = async (req, res, next) => {
  try {
    const data = await dashboardService.releaseHeldSeat(
      req.params.showtimeId,
      req.params.seatCode,
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createMovie = async (req, res, next) => {
  try {
    const data = await dashboardService.createMovie(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateMovie = async (req, res, next) => {
  try {
    const data = await dashboardService.updateMovie(req.params.movieId, req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateMovieStatus = async (req, res, next) => {
  try {
    const data = await dashboardService.updateMovieStatus(
      req.params.movieId,
      req.body.status,
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const deleteMovie = async (req, res, next) => {
  try {
    const data = await dashboardService.deleteMovie(req.params.movieId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const resyncOrder = async (req, res, next) => {
  try {
    const data = await dashboardService.resyncOrder(req.params.orderId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const refundOrder = async (req, res, next) => {
  try {
    const data = await dashboardService.refundOrder(req.params.orderId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createPromotion = async (req, res, next) => {
  try {
    const data = await dashboardService.createPromotion(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const approveSettlement = async (req, res, next) => {
  try {
    const data = await dashboardService.approveSettlement(req.params.settlementId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

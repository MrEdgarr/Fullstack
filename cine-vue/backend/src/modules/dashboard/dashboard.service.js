import * as dashboardRepository from "./dashboard.repository.js";

// Tỷ lệ chiết khấu hoa hồng trung gian theo từng đối tác (mặc định 8%)
const PARTNER_COMMISSION_RATES = {
  1: 8.0, // CGV Cinemas
  2: 8.5, // Lotte Cinema
  3: 9.0, // Galaxy Cinema
  4: 8.0, // BHD Star Cineplex
  5: 10.0, // CineStar
};
const DEFAULT_COMMISSION_RATE = 8.0;

export function getBrandCommissionRate(brandId) {
  return PARTNER_COMMISSION_RATES[Number(brandId)] ?? DEFAULT_COMMISSION_RATE;
}

/**
 * Tính phần trăm tăng/giảm so với kỳ trước
 */
function calculateGrowth(current, previous) {
  const curr = Number(current || 0);
  const prev = Number(previous || 0);

  if (prev === 0) {
    return curr > 0 ? 100 : 0;
  }
  return Number((((curr - prev) / prev) * 100).toFixed(1));
}

/**
 * 1. Tổng hợp chỉ số KPI cards
 */
export const getSummary = async (period = "7d", brandId = null) => {
  const currentCondition = dashboardRepository.buildDateCondition(period, "b");
  const previousCondition = dashboardRepository.buildPreviousDateCondition(period, "b");

  // Fetch song song các metrics cho kỳ hiện tại
  const [currentBookings, currentTickets, currentFnb, occupancy] = await Promise.all([
    dashboardRepository.getBookingMetrics(currentCondition, brandId),
    dashboardRepository.getTicketMetrics(currentCondition, brandId),
    dashboardRepository.getFnbMetrics(currentCondition, brandId),
    dashboardRepository.getOccupancyRate(currentCondition, brandId),
  ]);

  // Nếu có kỳ so sánh trước đó, fetch để tính % tăng trưởng
  let previousBookings = null;
  let previousTickets = null;

  if (previousCondition) {
    [previousBookings, previousTickets] = await Promise.all([
      dashboardRepository.getBookingMetrics(previousCondition, brandId),
      dashboardRepository.getTicketMetrics(previousCondition, brandId),
    ]);
  }

  const totalRevenue = Number(currentBookings.total_revenue || 0);
  const totalFnb = Number(currentFnb.total_fnb || 0);
  const totalTickets = Number(currentTickets.total_tickets || 0);
  const fnbRatio = totalRevenue > 0 ? Number(((totalFnb / totalRevenue) * 100).toFixed(1)) : 0;

  const commissionRate = brandId ? getBrandCommissionRate(brandId) : DEFAULT_COMMISSION_RATE;
  const platformCommission = Math.round((totalRevenue * commissionRate) / 100);
  const partnerPayout = Math.max(totalRevenue - platformCommission, 0);

  return {
    period,
    brand_id: brandId ? Number(brandId) : null,
    revenue: {
      total: totalRevenue,
      platform_commission: platformCommission,
      partner_payout: partnerPayout,
      commission_rate: commissionRate,
      growth_percentage: previousBookings
        ? calculateGrowth(totalRevenue, previousBookings.total_revenue)
        : 0,
    },
    tickets: {
      total: totalTickets,
      growth_percentage: previousTickets
        ? calculateGrowth(totalTickets, previousTickets.total_tickets)
        : 0,
      ticket_revenue: Number(currentTickets.ticket_revenue || 0),
    },
    fnb: {
      total: totalFnb,
      total_items: Number(currentFnb.total_items || 0),
      revenue_ratio: fnbRatio,
    },
    orders: {
      total: Number(currentBookings.total_bookings || 0),
      successful: Number(currentBookings.successful_bookings || 0),
      confirmed: Number(currentBookings.confirmed_bookings || 0),
      completed: Number(currentBookings.completed_bookings || 0),
      cancelled: Number(currentBookings.cancelled_bookings || 0),
      pending: Number(currentBookings.pending_bookings || 0),
      growth_percentage: previousBookings
        ? calculateGrowth(currentBookings.total_bookings, previousBookings.total_bookings)
        : 0,
      success_rate:
        Number(currentBookings.total_bookings || 0) > 0
          ? Number(
              (
                (Number(currentBookings.successful_bookings || 0) /
                  Number(currentBookings.total_bookings)) *
                100
              ).toFixed(1),
            )
          : 0,
    },
    occupancy: {
      rate: Number(occupancy.occupancy_rate || 0),
      tickets_sold: Number(occupancy.tickets_sold || 0),
      total_capacity: Number(occupancy.total_capacity || 0),
      growth_percentage: previousTickets
        ? calculateGrowth(occupancy.tickets_sold, previousTickets.total_tickets)
        : 0,
    },
  };
};

/**
 * 2. Xu hướng doanh thu theo thời gian
 */
export const getRevenueTrend = async (period = "7d", brandId = null) => {
  const rows = await dashboardRepository.getRevenueTrend(period, brandId);
  return rows.map((row) => ({
    date: row.date_label,
    total_orders: Number(row.total_orders || 0),
    subtotal_amount: Number(row.subtotal_amount || 0),
    discount_amount: Number(row.discount_amount || 0),
    total_revenue: Number(row.total_revenue || 0),
  }));
};

/**
 * 3. Top phim có doanh thu cao nhất
 */
export const getTopMovies = async (period = "7d", limit = 5, brandId = null) => {
  const rows = await dashboardRepository.getTopMovies(period, limit, brandId);
  return rows.map((movie) => ({
    movie_id: movie.movie_id,
    title: movie.title,
    poster_url: movie.poster_url,
    duration_minutes: movie.duration_minutes,
    tickets_sold: Number(movie.tickets_sold || 0),
    total_orders: Number(movie.total_orders || 0),
    ticket_revenue: Number(movie.ticket_revenue || 0),
  }));
};

/**
 * 4. Cơ cấu phân bổ nguồn thu
 */
export const getRevenueDistribution = async (period = "7d", brandId = null) => {
  const { seatTypes, cinemas } = await dashboardRepository.getRevenueDistribution(period, brandId);

  return {
    seat_types: seatTypes.map((st) => ({
      type: st.seat_type,
      tickets_count: Number(st.tickets_count || 0),
      revenue: Number(st.revenue || 0),
    })),
    cinemas: cinemas.map((c) => ({
      cinema_id: c.cinema_id,
      cinema_name: c.cinema_name,
      brand_id: c.brand_id,
      brand_name: c.brand_name,
      total_orders: Number(c.total_orders || 0),
      total_revenue: Number(c.total_revenue || 0),
    })),
  };
};

/**
 * 5. Danh sách giao dịch mới nhất
 */
export const getRecentBookings = async (limit = 8, period = "all", brandId = null) => {
  const rows = await dashboardRepository.getRecentBookings(limit, period, brandId);
  return rows.map((booking) => ({
    ...booking,
    final_amount: Number(booking.final_amount || 0),
  }));
};

/**
 * 6. Danh sách đối soát & hiệu suất các thương hiệu rạp hợp tác
 */
export const getPartnerBrands = async (period = "all") => {
  const rows = await dashboardRepository.getPartnerBrandsMetrics(period);
  const totalSystemGmv = rows.reduce((sum, r) => sum + Number(r.gross_revenue || 0), 0);

  return rows.map((brand) => {
    const grossRevenue = Number(brand.gross_revenue || 0);
    const commissionRate = getBrandCommissionRate(brand.brand_id);
    const platformCommission = Math.round((grossRevenue * commissionRate) / 100);
    const partnerPayout = Math.max(grossRevenue - platformCommission, 0);
    const revenueShare =
      totalSystemGmv > 0 ? Number(((grossRevenue / totalSystemGmv) * 100).toFixed(1)) : 0;

    return {
      brand_id: Number(brand.brand_id),
      brand_name: brand.brand_name,
      logo_url: brand.logo_url,
      status: brand.status || "active",
      cinemas_count: Number(brand.cinemas_count || 0),
      rooms_count: Number(brand.rooms_count || 0),
      total_orders: Number(brand.total_orders || 0),
      successful_orders: Number(brand.successful_orders || 0),
      tickets_sold: Number(brand.tickets_sold || 0),
      gross_revenue: grossRevenue,
      commission_rate: commissionRate,
      platform_commission: platformCommission,
      partner_payout: partnerPayout,
      revenue_share: revenueShare,
    };
  });
};

/**
 * 7. Tổng hợp toàn bộ dữ liệu dashboard trong 1 lần gọi (tiết kiệm kết nối và network roundtrips)
 */
export const getOverview = async (period = "7d", brandId = null) => {
  const [summary, revenueTrend, topMovies, distribution, recentBookings, partnerBrands] =
    await Promise.all([
      getSummary(period, brandId),
      getRevenueTrend(period, brandId),
      getTopMovies(period, 5, brandId),
      getRevenueDistribution(period, brandId),
      getRecentBookings(8, period, brandId),
      getPartnerBrands(period),
    ]);

  // Nếu đang xem toàn hệ thống (không lọc theo 1 brand cụ thể), tổng hoa hồng chính xác bằng tổng hoa hồng các rạp
  if (!brandId && partnerBrands.length > 0) {
    const totalCommission = partnerBrands.reduce((sum, b) => sum + b.platform_commission, 0);
    const totalPayout = partnerBrands.reduce((sum, b) => sum + b.partner_payout, 0);
    summary.revenue.platform_commission = totalCommission;
    summary.revenue.partner_payout = totalPayout;
  }

  summary.partners = {
    total_brands: partnerBrands.length,
    active_brands: partnerBrands.filter((b) => b.status === "active").length,
    total_cinemas: partnerBrands.reduce((sum, b) => sum + b.cinemas_count, 0),
  };

  return {
    summary,
    revenueTrend,
    topMovies,
    distribution,
    recentBookings,
    partnerBrands,
  };
};

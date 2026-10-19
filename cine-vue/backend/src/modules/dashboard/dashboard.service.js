const dashboardRepository = require("./dashboard.repository");

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
exports.getSummary = async (period = "7d") => {
  const currentCondition = dashboardRepository.buildDateCondition(period, "b");
  const previousCondition = dashboardRepository.buildPreviousDateCondition(period, "b");

  // Fetch song song các metrics cho kỳ hiện tại
  const [currentBookings, currentTickets, currentFnb, occupancy] = await Promise.all([
    dashboardRepository.getBookingMetrics(currentCondition),
    dashboardRepository.getTicketMetrics(currentCondition),
    dashboardRepository.getFnbMetrics(currentCondition),
    dashboardRepository.getOccupancyRate(currentCondition),
  ]);

  // Nếu có kỳ so sánh trước đó, fetch để tính % tăng trưởng
  let previousBookings = null;
  let previousTickets = null;

  if (previousCondition) {
    [previousBookings, previousTickets] = await Promise.all([
      dashboardRepository.getBookingMetrics(previousCondition),
      dashboardRepository.getTicketMetrics(previousCondition),
    ]);
  }

  const totalRevenue = Number(currentBookings.total_revenue || 0);
  const totalFnb = Number(currentFnb.total_fnb || 0);
  const totalTickets = Number(currentTickets.total_tickets || 0);
  const fnbRatio = totalRevenue > 0 ? Number(((totalFnb / totalRevenue) * 100).toFixed(1)) : 0;

  return {
    period,
    revenue: {
      total: totalRevenue,
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
      cancelled: Number(currentBookings.cancelled_bookings || 0),
      pending: Number(currentBookings.pending_bookings || 0),
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
    },
  };
};

/**
 * 2. Xu hướng doanh thu theo thời gian
 */
exports.getRevenueTrend = async (period = "7d") => {
  const rows = await dashboardRepository.getRevenueTrend(period);
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
exports.getTopMovies = async (period = "7d", limit = 5) => {
  const rows = await dashboardRepository.getTopMovies(period, limit);
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
exports.getRevenueDistribution = async (period = "7d") => {
  const { seatTypes, cinemas } = await dashboardRepository.getRevenueDistribution(period);

  return {
    seat_types: seatTypes.map((st) => ({
      type: st.seat_type,
      tickets_count: Number(st.tickets_count || 0),
      revenue: Number(st.revenue || 0),
    })),
    cinemas: cinemas.map((c) => ({
      cinema_id: c.cinema_id,
      cinema_name: c.cinema_name,
      total_orders: Number(c.total_orders || 0),
      total_revenue: Number(c.total_revenue || 0),
    })),
  };
};

/**
 * 5. Danh sách giao dịch mới nhất
 */
exports.getRecentBookings = async (limit = 8) => {
  const rows = await dashboardRepository.getRecentBookings(limit);
  return rows.map((booking) => ({
    ...booking,
    final_amount: Number(booking.final_amount || 0),
  }));
};

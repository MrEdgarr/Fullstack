const db = require("../../shared/config/database");

/**
 * Tạo mệnh đề WHERE theo khoảng thời gian cho bảng bookings
 */
function buildDateCondition(period, alias = "b") {
  switch (period) {
    case "today":
      return `${alias}.created_at >= CURDATE()`;
    case "7d":
      return `${alias}.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
    case "30d":
      return `${alias}.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`;
    case "this_month":
      return `${alias}.created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')`;
    case "6m":
      return `${alias}.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)`;
    case "1y":
    case "year":
      return `${alias}.created_at >= DATE_FORMAT(NOW(), '%Y-01-01')`;
    case "all":
    default:
      return "1=1";
  }
}

/**
 * Tạo mệnh đề WHERE cho kỳ trước đó để so sánh tăng trưởng
 */
function buildPreviousDateCondition(period, alias = "b") {
  switch (period) {
    case "today":
      return `${alias}.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND ${alias}.created_at < CURDATE()`;
    case "7d":
      return `${alias}.created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY) AND ${alias}.created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)`;
    case "30d":
      return `${alias}.created_at >= DATE_SUB(NOW(), INTERVAL 60 DAY) AND ${alias}.created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)`;
    case "this_month":
      return `${alias}.created_at >= DATE_SUB(DATE_FORMAT(NOW(), '%Y-%m-01'), INTERVAL 1 MONTH) AND ${alias}.created_at < DATE_FORMAT(NOW(), '%Y-%m-01')`;
    case "6m":
      return `${alias}.created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH) AND ${alias}.created_at < DATE_SUB(NOW(), INTERVAL 6 MONTH)`;
    case "1y":
    case "year":
      return `${alias}.created_at >= DATE_SUB(DATE_FORMAT(NOW(), '%Y-01-01'), INTERVAL 1 YEAR) AND ${alias}.created_at < DATE_FORMAT(NOW(), '%Y-01-01')`;
    case "all":
    default:
      return null;
  }
}

/**
 * 1. Lấy chỉ số tổng quan đơn hàng & doanh thu
 */
exports.getBookingMetrics = async (condition) => {
  const [rows] = await db.execute(`
    SELECT
      COUNT(b.booking_id) AS total_bookings,
      COUNT(CASE WHEN b.status IN ('confirmed', 'completed') THEN 1 END) AS successful_bookings,
      COUNT(CASE WHEN b.status = 'cancelled' THEN 1 END) AS cancelled_bookings,
      COUNT(CASE WHEN b.status = 'pending' THEN 1 END) AS pending_bookings,
      COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN b.final_amount ELSE 0 END), 0) AS total_revenue,
      COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN b.discount_amount ELSE 0 END), 0) AS total_discount
    FROM bookings b
    WHERE ${condition}
  `);
  return rows[0];
};

/**
 * 2. Lấy chỉ số vé bán ra
 */
exports.getTicketMetrics = async (condition) => {
  const [rows] = await db.execute(`
    SELECT
      COUNT(t.ticket_id) AS total_tickets,
      COALESCE(SUM(t.actual_price), 0) AS ticket_revenue
    FROM tickets t
    JOIN bookings b ON b.booking_id = t.booking_id
    WHERE b.status IN ('confirmed', 'completed')
      AND ${condition}
  `);
  return rows[0];
};

/**
 * 3. Lấy chỉ số Bắp nước (F&B)
 */
exports.getFnbMetrics = async (condition) => {
  const [rows] = await db.execute(`
    SELECT
      COALESCE(SUM(bfc.line_total), 0) AS total_fnb,
      COALESCE(SUM(bfc.quantity), 0) AS total_items
    FROM booking_food_combos bfc
    JOIN bookings b ON b.booking_id = bfc.booking_id
    WHERE b.status IN ('confirmed', 'completed')
      AND ${condition}
  `);
  return rows[0];
};

/**
 * 4. Lấy tỷ lệ lấp đầy ghế (Occupancy rate)
 */
exports.getOccupancyRate = async (condition) => {
  const [rows] = await db.execute(`
    SELECT
      COUNT(t.ticket_id) AS tickets_sold,
      (COUNT(DISTINCT s.showtime_id) * 60) AS total_capacity,
      ROUND(COUNT(t.ticket_id) * 100.0 / NULLIF(COUNT(DISTINCT s.showtime_id) * 60, 0), 2) AS occupancy_rate
    FROM showtimes s
    LEFT JOIN bookings b ON b.showtime_id = s.showtime_id AND b.status IN ('confirmed', 'completed') AND ${condition}
    LEFT JOIN tickets t ON t.booking_id = b.booking_id
    WHERE s.start_time <= NOW()
  `);
  return rows[0];
};

/**
 * 5. Lấy xu hướng doanh thu theo thời gian
 */
exports.getRevenueTrend = async (period) => {
  const condition = buildDateCondition(period, "b");
  const dateFormat = period === "year" ? "%Y-%m" : "%Y-%m-%d";

  const [rows] = await db.execute(`
    SELECT
      DATE_FORMAT(b.created_at, '${dateFormat}') AS date_label,
      COUNT(b.booking_id) AS total_orders,
      COALESCE(SUM(b.subtotal_amount), 0) AS subtotal_amount,
      COALESCE(SUM(b.discount_amount), 0) AS discount_amount,
      COALESCE(SUM(b.final_amount), 0) AS total_revenue
    FROM bookings b
    WHERE b.status IN ('confirmed', 'completed')
      AND ${condition}
    GROUP BY date_label
    ORDER BY date_label ASC
  `);
  return rows;
};

/**
 * 6. Lấy Top phim doanh thu cao nhất
 */
exports.getTopMovies = async (period, limit = 5) => {
  const condition = buildDateCondition(period, "b");
  const safeLimit = Math.max(1, Math.min(20, Number(limit) || 5));

  const [rows] = await db.query(
    `
    SELECT
      m.movie_id,
      m.title,
      m.poster_url,
      m.duration_minutes,
      COUNT(DISTINCT t.ticket_id) AS tickets_sold,
      COUNT(DISTINCT b.booking_id) AS total_orders,
      COALESCE(SUM(t.actual_price), 0) AS ticket_revenue
    FROM movies m
    JOIN showtimes s ON s.movie_id = m.movie_id
    JOIN bookings b ON b.showtime_id = s.showtime_id AND b.status IN ('confirmed', 'completed')
    JOIN tickets t ON t.booking_id = b.booking_id
    WHERE ${condition}
    GROUP BY m.movie_id, m.title, m.poster_url, m.duration_minutes
    ORDER BY ticket_revenue DESC
    LIMIT ?
    `,
    [safeLimit],
  );
  return rows;
};

/**
 * 7. Lấy cơ cấu phân bổ doanh thu (Loại ghế, Nguồn thu, Cụm rạp)
 */
exports.getRevenueDistribution = async (period) => {
  const condition = buildDateCondition(period, "b");

  const [seatTypes] = await db.execute(`
    SELECT
      se.seat_type,
      COUNT(t.ticket_id) AS tickets_count,
      COALESCE(SUM(t.actual_price), 0) AS revenue
    FROM tickets t
    JOIN seats se ON se.seat_id = t.seat_id
    JOIN bookings b ON b.booking_id = t.booking_id
    WHERE b.status IN ('confirmed', 'completed')
      AND ${condition}
    GROUP BY se.seat_type
  `);

  const [cinemas] = await db.execute(`
    SELECT
      c.cinema_id,
      c.cinema_name,
      COUNT(b.booking_id) AS total_orders,
      COALESCE(SUM(b.final_amount), 0) AS total_revenue
    FROM cinemas c
    JOIN screening_rooms r ON r.cinema_id = c.cinema_id
    JOIN showtimes s ON s.room_id = r.room_id
    JOIN bookings b ON b.showtime_id = s.showtime_id AND b.status IN ('confirmed', 'completed')
    WHERE ${condition}
    GROUP BY c.cinema_id, c.cinema_name
    ORDER BY total_revenue DESC
    LIMIT 6
  `);

  return { seatTypes, cinemas };
};

/**
 * 8. Lấy danh sách giao dịch đặt vé gần đây nhất
 */
exports.getRecentBookings = async (limit = 8, period = "all") => {
  const safeLimit = Math.max(1, Math.min(50, Number(limit) || 8));
  const condition = buildDateCondition(period, "b");

  const [rows] = await db.query(
    `
    SELECT
      b.booking_id,
      b.booking_code,
      b.status,
      b.final_amount,
      b.created_at,
      c.full_name AS customer_name,
      c.email AS customer_email,
      m.title AS movie_title,
      ci.cinema_name,
      r.room_name,
      s.start_time,
      (
        SELECT GROUP_CONCAT(CONCAT(se.row_letter, se.seat_number) SEPARATOR ', ')
        FROM tickets t
        JOIN seats se ON se.seat_id = t.seat_id
        WHERE t.booking_id = b.booking_id
      ) AS seats_text
    FROM bookings b
    JOIN customers c ON c.customer_id = b.customer_id
    JOIN showtimes s ON s.showtime_id = b.showtime_id
    JOIN movies m ON m.movie_id = s.movie_id
    JOIN screening_rooms r ON r.room_id = s.room_id
    JOIN cinemas ci ON ci.cinema_id = r.cinema_id
    WHERE ${condition}
    ORDER BY b.created_at DESC
    LIMIT ?
    `,
    [safeLimit],
  );
  return rows;
};

exports.buildDateCondition = buildDateCondition;
exports.buildPreviousDateCondition = buildPreviousDateCondition;

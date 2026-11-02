import db from "../../shared/config/database.js";

export function buildDateCondition(period, alias = "b") {
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

export function buildPreviousDateCondition(period, alias = "b") {
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

export function buildBrandCondition(brandId, cinemaAlias = "c") {
  const parsed = Number(brandId);
  if (!parsed || Number.isNaN(parsed) || parsed <= 0) {
    return "1=1";
  }
  return `${cinemaAlias}.brand_id = ${parsed}`;
}

export const getBookingMetrics = async (condition, brandId = null) => {
  const brandCondition = buildBrandCondition(brandId, "c");
  const [rows] = await db.execute(`
    SELECT
      COUNT(b.booking_id) AS total_bookings,
      COUNT(CASE WHEN b.status IN ('confirmed', 'completed') THEN 1 END) AS successful_bookings,
      COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END) AS confirmed_bookings,
      COUNT(CASE WHEN b.status = 'completed' THEN 1 END) AS completed_bookings,
      COUNT(CASE WHEN b.status = 'cancelled' THEN 1 END) AS cancelled_bookings,
      COUNT(CASE WHEN b.status = 'pending' THEN 1 END) AS pending_bookings,
      COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN b.final_amount ELSE 0 END), 0) AS total_revenue,
      COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN b.discount_amount ELSE 0 END), 0) AS total_discount
    FROM bookings b
    JOIN showtimes s ON s.showtime_id = b.showtime_id
    JOIN screening_rooms r ON r.room_id = s.room_id
    JOIN cinemas c ON c.cinema_id = r.cinema_id
    WHERE ${condition}
      AND ${brandCondition}
  `);
  return rows[0];
};

export const getTicketMetrics = async (condition, brandId = null) => {
  const brandCondition = buildBrandCondition(brandId, "c");
  const [rows] = await db.execute(`
    SELECT
      COUNT(t.ticket_id) AS total_tickets,
      COALESCE(SUM(t.actual_price), 0) AS ticket_revenue
    FROM tickets t
    JOIN bookings b ON b.booking_id = t.booking_id
    JOIN showtimes s ON s.showtime_id = b.showtime_id
    JOIN screening_rooms r ON r.room_id = s.room_id
    JOIN cinemas c ON c.cinema_id = r.cinema_id
    WHERE b.status IN ('confirmed', 'completed')
      AND ${condition}
      AND ${brandCondition}
  `);
  return rows[0];
};

export const getFnbMetrics = async (condition, brandId = null) => {
  const brandCondition = buildBrandCondition(brandId, "c");
  const [rows] = await db.execute(`
    SELECT
      COALESCE(SUM(bfc.line_total), 0) AS total_fnb,
      COALESCE(SUM(bfc.quantity), 0) AS total_items
    FROM booking_food_combos bfc
    JOIN bookings b ON b.booking_id = bfc.booking_id
    JOIN showtimes s ON s.showtime_id = b.showtime_id
    JOIN screening_rooms r ON r.room_id = s.room_id
    JOIN cinemas c ON c.cinema_id = r.cinema_id
    WHERE b.status IN ('confirmed', 'completed')
      AND ${condition}
      AND ${brandCondition}
  `);
  return rows[0];
};

export const getOccupancyRate = async (condition, brandId = null) => {
  const brandCondition = buildBrandCondition(brandId, "c");
  const [rows] = await db.execute(`
    SELECT
      COUNT(t.ticket_id) AS tickets_sold,
      (COUNT(DISTINCT s.showtime_id) * 60) AS total_capacity,
      ROUND(COUNT(t.ticket_id) * 100.0 / NULLIF(COUNT(DISTINCT s.showtime_id) * 60, 0), 2) AS occupancy_rate
    FROM showtimes s
    JOIN screening_rooms r ON r.room_id = s.room_id
    JOIN cinemas c ON c.cinema_id = r.cinema_id
    LEFT JOIN bookings b ON b.showtime_id = s.showtime_id AND b.status IN ('confirmed', 'completed') AND ${condition}
    LEFT JOIN tickets t ON t.booking_id = b.booking_id
    WHERE s.start_time <= NOW()
      AND ${brandCondition}
  `);
  return rows[0];
};

export const getRevenueTrend = async (period, brandId = null) => {
  const condition = buildDateCondition(period, "b");
  const brandCondition = buildBrandCondition(brandId, "c");
  const dateFormat = period === "year" ? "%Y-%m" : "%Y-%m-%d";

  const [rows] = await db.execute(`
    SELECT
      DATE_FORMAT(b.created_at, '${dateFormat}') AS date_label,
      COUNT(b.booking_id) AS total_orders,
      COALESCE(SUM(b.subtotal_amount), 0) AS subtotal_amount,
      COALESCE(SUM(b.discount_amount), 0) AS discount_amount,
      COALESCE(SUM(b.final_amount), 0) AS total_revenue
    FROM bookings b
    JOIN showtimes s ON s.showtime_id = b.showtime_id
    JOIN screening_rooms r ON r.room_id = s.room_id
    JOIN cinemas c ON c.cinema_id = r.cinema_id
    WHERE b.status IN ('confirmed', 'completed')
      AND ${condition}
      AND ${brandCondition}
    GROUP BY date_label
    ORDER BY date_label ASC
  `);
  return rows;
};

export const getTopMovies = async (period, limit = 5, brandId = null) => {
  const condition = buildDateCondition(period, "b");
  const brandCondition = buildBrandCondition(brandId, "c");
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
    JOIN screening_rooms r ON r.room_id = s.room_id
    JOIN cinemas c ON c.cinema_id = r.cinema_id
    JOIN bookings b ON b.showtime_id = s.showtime_id AND b.status IN ('confirmed', 'completed')
    JOIN tickets t ON t.booking_id = b.booking_id
    WHERE ${condition}
      AND ${brandCondition}
    GROUP BY m.movie_id, m.title, m.poster_url, m.duration_minutes
    ORDER BY ticket_revenue DESC
    LIMIT ?
    `,
    [safeLimit],
  );
  return rows;
};

export const getRevenueDistribution = async (period, brandId = null) => {
  const condition = buildDateCondition(period, "b");
  const brandCondition = buildBrandCondition(brandId, "c");

  const [seatTypes] = await db.execute(`
    SELECT
      se.seat_type,
      COUNT(t.ticket_id) AS tickets_count,
      COALESCE(SUM(t.actual_price), 0) AS revenue
    FROM tickets t
    JOIN seats se ON se.seat_id = t.seat_id
    JOIN bookings b ON b.booking_id = t.booking_id
    JOIN showtimes s ON s.showtime_id = b.showtime_id
    JOIN screening_rooms r ON r.room_id = s.room_id
    JOIN cinemas c ON c.cinema_id = r.cinema_id
    WHERE b.status IN ('confirmed', 'completed')
      AND ${condition}
      AND ${brandCondition}
    GROUP BY se.seat_type
  `);

  const [cinemas] = await db.execute(`
    SELECT
      c.cinema_id,
      c.cinema_name,
      cb.brand_id,
      cb.brand_name,
      COUNT(DISTINCT b.booking_id) AS total_orders,
      COALESCE(SUM(b.final_amount), 0) AS total_revenue
    FROM cinemas c
    JOIN cinema_brands cb ON cb.brand_id = c.brand_id
    JOIN screening_rooms r ON r.cinema_id = c.cinema_id
    JOIN showtimes s ON s.room_id = r.room_id
    JOIN bookings b ON b.showtime_id = s.showtime_id AND b.status IN ('confirmed', 'completed')
    WHERE ${condition}
      AND ${brandCondition}
    GROUP BY c.cinema_id, c.cinema_name, cb.brand_id, cb.brand_name
    ORDER BY total_revenue DESC
    LIMIT 6
  `);

  return { seatTypes, cinemas };
};

export const getRecentBookings = async (limit = 8, period = "all", brandId = null) => {
  const safeLimit = Math.max(1, Math.min(50, Number(limit) || 8));
  const condition = buildDateCondition(period, "b");
  const brandCondition = buildBrandCondition(brandId, "ci");

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
      cb.brand_name,
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
    JOIN cinema_brands cb ON cb.brand_id = ci.brand_id
    WHERE ${condition}
      AND ${brandCondition}
    ORDER BY b.created_at DESC
    LIMIT ?
    `,
    [safeLimit],
  );
  return rows;
};

export const getPartnerBrandsMetrics = async (period = "all") => {
  const condition = buildDateCondition(period, "b");

  const [rows] = await db.execute(`
    SELECT
      cb.brand_id,
      cb.brand_name,
      cb.logo_url,
      cb.status,
      COUNT(DISTINCT c.cinema_id) AS cinemas_count,
      COUNT(DISTINCT r.room_id) AS rooms_count,
      COUNT(DISTINCT CASE WHEN b.status IN ('confirmed', 'completed') AND (${condition}) THEN b.booking_id END) AS successful_orders,
      COUNT(DISTINCT CASE WHEN (${condition}) THEN b.booking_id END) AS total_orders,
      COUNT(CASE WHEN b.status IN ('confirmed', 'completed') AND (${condition}) THEN t.ticket_id END) AS tickets_sold,
      COALESCE(
        SUM(
          CASE
            WHEN b.status IN ('confirmed', 'completed') AND (${condition}) THEN t.actual_price
            ELSE 0
          END
        ),
        0
      ) AS ticket_revenue
    FROM cinema_brands cb
    LEFT JOIN cinemas c ON c.brand_id = cb.brand_id AND c.status = 'active'
    LEFT JOIN screening_rooms r ON r.cinema_id = c.cinema_id AND r.status = 'active'
    LEFT JOIN showtimes s ON s.room_id = r.room_id
    LEFT JOIN bookings b ON b.showtime_id = s.showtime_id
    LEFT JOIN tickets t ON t.booking_id = b.booking_id
    GROUP BY cb.brand_id, cb.brand_name, cb.logo_url, cb.status
    ORDER BY ticket_revenue DESC, cinemas_count DESC, cb.brand_id ASC
  `);

  const [gmvRows] = await db.execute(`
    SELECT
      c.brand_id,
      COALESCE(SUM(b.final_amount), 0) AS gross_revenue
    FROM bookings b
    JOIN showtimes s ON s.showtime_id = b.showtime_id
    JOIN screening_rooms r ON r.room_id = s.room_id
    JOIN cinemas c ON c.cinema_id = r.cinema_id
    WHERE b.status IN ('confirmed', 'completed')
      AND ${condition}
    GROUP BY c.brand_id
  `);

  const gmvMap = new Map(gmvRows.map((item) => [Number(item.brand_id), Number(item.gross_revenue)]));

  return rows.map((row) => ({
    ...row,
    gross_revenue: gmvMap.get(Number(row.brand_id)) || 0,
  }));
};

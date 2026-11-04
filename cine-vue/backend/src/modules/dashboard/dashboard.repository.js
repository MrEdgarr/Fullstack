import db from "../../shared/config/database.js";

let schemaInitialized = false;

async function safeAlter(sql) {
  try {
    await db.execute(sql);
  } catch (err) {
    if (err.errno !== 1060 && err.errno !== 1061 && err.errno !== 1050) {
      // Ignore duplicate column / key / table errors
    }
  }
}

export async function ensureAdminSchema() {
  if (schemaInitialized) return;
  try {
    await safeAlter(`ALTER TABLE cinema_brands ADD COLUMN brand_code VARCHAR(20) DEFAULT NULL`);
    await safeAlter(`ALTER TABLE cinema_brands ADD COLUMN commission_rate DECIMAL(5, 2) NOT NULL DEFAULT 5.50`);
    await safeAlter(`ALTER TABLE cinema_brands ADD COLUMN settlement_cycle ENUM('daily', 't3', 'weekly', 'monthly') NOT NULL DEFAULT 't3'`);
    await safeAlter(`ALTER TABLE cinema_brands ADD COLUMN api_status ENUM('healthy', 'latency_warning', 'maintenance') NOT NULL DEFAULT 'healthy'`);
    await safeAlter(`ALTER TABLE cinema_brands ADD COLUMN latency_ms INT NOT NULL DEFAULT 45`);
    await safeAlter(`ALTER TABLE cinema_brands ADD COLUMN sync_protocol VARCHAR(150) DEFAULT 'REST Gateway v2.0'`);
    await safeAlter(`ALTER TABLE cinema_brands ADD COLUMN active_contract_until DATE DEFAULT '2027-12-31'`);
    await safeAlter(`ALTER TABLE cinema_brands ADD COLUMN co_funding_promos TINYINT(1) NOT NULL DEFAULT 1`);

    await safeAlter(`ALTER TABLE cinemas ADD COLUMN district VARCHAR(100) DEFAULT 'Trung tâm'`);
    await safeAlter(`ALTER TABLE cinemas ADD COLUMN special_formats VARCHAR(255) DEFAULT 'Dolby Atmos, 2D Laser'`);

    await safeAlter(`ALTER TABLE movies MODIFY COLUMN status ENUM('upcoming', 'coming_soon', 'sneak_show', 'now_showing', 'ended') NOT NULL DEFAULT 'upcoming'`);
    await safeAlter(`ALTER TABLE movies ADD COLUMN director VARCHAR(150) DEFAULT 'Đạo diễn Quốc tế'`);
    await safeAlter(`ALTER TABLE movies ADD COLUMN cast_members VARCHAR(500) DEFAULT 'Dàn diễn viên chính'`);
    await safeAlter(`ALTER TABLE movies ADD COLUMN country VARCHAR(100) DEFAULT 'Việt Nam'`);
    await safeAlter(`ALTER TABLE movies ADD COLUMN censorship_license VARCHAR(255) DEFAULT 'GP số 248/QĐ-ĐA - Cục Điện Ảnh cấp phép phổ biến toàn quốc'`);
    await safeAlter(`ALTER TABLE movies ADD COLUMN language_info VARCHAR(150) DEFAULT 'Tiếng Việt - Phụ đề Anh'`);
    await safeAlter(`ALTER TABLE movies ADD COLUMN formats VARCHAR(255) DEFAULT '2D Phụ đề, IMAX Laser'`);

    await safeAlter(`ALTER TABLE promotions ADD COLUMN title VARCHAR(200) DEFAULT NULL`);
    await safeAlter(`ALTER TABLE promotions ADD COLUMN description VARCHAR(500) DEFAULT NULL`);
    await safeAlter(`ALTER TABLE promotions ADD COLUMN applicable_chains VARCHAR(255) DEFAULT 'all'`);
    await safeAlter(`ALTER TABLE promotions ADD COLUMN budget_limit DECIMAL(14, 2) NOT NULL DEFAULT 150000000.00`);
    await safeAlter(`ALTER TABLE promotions ADD COLUMN budget_spent DECIMAL(14, 2) NOT NULL DEFAULT 42500000.00`);
    await safeAlter(`ALTER TABLE promotions ADD COLUMN platform_split_ratio INT NOT NULL DEFAULT 50`);
    await safeAlter(`ALTER TABLE promotions ADD COLUMN used_count INT NOT NULL DEFAULT 1250`);

    await safeAlter(`ALTER TABLE bookings ADD COLUMN partner_ticket_code VARCHAR(50) DEFAULT NULL`);
    await safeAlter(`ALTER TABLE bookings ADD COLUMN ticket_status ENUM('issued', 'checked_in', 'sync_error') NOT NULL DEFAULT 'issued'`);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS partner_settlements (
        settlement_id INT NOT NULL AUTO_INCREMENT,
        settlement_code VARCHAR(50) NOT NULL,
        brand_id INT NOT NULL,
        period_label VARCHAR(100) NOT NULL,
        total_transactions INT NOT NULL DEFAULT 0,
        total_gmv DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
        platform_commission DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
        discount_co_funded DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
        net_payable_to_partner DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
        discrepancies_count INT NOT NULL DEFAULT 0,
        status ENUM('audited', 'approved', 'paid') NOT NULL DEFAULT 'audited',
        due_date DATE DEFAULT NULL,
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (settlement_id),
        UNIQUE KEY uk_partner_settlements_code (settlement_code),
        KEY idx_partner_settlements_brand (brand_id),
        CONSTRAINT fk_partner_settlements_brand FOREIGN KEY (brand_id) REFERENCES cinema_brands (brand_id) ON DELETE CASCADE
      ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci
    `);

    await db.execute(`
      INSERT INTO cinema_brands (brand_name, logo_url, status, brand_code, commission_rate, settlement_cycle, api_status, latency_ms, sync_protocol, active_contract_until, co_funding_promos)
      VALUES
        ('Beta Cinemas', 'https://placehold.co/240x120?text=Beta', 'active', 'BETA', 7.20, 'daily', 'healthy', 52, 'Beta Cloud Connect POS API', '2028-01-01', 1),
        ('Mega GS Cinemas', 'https://placehold.co/240x120?text=MegaGS', 'active', 'MGS', 6.50, 'monthly', 'healthy', 55, 'Mega GS Gateway Sync v2', '2026-12-31', 0)
      ON DUPLICATE KEY UPDATE
        brand_code = COALESCE(brand_code, VALUES(brand_code))
    `);

    await db.execute(`
      UPDATE cinema_brands SET
        brand_code = CASE
          WHEN brand_name LIKE '%CGV%' THEN 'CGV'
          WHEN brand_name LIKE '%Lotte%' THEN 'LOTTE'
          WHEN brand_name LIKE '%Galaxy%' THEN 'GLX'
          WHEN brand_name LIKE '%BHD%' THEN 'BHD'
          WHEN brand_name LIKE '%CineStar%' THEN 'STAR'
          WHEN brand_name LIKE '%Beta%' THEN 'BETA'
          WHEN brand_name LIKE '%Mega%' THEN 'MGS'
          ELSE COALESCE(brand_code, 'PARTNER')
        END,
        commission_rate = CASE
          WHEN brand_name LIKE '%CGV%' AND commission_rate = 5.50 THEN 4.80
          WHEN brand_name LIKE '%Lotte%' AND commission_rate = 5.50 THEN 5.20
          WHEN brand_name LIKE '%Galaxy%' AND commission_rate = 5.50 THEN 5.50
          WHEN brand_name LIKE '%BHD%' AND commission_rate = 5.50 THEN 6.00
          WHEN brand_name LIKE '%CineStar%' AND commission_rate = 5.50 THEN 7.00
          ELSE commission_rate
        END,
        settlement_cycle = CASE
          WHEN brand_name LIKE '%CGV%' THEN 'daily'
          WHEN brand_name LIKE '%Lotte%' THEN 't3'
          WHEN brand_name LIKE '%Galaxy%' THEN 'weekly'
          WHEN brand_name LIKE '%BHD%' THEN 't3'
          WHEN brand_name LIKE '%CineStar%' THEN 'weekly'
          WHEN brand_name LIKE '%Beta%' THEN 'daily'
          ELSE 'monthly'
        END,
        sync_protocol = CASE
          WHEN brand_name LIKE '%CGV%' THEN 'CJ CGV Vista API v4.8 (Webhook Direct)'
          WHEN brand_name LIKE '%Lotte%' THEN 'Lotte RTS Cinema Core Socket v2.1'
          WHEN brand_name LIKE '%Galaxy%' THEN 'Galaxy Cloud Sync REST Engine'
          WHEN brand_name LIKE '%BHD%' THEN 'BHD GraphQL Ticketing Gateway v3'
          WHEN brand_name LIKE '%CineStar%' THEN 'Cinestar Core Hub v1.9'
          WHEN brand_name LIKE '%Beta%' THEN 'Beta Cloud Connect POS API'
          ELSE 'Mega GS Gateway Sync v2'
        END
      WHERE brand_code IS NULL OR sync_protocol = 'REST Gateway v2.0'
    `);

    await db.execute(`
      UPDATE bookings SET
        partner_ticket_code = CONCAT('VISTA-POS-', LPAD(booking_id, 5, '0')),
        ticket_status = CASE
          WHEN status = 'cancelled' THEN 'sync_error'
          WHEN status = 'completed' THEN 'checked_in'
          ELSE 'issued'
        END
      WHERE partner_ticket_code IS NULL
    `);

    await db.execute(`
      INSERT INTO partner_settlements (
        settlement_code, brand_id, period_label, total_transactions, total_gmv,
        platform_commission, discount_co_funded, net_payable_to_partner, discrepancies_count, status, due_date
      )
      VALUES
        ('set-cgv-1026', 1, 'Kỳ Đối Soát Tháng 10/2026', 98450, 12480000000.00, 599040000.00, 114200000.00, 11766760000.00, 3, 'audited', '2026-11-07'),
        ('set-lotte-1026', 2, 'Kỳ Đối Soát Tháng 10/2026', 64200, 7120000000.00, 370240000.00, 68500000.00, 6681260000.00, 1, 'approved', '2026-11-05'),
        ('set-glx-1026', 3, 'Kỳ Đối Soát Tháng 10/2026', 41800, 4350000000.00, 239250000.00, 42000000.00, 4068750000.00, 0, 'paid', '2026-11-02'),
        ('set-bhd-1026', 4, 'Kỳ Đối Soát Tháng 10/2026', 28900, 2680000000.00, 160800000.00, 25400000.00, 2493800000.00, 0, 'audited', '2026-11-07'),
        ('set-star-1026', 5, 'Kỳ Đối Soát Tháng 10/2026', 31400, 2180000000.00, 152600000.00, 19800000.00, 2007600000.00, 0, 'paid', '2026-11-01')
      ON DUPLICATE KEY UPDATE
        period_label = VALUES(period_label)
    `);

    schemaInitialized = true;
  } catch (err) {
    console.error("Schema initialization warning:", err.message);
  }
}

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
  await ensureAdminSchema();
  const condition = buildDateCondition(period, "b");

  const [rows] = await db.execute(`
    SELECT
      cb.brand_id,
      cb.brand_name,
      cb.brand_code,
      cb.logo_url,
      cb.status,
      cb.commission_rate,
      cb.settlement_cycle,
      cb.api_status,
      cb.latency_ms,
      cb.sync_protocol,
      DATE_FORMAT(cb.active_contract_until, '%Y-%m-%d') AS active_contract_until,
      cb.co_funding_promos,
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
    LEFT JOIN cinemas c ON c.brand_id = cb.brand_id
    LEFT JOIN screening_rooms r ON r.cinema_id = c.cinema_id
    LEFT JOIN showtimes s ON s.room_id = r.room_id
    LEFT JOIN bookings b ON b.showtime_id = s.showtime_id
    LEFT JOIN tickets t ON t.booking_id = b.booking_id
    GROUP BY cb.brand_id, cb.brand_name, cb.brand_code, cb.logo_url, cb.status, cb.commission_rate,
             cb.settlement_cycle, cb.api_status, cb.latency_ms, cb.sync_protocol, cb.active_contract_until, cb.co_funding_promos
    ORDER BY cb.brand_id ASC
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

export const getAdminMultiplexes = async () => {
  await ensureAdminSchema();
  const [rows] = await db.execute(`
    SELECT
      c.cinema_id,
      c.cinema_name,
      c.address,
      c.district,
      c.special_formats,
      c.status,
      ci.city_name,
      cb.brand_id,
      cb.brand_name,
      cb.brand_code,
      COUNT(DISTINCT r.room_id) AS screens_count,
      COUNT(DISTINCT se.seat_id) AS seat_capacity,
      COUNT(DISTINCT CASE WHEN b.status IN ('confirmed', 'completed') THEN b.booking_id END) AS total_bookings,
      COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN b.final_amount ELSE 0 END), 0) AS total_revenue
    FROM cinemas c
    JOIN cities ci ON ci.city_id = c.city_id
    JOIN cinema_brands cb ON cb.brand_id = c.brand_id
    LEFT JOIN screening_rooms r ON r.cinema_id = c.cinema_id
    LEFT JOIN seats se ON se.room_id = r.room_id
    LEFT JOIN showtimes s ON s.room_id = r.room_id
    LEFT JOIN bookings b ON b.showtime_id = s.showtime_id
    GROUP BY c.cinema_id, c.cinema_name, c.address, c.district, c.special_formats, c.status, ci.city_name, cb.brand_id, cb.brand_name, cb.brand_code
    ORDER BY c.cinema_id ASC
  `);
  return rows;
};

export const getAdminMovies = async () => {
  await ensureAdminSchema();
  const [movies] = await db.execute(`
    SELECT
      m.*,
      DATE_FORMAT(m.release_date, '%Y-%m-%d') AS release_date_str,
      COUNT(DISTINCT CASE WHEN b.status IN ('confirmed', 'completed') THEN t.ticket_id END) AS tickets_sold,
      COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN t.actual_price ELSE 0 END), 0) AS total_gmv
    FROM movies m
    LEFT JOIN showtimes s ON s.movie_id = m.movie_id
    LEFT JOIN bookings b ON b.showtime_id = s.showtime_id
    LEFT JOIN tickets t ON t.booking_id = b.booking_id
    GROUP BY m.movie_id
    ORDER BY m.movie_id DESC
  `);

  const [shareRows] = await db.execute(`
    SELECT
      s.movie_id,
      cb.brand_id,
      cb.brand_name,
      cb.brand_code,
      COUNT(t.ticket_id) AS tickets
    FROM tickets t
    JOIN bookings b ON b.booking_id = t.booking_id AND b.status IN ('confirmed', 'completed')
    JOIN showtimes s ON s.showtime_id = b.showtime_id
    JOIN screening_rooms r ON r.room_id = s.room_id
    JOIN cinemas c ON c.cinema_id = r.cinema_id
    JOIN cinema_brands cb ON cb.brand_id = c.brand_id
    GROUP BY s.movie_id, cb.brand_id, cb.brand_name, cb.brand_code
  `);

  return { movies, shareRows };
};

export const getAdminShowtimes = async (limit = 24) => {
  await ensureAdminSchema();
  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 24));
  const [rows] = await db.query(
    `
    SELECT
      st.showtime_id,
      st.movie_id,
      m.title AS movie_title,
      m.poster_url AS movie_poster,
      m.age_rating,
      cb.brand_id,
      cb.brand_name,
      cb.brand_code,
      c.cinema_id,
      c.cinema_name,
      r.room_id,
      r.room_name,
      r.room_type,
      DATE_FORMAT(st.start_time, '%H:%i') AS start_time_str,
      DATE_FORMAT(st.end_time, '%H:%i') AS end_time_str,
      DATE_FORMAT(st.start_time, '%Y-%m-%d') AS show_date_str,
      st.price_standard,
      st.price_vip,
      st.price_couple,
      st.status AS showtime_status,
      COUNT(ss.showtime_seat_id) AS total_seats,
      COUNT(CASE WHEN ss.status = 'available' AND se.status = 'active' THEN 1 END) AS available_seats,
      COUNT(CASE WHEN ss.status = 'held' THEN 1 END) AS held_seats,
      COUNT(CASE WHEN ss.status = 'booked' THEN 1 END) AS sold_seats
    FROM showtimes st
    JOIN movies m ON m.movie_id = st.movie_id
    JOIN screening_rooms r ON r.room_id = st.room_id
    JOIN cinemas c ON c.cinema_id = r.cinema_id
    JOIN cinema_brands cb ON cb.brand_id = c.brand_id
    LEFT JOIN showtime_seats ss ON ss.showtime_id = st.showtime_id
    LEFT JOIN seats se ON se.seat_id = ss.seat_id
    GROUP BY st.showtime_id, st.movie_id, m.title, m.poster_url, m.age_rating,
             cb.brand_id, cb.brand_name, cb.brand_code, c.cinema_id, c.cinema_name,
             r.room_id, r.room_name, r.room_type, st.start_time, st.end_time,
             st.price_standard, st.price_vip, st.price_couple, st.status
    ORDER BY sold_seats DESC, st.start_time DESC
    LIMIT ?
    `,
    [safeLimit],
  );
  return rows;
};

export const getShowtimeSeatMap = async (showtimeId) => {
  await ensureAdminSchema();
  const [rows] = await db.execute(
    `
    SELECT
      se.seat_id,
      se.row_letter,
      se.seat_number,
      se.seat_type,
      se.status AS physical_status,
      COALESCE(ss.status, 'available') AS booking_status,
      COALESCE(ss.price, st.price_standard) AS price
    FROM showtimes st
    JOIN seats se ON se.room_id = st.room_id
    LEFT JOIN showtime_seats ss ON ss.showtime_id = st.showtime_id AND ss.seat_id = se.seat_id
    WHERE st.showtime_id = ?
    ORDER BY se.row_letter ASC, se.seat_number ASC
    `,
    [Number(showtimeId)],
  );
  return rows;
};

export const toggleShowtimeSeatBlock = async (showtimeId, rowLetter, seatNumber) => {
  await ensureAdminSchema();
  const [seats] = await db.execute(
    `
    SELECT se.seat_id, se.status
    FROM showtimes st
    JOIN seats se ON se.room_id = st.room_id
    WHERE st.showtime_id = ? AND se.row_letter = ? AND se.seat_number = ?
    LIMIT 1
    `,
    [Number(showtimeId), rowLetter, Number(seatNumber)],
  );

  if (!seats.length) return null;
  const seat = seats[0];
  const nextStatus = seat.status === "maintenance" ? "active" : "maintenance";

  await db.execute(`UPDATE seats SET status = ? WHERE seat_id = ?`, [nextStatus, seat.seat_id]);
  return { seat_id: seat.seat_id, status: nextStatus === "maintenance" ? "blocked" : "available" };
};

export const releaseHeldSeat = async (showtimeId, rowLetter, seatNumber) => {
  await ensureAdminSchema();
  const [seats] = await db.execute(
    `
    SELECT se.seat_id
    FROM showtimes st
    JOIN seats se ON se.room_id = st.room_id
    WHERE st.showtime_id = ? AND se.row_letter = ? AND se.seat_number = ?
    LIMIT 1
    `,
    [Number(showtimeId), rowLetter, Number(seatNumber)],
  );

  if (!seats.length) return null;
  const seatId = seats[0].seat_id;

  await db.execute(
    `UPDATE showtime_seats SET status = 'available' WHERE showtime_id = ? AND seat_id = ?`,
    [Number(showtimeId), seatId],
  );
  await db.execute(`UPDATE seats SET status = 'active' WHERE seat_id = ?`, [seatId]);
  return { seat_id: seatId, status: "available" };
};

export const getAdminOrders = async (limit = 30) => {
  await ensureAdminSchema();
  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 30));
  const [rows] = await db.query(
    `
    SELECT
      b.booking_id,
      b.booking_code,
      b.partner_ticket_code,
      b.status AS booking_status,
      b.ticket_status,
      b.final_amount,
      b.created_at,
      cu.full_name AS customer_name,
      cu.phone AS customer_phone,
      cu.email AS customer_email,
      m.title AS movie_title,
      m.poster_url AS movie_poster,
      cb.brand_id,
      cb.brand_name,
      cb.brand_code,
      cb.commission_rate,
      ci.cinema_name,
      r.room_name,
      r.room_type,
      DATE_FORMAT(s.start_time, '%Y-%m-%d') AS show_date,
      DATE_FORMAT(s.start_time, '%H:%i') AS show_time,
      COALESCE(p.payment_method, 'vnpay') AS payment_method,
      COALESCE(p.status, 'success') AS payment_status,
      (
        SELECT GROUP_CONCAT(CONCAT(se.row_letter, '-', LPAD(se.seat_number, 2, '0')) SEPARATOR ',')
        FROM tickets t
        JOIN seats se ON se.seat_id = t.seat_id
        WHERE t.booking_id = b.booking_id
      ) AS seats_csv
    FROM bookings b
    JOIN customers cu ON cu.customer_id = b.customer_id
    JOIN showtimes s ON s.showtime_id = b.showtime_id
    JOIN movies m ON m.movie_id = s.movie_id
    JOIN screening_rooms r ON r.room_id = s.room_id
    JOIN cinemas ci ON ci.cinema_id = r.cinema_id
    JOIN cinema_brands cb ON cb.brand_id = ci.brand_id
    LEFT JOIN payments p ON p.booking_id = b.booking_id
    ORDER BY b.created_at DESC
    LIMIT ?
    `,
    [safeLimit],
  );
  return rows;
};

export const getAdminPromotions = async () => {
  await ensureAdminSchema();
  const [rows] = await db.execute(`
    SELECT
      promotion_id,
      code,
      title,
      description,
      discount_type,
      discount_value,
      min_order_amount,
      DATE_FORMAT(starts_at, '%Y-%m-%d') AS start_date,
      DATE_FORMAT(ends_at, '%Y-%m-%d') AS end_date,
      applicable_chains,
      budget_limit,
      budget_spent,
      platform_split_ratio,
      status,
      used_count
    FROM promotions
    ORDER BY promotion_id DESC
  `);
  return rows;
};

export const getAdminSettlements = async () => {
  await ensureAdminSchema();
  const [rows] = await db.execute(`
    SELECT
      ps.*,
      DATE_FORMAT(ps.due_date, '%Y-%m-%d') AS due_date_str,
      cb.brand_name,
      cb.brand_code
    FROM partner_settlements ps
    JOIN cinema_brands cb ON cb.brand_id = ps.brand_id
    ORDER BY ps.total_gmv DESC
  `);
  return rows;
};

export const syncAllPartnerBrands = async () => {
  await ensureAdminSchema();
  await db.execute(`
    UPDATE cinema_brands
    SET api_status = 'healthy',
        latency_ms = FLOOR(32 + (RAND() * 35))
  `);
  return getPartnerBrandsMetrics("all");
};

export const pingPartnerBrand = async (chainIdentifier) => {
  await ensureAdminSchema();
  const latency = Math.floor(Math.random() * 28) + 28;
  await db.execute(
    `
    UPDATE cinema_brands
    SET api_status = 'healthy', latency_ms = ?
    WHERE LOWER(brand_code) = LOWER(?) OR brand_id = ?
    `,
    [latency, String(chainIdentifier), Number(chainIdentifier) || 0],
  );
  return { chainId: chainIdentifier, latencyMs: latency, apiStatus: "healthy" };
};

export const updateBrandCommission = async (chainIdentifier, commissionRate) => {
  await ensureAdminSchema();
  const rate = Math.max(1, Math.min(25, Number(commissionRate) || 5.5));
  await db.execute(
    `
    UPDATE cinema_brands
    SET commission_rate = ?
    WHERE LOWER(brand_code) = LOWER(?) OR brand_id = ?
    `,
    [rate, String(chainIdentifier), Number(chainIdentifier) || 0],
  );
  return { chainId: chainIdentifier, commissionRate: rate };
};

export const toggleCinemaStatus = async (cinemaIdentifier) => {
  await ensureAdminSchema();
  const numericId = Number(String(cinemaIdentifier).replace(/\D/g, "")) || 0;
  const [rows] = await db.execute(
    `SELECT cinema_id, status FROM cinemas WHERE cinema_id = ? OR cinema_name LIKE ? LIMIT 1`,
    [numericId, `%${cinemaIdentifier}%`],
  );
  if (!rows.length) return null;

  const nextStatus = rows[0].status === "active" ? "inactive" : "active";
  await db.execute(`UPDATE cinemas SET status = ? WHERE cinema_id = ?`, [
    nextStatus,
    rows[0].cinema_id,
  ]);
  return {
    cinema_id: rows[0].cinema_id,
    status: nextStatus === "active" ? "active" : "temporary_closed",
  };
};

export const createAdminMovie = async (movieData) => {
  await ensureAdminSchema();
  const dbStatus =
    movieData.status === "coming_soon"
      ? "upcoming"
      : ["upcoming", "coming_soon", "sneak_show", "now_showing", "ended"].includes(movieData.status)
        ? movieData.status
        : "now_showing";

  const genresStr = Array.isArray(movieData.genre)
    ? movieData.genre.join(", ")
    : movieData.genre || "Hành động";
  const castStr = Array.isArray(movieData.cast)
    ? movieData.cast.join(", ")
    : movieData.cast || "Dàn diễn viên chính";
  const formatsStr = Array.isArray(movieData.formats)
    ? movieData.formats.join(", ")
    : movieData.formats || "2D Phụ đề";

  const [result] = await db.execute(
    `
    INSERT INTO movies (
      title, title_en, duration_minutes, genre, age_rating, rating_percent,
      poster_url, banner_url, trailer_url, description, release_date, status,
      director, cast_members, country, censorship_license, language_info, formats
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      movieData.title,
      movieData.originalTitle || movieData.title,
      Number(movieData.durationMinutes) || 120,
      genresStr,
      movieData.ageRating || "C13",
      Number(movieData.rating || 8.5) * 10,
      movieData.posterUrl || "https://placehold.co/400x600?text=Poster",
      movieData.backdropUrl || movieData.posterUrl || "https://placehold.co/1200x500?text=Banner",
      movieData.trailerUrl || "",
      movieData.synopsis || "",
      movieData.releaseDate || new Date().toISOString().slice(0, 10),
      dbStatus,
      movieData.director || "Đạo diễn",
      castStr,
      movieData.country || "Việt Nam",
      movieData.censorshipLicense || "GP số 248/QĐ-ĐA - Cục Điện Ảnh cấp phép",
      movieData.language || "Tiếng Việt - Phụ đề Anh",
      formatsStr,
    ],
  );

  return result.insertId;
};

export const updateAdminMovie = async (movieIdentifier, movieData) => {
  await ensureAdminSchema();
  const numericId = Number(String(movieIdentifier).replace(/\D/g, "")) || 0;
  const genresStr = Array.isArray(movieData.genre)
    ? movieData.genre.join(", ")
    : movieData.genre || "Hành động";
  const castStr = Array.isArray(movieData.cast)
    ? movieData.cast.join(", ")
    : movieData.cast || "Dàn diễn viên chính";
  const formatsStr = Array.isArray(movieData.formats)
    ? movieData.formats.join(", ")
    : movieData.formats || "2D Phụ đề";

  const dbStatus =
    movieData.status === "coming_soon"
      ? "upcoming"
      : ["upcoming", "coming_soon", "sneak_show", "now_showing", "ended"].includes(movieData.status)
        ? movieData.status
        : "now_showing";

  await db.execute(
    `
    UPDATE movies
    SET title = ?,
        title_en = ?,
        duration_minutes = ?,
        genre = ?,
        age_rating = ?,
        poster_url = ?,
        banner_url = ?,
        trailer_url = ?,
        description = ?,
        release_date = ?,
        status = ?,
        director = ?,
        cast_members = ?,
        country = ?,
        censorship_license = ?,
        language_info = ?,
        formats = ?
    WHERE movie_id = ? OR title = ?
    `,
    [
      movieData.title,
      movieData.originalTitle || movieData.title,
      Number(movieData.durationMinutes) || 120,
      genresStr,
      movieData.ageRating || "C13",
      movieData.posterUrl || "https://placehold.co/400x600?text=Poster",
      movieData.backdropUrl || movieData.posterUrl || "https://placehold.co/1200x500?text=Banner",
      movieData.trailerUrl || "",
      movieData.synopsis || "",
      movieData.releaseDate || new Date().toISOString().slice(0, 10),
      dbStatus,
      movieData.director || "Đạo diễn",
      castStr,
      movieData.country || "Việt Nam",
      movieData.censorshipLicense || "GP số 248/QĐ-ĐA - Cục Điện Ảnh cấp phép",
      movieData.language || "Tiếng Việt",
      formatsStr,
      numericId,
      movieData.title,
    ],
  );
  return true;
};

export const updateAdminMovieStatus = async (movieIdentifier, status) => {
  await ensureAdminSchema();
  const numericId = Number(String(movieIdentifier).replace(/\D/g, "")) || 0;
  const dbStatus = status === "coming_soon" ? "upcoming" : status;
  await db.execute(`UPDATE movies SET status = ? WHERE movie_id = ?`, [dbStatus, numericId]);
  return true;
};

export const deleteAdminMovie = async (movieIdentifier) => {
  await ensureAdminSchema();
  const numericId = Number(String(movieIdentifier).replace(/\D/g, "")) || 0;
  try {
    await db.execute(`DELETE FROM movies WHERE movie_id = ?`, [numericId]);
  } catch {
    await db.execute(`UPDATE movies SET status = 'ended' WHERE movie_id = ?`, [numericId]);
  }
  return true;
};

export const resyncOrderTicket = async (orderIdentifier) => {
  await ensureAdminSchema();
  const numericId = Number(String(orderIdentifier).replace(/\D/g, "")) || 0;
  await db.execute(
    `UPDATE bookings SET status = 'confirmed', ticket_status = 'issued' WHERE booking_code = ? OR booking_id = ?`,
    [String(orderIdentifier), numericId],
  );
  return true;
};

export const refundOrderTicket = async (orderIdentifier) => {
  await ensureAdminSchema();
  const numericId = Number(String(orderIdentifier).replace(/\D/g, "")) || 0;
  const [rows] = await db.execute(
    `SELECT booking_id, showtime_id FROM bookings WHERE booking_code = ? OR booking_id = ? LIMIT 1`,
    [String(orderIdentifier), numericId],
  );

  if (rows.length > 0) {
    const bookingId = rows[0].booking_id;
    await db.execute(
      `UPDATE bookings SET status = 'cancelled', ticket_status = 'sync_error' WHERE booking_id = ?`,
      [bookingId],
    );
    await db.execute(`UPDATE payments SET status = 'failed' WHERE booking_id = ?`, [bookingId]);
    await db.execute(
      `
      UPDATE showtime_seats ss
      JOIN tickets t ON t.showtime_seat_id = ss.showtime_seat_id
      SET ss.status = 'available'
      WHERE t.booking_id = ?
      `,
      [bookingId],
    );
  }
  return true;
};

export const createAdminPromotion = async (promoData) => {
  await ensureAdminSchema();
  const chainsStr = Array.isArray(promoData.applicableChains)
    ? promoData.applicableChains.join(",")
    : promoData.applicableChains || "all";

  const [result] = await db.execute(
    `
    INSERT INTO promotions (
      code, title, description, discount_type, discount_value, min_order_amount,
      starts_at, ends_at, applicable_chains, budget_limit, budget_spent,
      platform_split_ratio, status, used_count
    ) VALUES (?, ?, ?, 'fixed', ?, ?, ?, ?, ?, ?, 0, ?, 'active', 0)
    ON DUPLICATE KEY UPDATE
      title = VALUES(title),
      discount_value = VALUES(discount_value),
      budget_limit = VALUES(budget_limit),
      platform_split_ratio = VALUES(platform_split_ratio),
      status = 'active'
    `,
    [
      String(promoData.code).toUpperCase(),
      promoData.title,
      promoData.description || "Chiến dịch tài trợ liên chuỗi áp dụng trên hệ thống CineHub.",
      Number(promoData.discountValue) || 30000,
      Number(promoData.minOrderValue) || 120000,
      `${promoData.startDate || "2026-11-01"} 00:00:00`,
      `${promoData.endDate || "2026-12-31"} 23:59:59`,
      chainsStr,
      Number(promoData.budgetLimit) || 100000000,
      Number(promoData.platformSplitRatio) || 50,
    ],
  );
  return result.insertId;
};

export const approvePartnerSettlement = async (settlementCode) => {
  await ensureAdminSchema();
  await db.execute(
    `UPDATE partner_settlements SET status = 'approved' WHERE settlement_code = ? OR settlement_id = ?`,
    [String(settlementCode), Number(settlementCode) || 0],
  );
  return true;
};

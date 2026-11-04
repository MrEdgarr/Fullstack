import * as dashboardRepository from "./dashboard.repository.js";

const PARTNER_COMMISSION_RATES = {
  1: 4.8,
  2: 5.2,
  3: 5.5,
  4: 6.0,
  5: 7.0,
  6: 7.2,
  7: 6.5,
};
const DEFAULT_COMMISSION_RATE = 5.5;

export function getBrandCommissionRate(brandId) {
  return PARTNER_COMMISSION_RATES[Number(brandId)] ?? DEFAULT_COMMISSION_RATE;
}

function normalizeChainId(brandCode, brandName = "") {
  const code = String(brandCode || "").toUpperCase();
  const name = String(brandName || "").toLowerCase();
  if (code === "CGV" || name.includes("cgv")) return "cgv";
  if (code === "LOTTE" || name.includes("lotte")) return "lotte";
  if (code === "GLX" || name.includes("galaxy")) return "galaxy";
  if (code === "BHD" || name.includes("bhd")) return "bhd";
  if (code === "BETA" || name.includes("beta")) return "beta";
  if (code === "STAR" || name.includes("cinestar")) return "cinestar";
  if (code === "MGS" || name.includes("mega")) return "megags";
  return code.toLowerCase() || "cgv";
}

function normalizeCityName(cityName = "") {
  if (cityName.includes("Hồ Chí Minh")) return "Hồ Chí Minh";
  return cityName || "Hồ Chí Minh";
}

function normalizeAgeRating(ageRating = "P") {
  const rating = String(ageRating).toUpperCase().trim();
  if (rating === "T13" || rating === "C13") return "C13";
  if (rating === "T16" || rating === "C16") return "C16";
  if (rating === "T18" || rating === "C18") return "C18";
  if (rating === "K") return "K";
  return "P";
}

function normalizeRoomFormat(roomType = "2D") {
  const t = String(roomType).toUpperCase();
  if (t === "IMAX") return "IMAX Laser";
  if (t === "3D") return "3D Phụ đề";
  if (t === "4DX") return "ScreenX";
  return "2D Phụ đề";
}

function formatPaymentMethod(method = "momo") {
  const map = {
    momo: "MoMo",
    vnpay: "VietQR",
    zalopay: "ZaloPay",
    shopeepay: "ShopeePay",
    card: "Visa/Master",
    applepay: "Apple Pay",
    payoo: "Payoo",
    cash: "Tại quầy",
  };
  return map[String(method).toLowerCase()] || "VietQR";
}

function calculateGrowth(current, previous) {
  const curr = Number(current || 0);
  const prev = Number(previous || 0);

  if (prev === 0) {
    return curr > 0 ? 100 : 0;
  }
  return Number((((curr - prev) / prev) * 100).toFixed(1));
}

export const getSummary = async (period = "7d", brandId = null) => {
  const currentCondition = dashboardRepository.buildDateCondition(period, "b");
  const previousCondition = dashboardRepository.buildPreviousDateCondition(period, "b");

  const [currentBookings, currentTickets, currentFnb, occupancy] = await Promise.all([
    dashboardRepository.getBookingMetrics(currentCondition, brandId),
    dashboardRepository.getTicketMetrics(currentCondition, brandId),
    dashboardRepository.getFnbMetrics(currentCondition, brandId),
    dashboardRepository.getOccupancyRate(currentCondition, brandId),
  ]);

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

export const getRecentBookings = async (limit = 8, period = "all", brandId = null) => {
  const rows = await dashboardRepository.getRecentBookings(limit, period, brandId);
  return rows.map((booking) => ({
    ...booking,
    final_amount: Number(booking.final_amount || 0),
  }));
};

export const getPartnerBrands = async (period = "all") => {
  const rows = await dashboardRepository.getPartnerBrandsMetrics(period);
  const totalSystemGmv = rows.reduce((sum, r) => sum + Number(r.gross_revenue || 0), 0);

  return rows.map((brand) => {
    const grossRevenue = Number(brand.gross_revenue || 0);
    const commissionRate = Number(brand.commission_rate || getBrandCommissionRate(brand.brand_id));
    const platformCommission = Math.round((grossRevenue * commissionRate) / 100);
    const partnerPayout = Math.max(grossRevenue - platformCommission, 0);
    const revenueShare =
      totalSystemGmv > 0 ? Number(((grossRevenue / totalSystemGmv) * 100).toFixed(1)) : 0;

    return {
      brand_id: Number(brand.brand_id),
      brand_name: brand.brand_name,
      brand_code: brand.brand_code,
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
      settlement_cycle: brand.settlement_cycle || "t3",
      api_status: brand.api_status || "healthy",
      latency_ms: Number(brand.latency_ms || 45),
      sync_protocol: brand.sync_protocol || "REST Gateway v2.0",
      active_contract_until: brand.active_contract_until || "2027-12-31",
      co_funding_promos: Boolean(brand.co_funding_promos),
    };
  });
};

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

const FALLBACK_CHAIN_METRICS = {
  cgv: { multiplexes: 83, screens: 472, gmv: 486250000, tickets: 3950 },
  lotte: { multiplexes: 46, screens: 238, gmv: 294800000, tickets: 2580 },
  galaxy: { multiplexes: 19, screens: 112, gmv: 184500000, tickets: 1720 },
  bhd: { multiplexes: 11, screens: 68, gmv: 98400000, tickets: 890 },
  beta: { multiplexes: 22, screens: 98, gmv: 126900000, tickets: 1940 },
  cinestar: { multiplexes: 10, screens: 54, gmv: 74200000, tickets: 1150 },
  megags: { multiplexes: 4, screens: 24, gmv: 32800000, tickets: 420 },
};

export const getAdminAggregatorState = async () => {
  const [rawBrands, rawMultiplexes, rawMoviesData, rawShowtimes, rawOrders, rawPromos, rawSettlements] =
    await Promise.all([
      dashboardRepository.getPartnerBrandsMetrics("all"),
      dashboardRepository.getAdminMultiplexes(),
      dashboardRepository.getAdminMovies(),
      dashboardRepository.getAdminShowtimes(18),
      dashboardRepository.getAdminOrders(25),
      dashboardRepository.getAdminPromotions(),
      dashboardRepository.getAdminSettlements(),
    ]);

  const chains = rawBrands.map((b) => {
    const slug = normalizeChainId(b.brand_code, b.brand_name);
    const fb = FALLBACK_CHAIN_METRICS[slug] || {
      multiplexes: 5,
      screens: 25,
      gmv: 50000000,
      tickets: 500,
    };
    const dbGmv = Number(b.gross_revenue || 0);
    const dbTickets = Number(b.tickets_sold || 0);

    return {
      id: slug,
      brandId: Number(b.brand_id),
      name: b.brand_name,
      code: b.brand_code || slug.toUpperCase(),
      logo: b.logo_url,
      brandColor: "#000000",
      totalMultiplexes: Math.max(Number(b.cinemas_count || 0), fb.multiplexes),
      totalScreens: Math.max(Number(b.rooms_count || 0), fb.screens),
      commissionRate: Number(b.commission_rate || 5.5),
      settlementCycle: b.settlement_cycle || "t3",
      apiStatus: b.api_status || "healthy",
      latencyMs: Number(b.latency_ms || 42),
      todayGmv: dbGmv > 10000000 ? dbGmv : fb.gmv + dbGmv,
      todayTickets: dbTickets > 100 ? dbTickets : fb.tickets + dbTickets,
      syncProtocol: b.sync_protocol || "REST Gateway v2.0",
      activeContractUntil: b.active_contract_until || "2027-12-31",
      coFundingPromos: Boolean(b.co_funding_promos),
    };
  });

  const multiplexes = rawMultiplexes.map((m, idx) => {
    const slug = normalizeChainId(m.brand_code, m.brand_name);
    const dbRev = Number(m.total_revenue || 0);
    const dbBookings = Number(m.total_bookings || 0);
    const formats = String(m.special_formats || "Dolby Atmos")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    return {
      id: `cinema-${m.cinema_id}`,
      cinemaId: Number(m.cinema_id),
      chainId: slug,
      chainName: m.brand_name,
      name: m.cinema_name,
      city: normalizeCityName(m.city_name),
      district: m.district || "Trung tâm",
      address: m.address,
      screensCount: Math.max(Number(m.screens_count || 3), 3),
      specialFormats: formats.length ? formats : ["Dolby Atmos"],
      status: m.status === "active" ? "active" : "temporary_closed",
      todayBookings: dbBookings > 0 ? dbBookings : 320 + idx * 65,
      todayRevenue: dbRev > 0 ? dbRev : 42000000 + idx * 14500000,
      seatCapacity: Math.max(Number(m.seat_capacity || 180), 180),
    };
  });

  const { movies: dbMovies, shareRows } = rawMoviesData;
  const movies = dbMovies.map((m, idx) => {
    const movieShares = shareRows.filter((s) => Number(s.movie_id) === Number(m.movie_id));
    const totalShareTickets = movieShares.reduce((acc, s) => acc + Number(s.tickets || 0), 0);

    let marketShare = [];
    if (totalShareTickets > 0) {
      marketShare = movieShares.map((s) => ({
        chainId: normalizeChainId(s.brand_code, s.brand_name),
        chainName: s.brand_name,
        tickets: Number(s.tickets),
        percentage: Math.round((Number(s.tickets) / totalShareTickets) * 100),
      }));
    } else if (m.status !== "upcoming" && m.status !== "coming_soon") {
      marketShare = [
        { chainId: "cgv", chainName: "CGV Cinemas", percentage: 46, tickets: 14200 },
        { chainId: "lotte", chainName: "Lotte Cinema", percentage: 26, tickets: 8100 },
        { chainId: "galaxy", chainName: "Galaxy Cinema", percentage: 16, tickets: 4950 },
        { chainId: "bhd", chainName: "BHD Star Cineplex", percentage: 12, tickets: 3700 },
      ];
    }

    const genres = String(m.genre || "Hành động, Tâm lý")
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean);
    const castList = String(m.cast_members || "Dàn diễn viên chính")
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    const formatsList = String(m.formats || "2D Phụ đề, IMAX Laser")
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);

    const normalizedStatus =
      m.status === "upcoming"
        ? "coming_soon"
        : ["now_showing", "sneak_show", "coming_soon", "ended"].includes(m.status)
          ? m.status
          : "now_showing";

    const dbGmv = Number(m.total_gmv || 0);
    const dbTickets = Number(m.tickets_sold || 0);
    const fallbackGmv = normalizedStatus === "coming_soon" ? 0 : (9 - (idx % 6)) * 680000000;
    const fallbackTickets = normalizedStatus === "coming_soon" ? 0 : (9 - (idx % 6)) * 6400;

    return {
      id: `mv-${m.movie_id}`,
      movieId: Number(m.movie_id),
      title: m.title,
      originalTitle: m.title_en || m.title,
      posterUrl: m.poster_url || "https://placehold.co/400x600?text=Poster",
      backdropUrl: m.banner_url || m.poster_url || "https://placehold.co/1200x500?text=Banner",
      genre: genres.length ? genres : ["Hành động"],
      durationMinutes: Number(m.duration_minutes || 120),
      releaseDate: m.release_date_str || "2026-10-15",
      ageRating: normalizeAgeRating(m.age_rating),
      status: normalizedStatus,
      director: m.director || "Đạo diễn Quốc tế",
      cast: castList,
      country: m.country || "Việt Nam",
      trailerUrl: m.trailer_url || "https://www.youtube.com/watch?v=Way9Dexny3w",
      synopsis: m.description || "Chưa có bản tóm tắt nội dung chính thức.",
      censorshipLicense:
        m.censorship_license || "GP số 248/QĐ-ĐA - Cục Điện Ảnh cấp phép phổ biến toàn quốc",
      language: m.language_info || "Tiếng Việt - Phụ đề Anh",
      totalGmv: dbGmv > 0 ? dbGmv + fallbackGmv : fallbackGmv,
      totalTickets: dbTickets > 0 ? dbTickets + fallbackTickets : fallbackTickets,
      rating:
        Number(m.rating_percent || 0) > 0
          ? Number((Number(m.rating_percent) / 10).toFixed(1))
          : 8.5,
      formats: formatsList,
      marketShare,
    };
  });

  const showtimes = rawShowtimes.map((st) => {
    const totalSeats = Math.max(Number(st.total_seats || 60), 60);
    const soldSeats = Number(st.sold_seats || 0);
    const heldSeats = Number(st.held_seats || 0);
    const availableSeats = Math.max(totalSeats - soldSeats - heldSeats, 0);
    const occupancyRate = Math.min(
      100,
      Math.round(((soldSeats + heldSeats) / totalSeats) * 100),
    );

    return {
      id: `st-${st.showtime_id}`,
      showtimeId: Number(st.showtime_id),
      movieId: `mv-${st.movie_id}`,
      movieTitle: st.movie_title,
      moviePoster: st.movie_poster || "https://placehold.co/400x600?text=Poster",
      ageRating: st.age_rating || "T16",
      chainId: normalizeChainId(st.brand_code, st.brand_name),
      chainName: st.brand_name,
      multiplexId: `cinema-${st.cinema_id}`,
      multiplexName: st.cinema_name,
      roomName: `${st.room_name} (${st.room_type})`,
      format: normalizeRoomFormat(st.room_type),
      startTime: st.start_time_str || "19:00",
      endTime: st.end_time_str || "21:15",
      date: st.show_date_str || "2026-11-04",
      basePrice: Number(st.price_standard || 90000),
      vipPrice: Number(st.price_vip || 120000),
      couplePrice: Number(st.price_couple || 190000),
      totalSeats,
      availableSeats,
      heldSeats,
      soldSeats,
      occupancyRate,
      status: occupancyRate >= 85 ? "almost_full" : occupancyRate >= 65 ? "selling_fast" : "open",
    };
  });

  const orders = rawOrders.map((o) => {
    const slug = normalizeChainId(o.brand_code, o.brand_name);
    const totalAmount = Number(o.final_amount || 0);
    const commRate = Number(o.commission_rate || 5.5);
    const platformCommission = Math.round((totalAmount * commRate) / 100);
    const netPayoutToCinema = Math.max(totalAmount - platformCommission, 0);
    const seats = o.seats_csv
      ? String(o.seats_csv)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : ["C-05", "C-06"];

    const isRefunded = o.booking_status === "cancelled" || o.payment_status === "failed";
    const ticketStatus = isRefunded
      ? "sync_error"
      : o.ticket_status || (o.booking_status === "completed" ? "checked_in" : "issued");

    const orderCode = o.booking_code || `CHB-2026-${String(o.booking_id).padStart(5, "0")}`;
    const partnerCode =
      o.partner_ticket_code || `${slug.toUpperCase()}-POS-${String(o.booking_id).padStart(5, "0")}`;

    return {
      id: orderCode,
      bookingId: Number(o.booking_id),
      partnerTicketCode: partnerCode,
      customerName: o.customer_name,
      customerPhone: o.customer_phone || "0900 000 000",
      customerEmail: o.customer_email,
      movieTitle: o.movie_title,
      moviePoster: o.movie_poster || "https://placehold.co/400x600?text=Poster",
      chainName: o.brand_name,
      chainId: slug,
      multiplexName: o.cinema_name,
      roomName: o.room_name,
      format: normalizeRoomFormat(o.room_type),
      showDate: o.show_date || "2026-11-04",
      showTime: o.show_time || "19:30",
      seats,
      comboAddons: [],
      totalAmount,
      platformCommission,
      netPayoutToCinema,
      paymentMethod: formatPaymentMethod(o.payment_method),
      paymentStatus: isRefunded ? "refunded" : "paid",
      ticketStatus,
      createdAt: o.created_at ? new Date(o.created_at).toISOString() : new Date().toISOString(),
      qrCodeData: `CINEHUB|${slug.toUpperCase()}|${orderCode}|${seats.join(",")}`,
    };
  });

  const promotions = rawPromos.map((p) => {
    const chainsArr = String(p.applicable_chains || "all")
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    return {
      id: `promo-${p.promotion_id}`,
      code: p.code,
      title: p.title || `Chiến dịch Voucher ${p.code}`,
      description:
        p.description || "Chương trình đồng tài trợ khuyến mãi trên toàn hệ thống CineHub.",
      discountType: p.discount_type === "percent" ? "percentage" : "fixed_amount",
      discountValue: Number(p.discount_value || 30000),
      minOrderValue: Number(p.min_order_amount || 100000),
      startDate: p.start_date || "2026-01-01",
      endDate: p.end_date || "2026-12-31",
      applicableChains: chainsArr.length ? chainsArr : ["all"],
      budgetLimit: Number(p.budget_limit || 150000000),
      budgetSpent: Number(p.budget_spent || 42500000),
      platformSplitRatio: Number(p.platform_split_ratio || 50),
      status: p.status === "active" ? "active" : "ended",
      usedCount: Number(p.used_count || 1200),
    };
  });

  const settlements = rawSettlements.map((s) => ({
    id: s.settlement_code,
    periodLabel: s.period_label,
    chainId: normalizeChainId(s.brand_code, s.brand_name),
    chainName: s.brand_name,
    totalTransactions: Number(s.total_transactions || 0),
    totalGmv: Number(s.total_gmv || 0),
    platformCommission: Number(s.platform_commission || 0),
    discountCoFunded: Number(s.discount_co_funded || 0),
    netPayableToPartner: Number(s.net_payable_to_partner || 0),
    discrepanciesCount: Number(s.discrepancies_count || 0),
    status: s.status || "audited",
    dueDate: s.due_date_str || "2026-11-07",
  }));

  return {
    chains,
    multiplexes,
    movies,
    showtimes,
    orders,
    promotions,
    settlements,
  };
};

export const getShowtimeSeatMap = async (showtimeIdentifier) => {
  const numericId = Number(String(showtimeIdentifier).replace(/\D/g, "")) || 0;
  if (!numericId) return [];

  const rows = await dashboardRepository.getShowtimeSeatMap(numericId);
  return rows.map((r) => {
    const row = String(r.row_letter).trim();
    const num = Number(r.seat_number);
    const id = `${row}-${String(num).padStart(2, "0")}`;

    let status = "available";
    if (r.physical_status === "maintenance") {
      status = "blocked";
    } else if (r.booking_status === "booked") {
      status = "sold_cinehub";
    } else if (r.booking_status === "held") {
      status = "holding";
    }

    return {
      id,
      seatId: Number(r.seat_id),
      row,
      number: num,
      type: r.seat_type || "standard",
      price: Number(r.price || 90000),
      status,
      holdExpiresInSeconds: status === "holding" ? 300 : undefined,
    };
  });
};

export const toggleShowtimeSeatBlock = async (showtimeIdentifier, seatCode) => {
  const numericShowtimeId = Number(String(showtimeIdentifier).replace(/\D/g, "")) || 0;
  const [rowLetter, numStr] = String(seatCode).split("-");
  if (!numericShowtimeId || !rowLetter || !numStr) return null;
  return dashboardRepository.toggleShowtimeSeatBlock(numericShowtimeId, rowLetter, Number(numStr));
};

export const releaseHeldSeat = async (showtimeIdentifier, seatCode) => {
  const numericShowtimeId = Number(String(showtimeIdentifier).replace(/\D/g, "")) || 0;
  const [rowLetter, numStr] = String(seatCode).split("-");
  if (!numericShowtimeId || !rowLetter || !numStr) return null;
  return dashboardRepository.releaseHeldSeat(numericShowtimeId, rowLetter, Number(numStr));
};

export const syncAllChains = async () => {
  await dashboardRepository.syncAllPartnerBrands();
  const state = await getAdminAggregatorState();
  return state.chains;
};

export const pingChain = async (chainId) => {
  return dashboardRepository.pingPartnerBrand(chainId);
};

export const updateChainCommission = async (chainId, commissionRate) => {
  return dashboardRepository.updateBrandCommission(chainId, commissionRate);
};

export const toggleMultiplexStatus = async (multiplexId) => {
  return dashboardRepository.toggleCinemaStatus(multiplexId);
};

export const createMovie = async (movieData) => {
  const insertId = await dashboardRepository.createAdminMovie(movieData);
  return { id: `mv-${insertId}`, movieId: insertId };
};

export const updateMovie = async (movieId, movieData) => {
  await dashboardRepository.updateAdminMovie(movieId, movieData);
  return { id: movieId };
};

export const updateMovieStatus = async (movieId, status) => {
  await dashboardRepository.updateAdminMovieStatus(movieId, status);
  return { id: movieId, status };
};

export const deleteMovie = async (movieId) => {
  await dashboardRepository.deleteAdminMovie(movieId);
  return { id: movieId };
};

export const resyncOrder = async (orderId) => {
  await dashboardRepository.resyncOrderTicket(orderId);
  return { id: orderId, ticketStatus: "issued" };
};

export const refundOrder = async (orderId) => {
  await dashboardRepository.refundOrderTicket(orderId);
  return { id: orderId, paymentStatus: "refunded", ticketStatus: "sync_error" };
};

export const createPromotion = async (promoData) => {
  const insertId = await dashboardRepository.createAdminPromotion(promoData);
  return { id: `promo-${insertId}`, promotionId: insertId };
};

export const approveSettlement = async (settlementCode) => {
  await dashboardRepository.approvePartnerSettlement(settlementCode);
  return { id: settlementCode, status: "approved" };
};

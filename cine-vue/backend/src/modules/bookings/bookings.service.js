const db = require("../../shared/config/database");
const bookingsRepository = require("./bookings.repository");
const AppError = require("../../shared/utils/app-error");

const HOLD_MINUTES = 10;

exports.getByCustomer = async (currentUser, requestedCustomerId) => {
  const isOwner = currentUser.customer_id === Number(requestedCustomerId);
  const isAdmin = currentUser.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new AppError("Forbidden", 403);
  }

  return bookingsRepository.getByCustomer(requestedCustomerId);
};

exports.assertCanAccessBooking = assertCanAccessBooking;

exports.create = async (customerId, payload) => {
  const connection = await db.getConnection();

  try {
    const {
      showtime_id: showtimeId,
      showtime_seat_ids: showtimeSeatIds,
      food_combos: foodCombos = [],
      promotion_code: promotionCode,
    } = payload;

    await connection.beginTransaction();

    const [seatRows] = await bookingsRepository.getSelectedSeatsForUpdate(
      connection,
      showtimeId,
      showtimeSeatIds,
    );

    if (seatRows.length !== showtimeSeatIds.length) {
      throw new AppError("Invalid seat selection", 400);
    }

    const now = new Date();
    await bookingsRepository.releaseExpiredSelectedSeats(
      connection,
      showtimeId,
      showtimeSeatIds,
      now,
    );

    const [refreshedSeatRows] = await bookingsRepository.getSelectedSeatsForUpdate(
      connection,
      showtimeId,
      showtimeSeatIds,
    );

    const unavailableSeat = refreshedSeatRows.find(
      (seat) =>
        seat.status === "booked" ||
        (seat.status === "held" && seat.held_until && new Date(seat.held_until) > now),
    );

    if (unavailableSeat) {
      throw new AppError("One or more seats are unavailable", 409);
    }

    const [showtimeRows] = await bookingsRepository.getShowtimeCinema(connection, showtimeId);
    const showtime = showtimeRows[0];

    if (!showtime) {
      throw new AppError("Showtime not found", 404);
    }

    const ticketSubtotal = refreshedSeatRows.reduce((sum, seat) => sum + Number(seat.price), 0);
    const { comboRows, comboSubtotal } = await getComboSummary(connection, foodCombos, showtime);
    const subtotalAmount = ticketSubtotal + comboSubtotal;
    const { promotion, discountAmount } = await getPromotionSummary(
      connection,
      promotionCode,
      subtotalAmount,
    );
    const finalAmount = subtotalAmount - discountAmount;
    const expiresAt = new Date(Date.now() + HOLD_MINUTES * 60 * 1000);

    const [bookingResult] = await bookingsRepository.create(
      connection,
      customerId,
      showtimeId,
      promotion?.promotion_id || null,
      subtotalAmount,
      discountAmount,
      finalAmount,
      expiresAt,
    );
    const bookingId = bookingResult.insertId;

    await bookingsRepository.holdSeats(
      connection,
      bookingId,
      expiresAt,
      showtimeId,
      showtimeSeatIds,
    );

    if (foodCombos.length > 0) {
      const comboPriceMap = new Map(
        comboRows.map((combo) => [combo.food_combo_id, Number(combo.price)]),
      );
      const comboValues = foodCombos.map((item) => {
        const unitPrice = comboPriceMap.get(item.food_combo_id);
        return [bookingId, item.food_combo_id, item.quantity, unitPrice, unitPrice * item.quantity];
      });

      await bookingsRepository.createFoodComboLines(connection, comboValues);
    }

    await connection.commit();

    return {
      booking_id: bookingId,
      subtotal_amount: subtotalAmount,
      discount_amount: discountAmount,
      final_amount: finalAmount,
      expires_at: expiresAt,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

exports.updateStatus = async (currentUser, bookingId, status) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();
    const [bookings] = await bookingsRepository.getByIdForUpdate(connection, bookingId);
    const booking = bookings[0];

    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    assertCanAccessBooking(currentUser, booking);

    if (currentUser.role !== "admin" && status !== "cancelled") {
      throw new AppError("Only admins can set this booking status", 403);
    }

    if (status === "confirmed") {
      if (booking.status === "confirmed") {
        await connection.rollback();
        return { alreadyConfirmed: true };
      }

      await confirmBooking(connection, bookingId, "Booking hold has expired or no held seats remain");
    } else if (status === "cancelled") {
      await bookingsRepository.releaseHeldSeats(connection, bookingId);
    }

    await bookingsRepository.updateStatus(connection, bookingId, status);
    await connection.commit();
    return { alreadyConfirmed: false };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

exports.delete = async (currentUser, bookingId) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();
    const [bookings] = await bookingsRepository.getByIdForUpdate(connection, bookingId);
    const booking = bookings[0];

    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    assertCanAccessBooking(currentUser, booking);
    await bookingsRepository.releaseHeldSeats(connection, bookingId);
    await bookingsRepository.delete(connection, bookingId);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

exports.confirmBooking = confirmBooking;

async function getComboSummary(connection, foodCombos, showtime) {
  if (foodCombos.length === 0) {
    return { comboRows: [], comboSubtotal: 0 };
  }

  const comboIds = foodCombos.map((item) => item.food_combo_id);
  const [comboRows] = await bookingsRepository.getActiveCombosForUpdate(connection, comboIds);

  if (comboRows.length !== new Set(comboIds).size) {
    throw new AppError("Invalid food combo selection", 400);
  }

  if (comboRows.some((combo) => combo.cinema_id !== showtime.cinema_id)) {
    throw new AppError("Food combo does not belong to this cinema", 400);
  }

  const comboPriceMap = new Map(
    comboRows.map((combo) => [combo.food_combo_id, Number(combo.price)]),
  );
  const comboSubtotal = foodCombos.reduce(
    (sum, item) => sum + comboPriceMap.get(item.food_combo_id) * item.quantity,
    0,
  );

  return { comboRows, comboSubtotal };
}

async function getPromotionSummary(connection, promotionCode, subtotalAmount) {
  if (!promotionCode) {
    return { promotion: null, discountAmount: 0 };
  }

  const [promotionRows] = await bookingsRepository.getPromotionForUpdate(
    connection,
    promotionCode.trim().toUpperCase(),
  );
  const promotion = promotionRows[0];

  if (!promotion) {
    throw new AppError("Promotion is invalid", 400);
  }

  if (subtotalAmount < Number(promotion.min_order_amount)) {
    throw new AppError("Order does not meet promotion minimum", 400);
  }

  let discountAmount =
    promotion.discount_type === "percent"
      ? subtotalAmount * (Number(promotion.discount_value) / 100)
      : Number(promotion.discount_value);

  if (promotion.max_discount_amount !== null) {
    discountAmount = Math.min(discountAmount, Number(promotion.max_discount_amount));
  }

  discountAmount = Math.min(discountAmount, subtotalAmount);

  return { promotion, discountAmount };
}

async function confirmBooking(connection, bookingId, expiredMessage) {
  const [heldSeats] = await bookingsRepository.getActiveHeldSeatsForBooking(connection, bookingId);

  if (heldSeats.length === 0) {
    throw new AppError(expiredMessage, 409);
  }

  await bookingsRepository.createTicketsFromHeldSeats(connection, bookingId);
  await bookingsRepository.markHeldSeatsBooked(connection, bookingId);
}

function assertCanAccessBooking(currentUser, booking) {
  const isOwner = currentUser.customer_id === Number(booking.customer_id);
  const isAdmin = currentUser.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new AppError("Forbidden", 403);
  }
}

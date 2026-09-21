const db = require("../../shared/config/database");
const bookingsRepository = require("./bookings.repository");
const AppError = require("../../shared/utils/app-error");

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
      showtime_seat_ids: rawSeatIds = [],
      food_combos: foodCombos = [],
      promotion_code: promotionCode,
    } = payload;

    const showtimeSeatIds = [...rawSeatIds].map(Number).sort((a, b) => a - b);

    if (showtimeSeatIds.length === 0) {
      throw new AppError("Vui lòng chọn ít nhất một ghế", 400);
    }

    await connection.beginTransaction();

    const [seatRows] = await bookingsRepository.getSelectedSeatsForUpdate(
      connection,
      showtimeId,
      showtimeSeatIds,
    );

    if (seatRows.length !== showtimeSeatIds.length) {
      throw new AppError("Invalid seat selection", 400);
    }

    const unavailableSeat = seatRows.find(
      (seat) => seat.status === "booked" || seat.status !== "available",
    );

    if (unavailableSeat) {
      throw new AppError("One or more seats are unavailable", 409);
    }

    const [showtimeRows] = await bookingsRepository.getShowtimeCinema(connection, showtimeId);
    const showtime = showtimeRows[0];

    if (!showtime) {
      throw new AppError("Showtime not found", 404);
    }

    const ticketSubtotal = seatRows.reduce((sum, seat) => sum + Number(seat.price), 0);
    const { comboRows, comboSubtotal } = await getComboSummary(connection, foodCombos, showtime);
    const subtotalAmount = ticketSubtotal + comboSubtotal;
    const { promotion, discountAmount } = await getPromotionSummary(
      connection,
      promotionCode,
      subtotalAmount,
    );
    const finalAmount = subtotalAmount - discountAmount;

    const [bookingResult] = await bookingsRepository.create(
      connection,
      customerId,
      showtimeId,
      promotion?.promotion_id || null,
      subtotalAmount,
      discountAmount,
      finalAmount,
    );
    const bookingId = bookingResult.insertId;

    // Tạo vé và chuyển ghế sang trạng thái đã bán (booked)
    await bookingsRepository.createTicketsForSeats(connection, bookingId, showtimeSeatIds);
    await bookingsRepository.markSeatsBooked(connection, showtimeSeatIds);

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
      await confirmBooking(connection, bookingId, "Booking cannot be confirmed");
    } else if (status === "cancelled") {
      await bookingsRepository.releaseSeatsByBooking(connection, bookingId);
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
    await bookingsRepository.releaseSeatsByBooking(connection, bookingId);
    await bookingsRepository.delete(connection, bookingId);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

exports.updateDetails = async (currentUser, bookingId, payload) => {
  const connection = await db.getConnection();

  try {
    const { food_combos: foodCombos = [], promotion_code: promotionCode } = payload;
    await connection.beginTransaction();

    const [bookings] = await bookingsRepository.getByIdForUpdate(connection, bookingId);
    const booking = bookings[0];

    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    assertCanAccessBooking(currentUser, booking);

    if (booking.status !== "pending") {
      throw new AppError("Cannot update details for non-pending booking", 400);
    }

    const [tickets] = await bookingsRepository.getSeatsForBooking(connection, bookingId);
    if (tickets.length === 0) {
      throw new AppError("No tickets found for this booking", 400);
    }

    const ticketSubtotal = tickets.reduce((sum, seat) => sum + Number(seat.price), 0);

    const [showtimeRows] = await bookingsRepository.getShowtimeCinema(connection, booking.showtime_id);
    const showtime = showtimeRows[0];
    if (!showtime) {
      throw new AppError("Showtime not found", 404);
    }

    const { comboRows, comboSubtotal } = await getComboSummary(connection, foodCombos, showtime);
    const subtotalAmount = ticketSubtotal + comboSubtotal;
    const { promotion, discountAmount } = await getPromotionSummary(
      connection,
      promotionCode,
      subtotalAmount,
    );
    const finalAmount = Math.max(subtotalAmount - discountAmount, 0);

    await bookingsRepository.deleteFoodCombos(connection, bookingId);

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

    await bookingsRepository.updateBookingDetails(
      connection,
      bookingId,
      promotion?.promotion_id || null,
      subtotalAmount,
      discountAmount,
      finalAmount,
    );

    await connection.commit();

    return {
      booking_id: Number(bookingId),
      subtotal_amount: subtotalAmount,
      discount_amount: discountAmount,
      final_amount: finalAmount,
    };
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

async function confirmBooking(connection, bookingId) {
  const [tickets] = await bookingsRepository.getSeatsForBooking(connection, bookingId);

  if (tickets.length === 0) {
    throw new AppError("No tickets found for this booking", 404);
  }

  await bookingsRepository.updateStatus(connection, bookingId, "confirmed");
}

function assertCanAccessBooking(currentUser, booking) {
  const isOwner = currentUser.customer_id === Number(booking.customer_id);
  const isAdmin = currentUser.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new AppError("Forbidden", 403);
  }
}

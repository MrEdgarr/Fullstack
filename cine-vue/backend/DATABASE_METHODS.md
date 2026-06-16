# DATABASE METHODS - Cine Vue Backend

Tài liệu này ghi lại các phương thức backend đang dùng để làm việc với từng bảng trong database.

Quy ước:

- `db.execute(...)`: dùng cho query thông thường, không cần transaction.
- `connection.query(...)`: dùng bên trong transaction, thường xuất hiện ở luồng booking/thanh toán để khóa dữ liệu và đảm bảo an toàn.
- `FOR UPDATE`: khóa dòng dữ liệu trong transaction, tránh nhiều người đặt cùng một ghế cùng lúc.

---

## 1. `customers`

**Tác dụng bảng:** lưu thông tin tài khoản khách hàng/admin.

**Repository chính:**

```txt
src/modules/customers/customers.repository.js
```

| Method | Comment tác dụng |
|---|---|
| `getByEmail(email)` | Tìm user theo email, dùng cho đăng nhập và kiểm tra email đã tồn tại. |
| `getById(id)` | Lấy thông tin customer theo `customer_id`. |
| `create(full_name, email, phone, password_hash, avatar_url, date_of_birth)` | Tạo tài khoản khách hàng mới. |
| `update(id, full_name, email, phone, avatar_url, date_of_birth)` | Cập nhật thông tin cá nhân của customer. |

---

## 2. `cities`

**Tác dụng bảng:** lưu danh sách thành phố/khu vực có rạp chiếu.

**Repository chính:**

```txt
src/modules/cities/cities.repository.js
```

| Method | Comment tác dụng |
|---|---|
| `getAll()` | Lấy toàn bộ thành phố, sắp xếp theo tên. |
| `getById(id)` | Lấy một thành phố theo `city_id`. |
| `create(city_name, country, province_code)` | Thêm thành phố mới. |
| `update(id, city_name, country, province_code)` | Cập nhật thông tin thành phố. |
| `delete(id)` | Xóa thành phố theo `city_id`. |

---

## 3. `cinema_brands`

**Tác dụng bảng:** lưu thương hiệu rạp, ví dụ CGV, Lotte, Galaxy.

**Repository chính:**

```txt
src/modules/brands/brands.repository.js
```

| Method | Comment tác dụng |
|---|---|
| `getAll()` | Lấy toàn bộ thương hiệu rạp. |
| `getById(id)` | Lấy thương hiệu theo `brand_id`. |
| `create(brand_name, logo_url)` | Tạo thương hiệu rạp mới. |
| `update(id, brand_name, logo_url)` | Cập nhật tên/logo thương hiệu. |
| `delete(id)` | Xóa thương hiệu rạp. |

---

## 4. `cinemas`

**Tác dụng bảng:** lưu từng chi nhánh rạp cụ thể.

**Repository chính:**

```txt
src/modules/cinemas/cinemas.repository.js
```

| Method | Comment tác dụng |
|---|---|
| `getAll()` | Lấy danh sách rạp, join thêm brand và city để hiển thị đầy đủ. |
| `getById(id)` | Lấy một rạp theo `cinema_id`. |
| `create(brand_id, cinema_name, city_id, address, phone)` | Tạo chi nhánh rạp mới. |
| `update(id, brand_id, cinema_name, city_id, address, phone)` | Cập nhật thông tin rạp. |
| `delete(id)` | Xóa rạp theo `cinema_id`. |

**Liên kết chính:**

```txt
cinemas.brand_id -> cinema_brands.brand_id
cinemas.city_id  -> cities.city_id
```

---

## 5. `screening_rooms`

**Tác dụng bảng:** lưu phòng chiếu thuộc từng rạp.

**Repository chính:**

```txt
src/modules/rooms/rooms.repository.js
```

| Method | Comment tác dụng |
|---|---|
| `getAll()` | Lấy toàn bộ phòng chiếu. |
| `getById(id)` | Lấy phòng chiếu theo `room_id`. |
| `create(cinema_id, room_name, room_type)` | Tạo phòng chiếu mới cho một rạp. |
| `update(id, room_name, room_type)` | Cập nhật tên phòng hoặc loại phòng. |
| `delete(id)` | Xóa phòng chiếu. |

**Liên kết chính:**

```txt
screening_rooms.cinema_id -> cinemas.cinema_id
```

---

## 6. `seats`

**Tác dụng bảng:** lưu ghế gốc của từng phòng chiếu.

**Repository chính:**

```txt
src/modules/seats/seats.repository.js
```

| Method | Comment tác dụng |
|---|---|
| `getByRoom(room_id)` | Lấy danh sách ghế thuộc một phòng. |
| `create(room_id, row_letter, seat_number, seat_type)` | Tạo ghế mới trong phòng. |
| `updateStatus(seat_id, status)` | Cập nhật trạng thái ghế gốc, ví dụ active/maintenance. |
| `delete(seat_id)` | Xóa ghế theo `seat_id`. |

**Liên kết chính:**

```txt
seats.room_id -> screening_rooms.room_id
```

---

## 7. `movies`

**Tác dụng bảng:** lưu thông tin phim.

**Repository chính:**

```txt
src/modules/movies/movies.repository.js
```

| Method | Comment tác dụng |
|---|---|
| `getAll()` | Lấy toàn bộ phim, sắp xếp theo ngày phát hành. |
| `getNowShowing()` | Lấy phim đang chiếu. |
| `getUpcoming()` | Lấy phim sắp chiếu. |
| `getById(id)` | Lấy chi tiết phim theo `movie_id`. |
| `getByStatus(status)` | Lấy phim theo trạng thái: upcoming/now_showing/ended. |
| `create(...)` | Thêm phim mới. |
| `update(...)` | Cập nhật thông tin phim. |
| `delete(id)` | Xóa phim theo `movie_id`. |

---

## 8. `showtimes`

**Tác dụng bảng:** lưu suất chiếu của phim trong từng phòng.

**Repository chính:**

```txt
src/modules/showtimes/showtimes.repository.js
```

| Method | Comment tác dụng |
|---|---|
| `getAll()` | Lấy toàn bộ lịch chiếu dạng phẳng. |
| `getByMovie(movie_id)` | Lấy lịch chiếu phẳng theo phim.  |
| `getMovieScheduleRows(movieId, filters)` | Lấy lịch chiếu phẳng theo phim và filter; dùng cho API tree của `MovieTicket.vue`. |
| `getMovieScheduleOptionRows(movieId)` | Lấy dữ liệu option cho trang chi tiết phim, ví dụ city/cinema dropdown. |
| `getScheduleRows(filters)` | Lấy lịch chiếu phẳng theo filter tổng; dùng cho API tree của `ShowtimesView.vue`. |
| `getScheduleOptionRows()` | Lấy dữ liệu rộng để tạo dropdown phim/thành phố/rạp. |
| `create(movie_id, room_id, start_time, end_time, price_standard, price_vip, price_couple)` | Tạo suất chiếu mới. |
| `update(id, start_time, end_time, price_standard, price_vip, price_couple)` | Cập nhật thời gian/giá của suất chiếu. |
| `delete(id)` | Xóa suất chiếu. |

**Mapper liên quan:**

```txt
src/modules/showtimes/showtimes.mapper.js
```

| Method | Comment tác dụng |
|---|---|
| `mapMovieScheduleResponse(scheduleRows, optionRows, filters)` | Chuyển flat rows thành cây `brand -> cinema -> format -> slots`. |
| `mapScheduleResponse(scheduleRows, optionRows, filters)` | Chuyển flat rows thành cây `movie -> showtime groups -> times`. |

**Liên kết chính:**

```txt
showtimes.movie_id -> movies.movie_id
showtimes.room_id  -> screening_rooms.room_id
```

---

## 9. `showtime_seats`

**Tác dụng bảng:** lưu trạng thái ghế theo từng suất chiếu.

Khác với `seats`, bảng này cho biết ghế trong suất chiếu cụ thể đang:

```txt
available
held
booked
```

**Repository chính:**

```txt
src/modules/showtimes/showtime-seats.repository.js
src/modules/bookings/bookings.repository.js
```

| Method | Comment tác dụng |
|---|---|
| `showtimeSeatsRepository.getByShowtime(showtimeId)` | Lấy sơ đồ ghế của một suất chiếu để frontend hiển thị. |
| `showtimeSeatsRepository.seedForShowtime(showtimeId)` | Tạo dữ liệu ghế cho suất chiếu mới dựa trên ghế gốc trong phòng. |
| `bookingsRepository.getSelectedSeatsForUpdate(connection, showtimeId, seatIds)` | Khóa các ghế user chọn bằng `FOR UPDATE` để tránh tranh chấp. |
| `bookingsRepository.releaseExpiredSelectedSeats(connection, showtimeId, seatIds, now)` | Giải phóng ghế held đã hết hạn. |
| `bookingsRepository.holdSeats(connection, bookingId, expiresAt, showtimeId, seatIds)` | Giữ ghế tạm thời cho booking pending. |
| `bookingsRepository.getActiveHeldSeatsForBooking(connection, bookingId)` | Lấy ghế đang held còn hạn của một booking. |
| `bookingsRepository.markHeldSeatsBooked(connection, bookingId)` | Chuyển ghế từ held sang booked sau khi thanh toán thành công. |
| `bookingsRepository.releaseHeldSeats(connection, bookingId)` | Trả ghế về available nếu booking bị hủy. |
| `bookingsRepository.releaseExpiredHeldSeats(connection)` | Giải phóng toàn bộ ghế held đã hết hạn. |

**Liên kết chính:**

```txt
showtime_seats.showtime_id -> showtimes.showtime_id
showtime_seats.seat_id     -> seats.seat_id
held_by_booking_id         -> bookings.booking_id
```

---

## 10. `promotions`

**Tác dụng bảng:** lưu mã khuyến mãi.

**Repository chính:**

```txt
src/modules/promotions/promotions.repository.js
src/modules/bookings/bookings.repository.js
```

| Method | Comment tác dụng |
|---|---|
| `promotionsRepository.getActiveByCode(code)` | Kiểm tra mã khuyến mãi active cho frontend validate. |
| `bookingsRepository.getPromotionForUpdate(connection, promotionCode)` | Lấy promotion trong transaction khi tạo booking, tránh tính sai khuyến mãi. |

---

## 11. `bookings`

**Tác dụng bảng:** lưu đơn đặt vé tổng.

Một booking chứa:

```txt
customer_id
showtime_id
promotion_id
status
subtotal_amount
discount_amount
final_amount
expires_at
```

**Repository chính:**

```txt
src/modules/bookings/bookings.repository.js
```

| Method | Comment tác dụng |
|---|---|
| `getByCustomer(customerId)` | Lấy danh sách booking của một khách hàng. |
| `getById(bookingId)` | Lấy booking theo `booking_id`. |
| `getByIdForUpdate(connection, bookingId)` | Khóa booking trong transaction để cập nhật an toàn. |
| `create(...)` | Tạo booking pending sau khi kiểm tra ghế/combo/promotion. |
| `updateStatus(connection, bookingId, status)` | Cập nhật trạng thái booking. |
| `delete(connection, bookingId)` | Xóa booking, thường dùng khi thanh toán lỗi trước khi xác nhận. |
| `getExpiredHeldBookingIds(connection)` | Lấy các booking có ghế held đã hết hạn. |
| `cancelPendingBookings(connection, bookingIds)` | Hủy các booking pending đã hết hạn. |

**Trạng thái chính:**

```txt
pending
confirmed
cancelled
completed
```

---

## 12. `tickets`

**Tác dụng bảng:** lưu vé thật sau khi thanh toán thành công.

Nếu khách đặt 2 ghế, bảng `tickets` sẽ có 2 dòng.

**Repository chính:**

```txt
src/modules/tickets/tickets.repository.js
src/modules/bookings/bookings.repository.js
```

| Method | Comment tác dụng |
|---|---|
| `ticketsRepository.getByBooking(booking_id)` | Lấy danh sách vé/ghế theo booking. |
| `ticketsRepository.create(booking_id, showtime_seat_id, actual_price)` | Tạo ticket thủ công, hiện dành cho admin. |
| `ticketsRepository.delete(ticket_id)` | Xóa ticket theo `ticket_id`, hiện dành cho admin. |
| `bookingsRepository.createTicketsFromHeldSeats(connection, bookingId)` | Tạo ticket tự động từ các ghế held khi payment success. |

**Liên kết chính:**

```txt
tickets.booking_id        -> bookings.booking_id
tickets.showtime_seat_id  -> showtime_seats.showtime_seat_id
tickets.seat_id           -> seats.seat_id
```

---

## 13. `payment_methods`

**Tác dụng bảng:** lưu danh sách phương thức thanh toán để frontend hiển thị.

Ví dụ:

```txt
Thẻ ATM / Thẻ quốc tế
ShopeePay
Apple Pay
Ví MoMo
Payoo
```

**Repository chính:**

```txt
src/modules/payments/payments.repository.js
```

| Method | Comment tác dụng |
|---|---|
| `getMethods()` | Lấy danh sách payment methods active cho frontend. |
| `getActiveMethodByPaymentMethod(paymentMethod)` | Kiểm tra phương thức thanh toán có tồn tại và đang active trước khi tạo payment. |

---

## 14. `payments`

**Tác dụng bảng:** lưu giao dịch thanh toán của booking.

**Repository chính:**

```txt
src/modules/payments/payments.repository.js
```

| Method | Comment tác dụng |
|---|---|
| `getByBooking(bookingId)` | Lấy giao dịch thanh toán theo booking. |
| `create(connection, bookingId, amount, paymentMethod, transactionId)` | Tạo giao dịch thanh toán pending. |
| `getByIdForUpdate(connection, paymentId)` | Khóa payment trong transaction để cập nhật trạng thái an toàn. |
| `updateStatus(connection, paymentId, status)` | Cập nhật trạng thái payment, ví dụ pending/success/failed. |

**Liên kết chính:**

```txt
payments.booking_id -> bookings.booking_id
```

---

## 15. `food_combos`

**Tác dụng bảng:** lưu combo bắp nước theo từng rạp.

**Repository chính:**

```txt
src/modules/combos/combos.repository.js
src/modules/bookings/bookings.repository.js
```

| Method | Comment tác dụng |
|---|---|
| `combosRepository.getActive()` | Lấy danh sách combo đang active. |
| `bookingsRepository.getActiveCombosForUpdate(connection, comboIds)` | Khóa combo trong transaction khi tạo booking để đảm bảo giá/rap hợp lệ. |

**Liên kết chính:**

```txt
food_combos.cinema_id -> cinemas.cinema_id
```

---

## 16. `booking_food_combos`

**Tác dụng bảng:** lưu combo mà khách đã chọn trong một booking.

**Repository chính:**

```txt
src/modules/bookings/bookings.repository.js
```

| Method | Comment tác dụng |
|---|---|
| `createFoodComboLines(connection, comboValues)` | Ghi các combo khách đã chọn vào booking. |

**Liên kết chính:**

```txt
booking_food_combos.booking_id     -> bookings.booking_id
booking_food_combos.food_combo_id  -> food_combos.food_combo_id
```

---

# Luồng bảng khi đặt vé

```txt
customers
   ↓
bookings
   ↓
showtimes -> movies
   ↓
screening_rooms -> cinemas -> cinema_brands / cities
   ↓
showtime_seats -> seats
   ↓
tickets
   ↓
payments
   ↓
booking_food_combos -> food_combos
```

---

# Luồng method khi khách đặt vé

```txt
1. Frontend gửi showtime_id + showtime_seat_ids + combos + promotion_code

2. bookingsRepository.getSelectedSeatsForUpdate()
   // Khóa ghế user chọn để tránh người khác đặt cùng lúc.

3. bookingsRepository.releaseExpiredSelectedSeats()
   // Trả các ghế held đã hết hạn về available.

4. bookingsRepository.getShowtimeCinema()
   // Kiểm tra suất chiếu thuộc rạp nào để validate combo.

5. bookingsRepository.getActiveCombosForUpdate()
   // Kiểm tra combo có tồn tại và thuộc đúng rạp không.

6. bookingsRepository.getPromotionForUpdate()
   // Kiểm tra mã khuyến mãi nếu có.

7. bookingsRepository.create()
   // Tạo booking pending.

8. bookingsRepository.holdSeats()
   // Giữ ghế tạm thời cho booking.

9. bookingsRepository.createFoodComboLines()
   // Lưu combo đã chọn.

10. paymentsRepository.create()
    // Tạo payment pending.

11. paymentsRepository.updateStatus()
    // Cập nhật payment success.

12. bookingsRepository.createTicketsFromHeldSeats()
    // Tạo vé thật từ ghế held.

13. bookingsRepository.markHeldSeatsBooked()
    // Đánh dấu ghế là booked.

14. bookingsRepository.updateStatus()
    // Chuyển booking sang confirmed.
```


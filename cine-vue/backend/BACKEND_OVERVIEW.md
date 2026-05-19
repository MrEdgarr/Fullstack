# Backend - Giới thiệu và cách hoạt động

## 1. Vai trò của backend

`backend/` là API server cho hệ thống đặt vé xem phim. Nó chịu trách nhiệm:

- xác thực người dùng bằng JWT;
- quản lý phim, rạp, phòng chiếu, ghế và suất chiếu;
- xử lý booking, giữ ghế, combo, khuyến mãi, thanh toán và vé;
- làm việc với MySQL và Cloudinary.

Backend dùng Express và chạy từ `bin/www`.

## 2. Kiến trúc hiện tại

Backend đã được tổ chức theo **module-based architecture**: mỗi nghiệp vụ nằm gần nhau trong cùng một folder, còn phần dùng chung được gom vào `shared/`.

```text
backend/
├─ app.js
├─ bin/www
├─ scripts/
├─ sql/
└─ src/
   ├─ modules/
   │  ├─ auth/
   │  ├─ bookings/
   │  ├─ movies/
   │  ├─ payments/
   │  └─ ...
   ├─ shared/
   │  ├─ config/
   │  ├─ middleware/
   │  └─ utils/
   └─ routes/
      └─ index.js
```

Một module thường gồm:

| File | Vai trò |
| --- | --- |
| `*.routes.js` | Khai báo endpoint |
| `*.controller.js` | Nhận request, gọi service/repository, trả response |
| `*.service.js` | Chứa business logic khi nghiệp vụ đủ phức tạp |
| `*.repository.js` | Chứa truy vấn SQL |
| `*.validation.js` | Chứa Joi schema |

Không phải module nào cũng cần service riêng. Ví dụ `brands` đơn giản nên controller có thể gọi repository trực tiếp; còn `bookings`, `payments`, `movies` có logic phức tạp nên có service để tách rõ nghiệp vụ.

## 3. Luồng xử lý request

```text
Request
  ↓
app.js
  ↓
middleware chung: helmet, cors, logger, body parser, rate limit
  ↓
src/routes/index.js
  ↓
module route
  ↓
middleware theo route: auth, role, validate, upload
  ↓
controller
  ↓
service (nếu có)
  ↓
repository
  ↓
MySQL
  ↓
JSON response
```

Ví dụ:

- `POST /api/v1/auth/login`
  - route: `modules/auth/auth.routes.js`
  - controller: `auth.controller.js`
  - service: `auth.service.js`
  - repository: `modules/customers/customers.repository.js`

- `GET /api/v1/movies/now-showing`
  - route: `modules/movies/movies.routes.js`
  - controller: `movies.controller.js`
  - repository: `movies.repository.js`

## 4. Các nhóm API chính

| Nhóm | Vai trò |
| --- | --- |
| `/auth` | đăng ký, đăng nhập |
| `/brands`, `/cities`, `/cinemas`, `/rooms`, `/seats` | dữ liệu cấu trúc rạp |
| `/movies` | phim |
| `/showtimes` | suất chiếu và ghế theo suất |
| `/bookings` | tạo booking, xem booking, cập nhật trạng thái |
| `/payments` | tạo payment, cập nhật trạng thái thanh toán |
| `/tickets` | vé |
| `/combos` | combo đồ ăn đang hoạt động |
| `/promotions` | kiểm tra mã khuyến mãi |

## 5. Luồng đặt vé

### Tạo suất chiếu

Khi admin tạo suất chiếu:

1. tạo bản ghi trong `showtimes`;
2. sinh snapshot ghế vào `showtime_seats`;
3. gán giá theo từng loại ghế: standard, vip, couple.

### Tạo booking

Khi khách chọn ghế:

1. mở transaction;
2. khóa ghế được chọn bằng `SELECT ... FOR UPDATE`;
3. giải phóng các hold đã hết hạn;
4. kiểm tra ghế còn khả dụng;
5. tính tiền vé, combo và khuyến mãi;
6. tạo booking trạng thái `pending`;
7. giữ ghế trong 10 phút;
8. commit transaction.

### Thanh toán

Khi tạo payment:

1. kiểm tra booking thuộc đúng người dùng;
2. kiểm tra booking còn `pending` và chưa hết hạn giữ ghế;
3. kiểm tra số tiền khớp `final_amount`;
4. lưu payment.

Khi payment chuyển sang `success`:

1. tạo ticket từ ghế đang hold;
2. chuyển ghế sang `booked`;
3. chuyển booking sang `confirmed`.

## 6. Bảo mật và kiểm soát quyền

Backend hiện có:

- JWT cho route cần đăng nhập;
- role middleware cho route admin;
- Joi validation theo từng module;
- CORS whitelist qua `FRONTEND_URLS`;
- `helmet` và rate limit;
- kiểm tra quyền sở hữu booking/payment/ticket để người dùng không thao tác dữ liệu của người khác.

## 7. Database

Schema chính:

```text
sql/lean_ticketing_schema.mysql.sql
```

Các bảng quan trọng:

| Nhóm | Bảng |
| --- | --- |
| Người dùng | `customers` |
| Rạp | `cities`, `cinema_brands`, `cinemas`, `screening_rooms`, `seats` |
| Phim | `movies`, `showtimes`, `showtime_seats` |
| Giao dịch | `bookings`, `payments`, `tickets` |
| Bán kèm | `food_combos`, `booking_food_combos`, `promotions` |

`showtime_seats` là bảng quan trọng nhất trong nghiệp vụ đặt vé vì nó lưu trạng thái ghế theo **từng suất chiếu**, không phải chỉ theo ghế vật lý.

## 8. Cách chạy

```bash
yarn start
```

Khi phát triển:

```bash
yarn dev
```

Script hỗ trợ:

```bash
yarn import-schema
yarn seed:demo
yarn expire-holds
```

`yarn seed:demo` thêm dữ liệu mẫu cho database: rạp, phòng, ghế, phim, suất chiếu, combo, mã khuyến mãi và một booking demo đã thanh toán.

## 9. Các biến môi trường chính

Xem mẫu trong `.env.example`.

Nhóm biến quan trọng:

- `DB_*`: kết nối MySQL/Aiven;
- `JWT_SECRET`: ký token đăng nhập;
- `FRONTEND_URLS`: danh sách frontend được phép gọi API;
- `CLOUDINARY_*`: upload ảnh phim.

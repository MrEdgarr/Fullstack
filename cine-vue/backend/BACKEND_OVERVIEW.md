# Backend Cine Vue - Giới thiệu và cách hoạt động

## 1. Tổng quan

`backend/` là API server của ứng dụng đặt vé xem phim Cine Vue. Backend được xây dựng bằng **Node.js**, **Express** và **MySQL**, cung cấp dữ liệu và xử lý nghiệp vụ cho frontend Vue.

Các trách nhiệm chính:

- đăng ký, đăng nhập và xác thực người dùng bằng JWT;
- quản lý phim, rạp, phòng chiếu, ghế và suất chiếu;
- xử lý đặt vé, giữ ghế, thanh toán, combo và khuyến mãi;
- bảo đảm không có hai khách hàng đặt cùng một ghế trong cùng suất chiếu;
- kết nối database MySQL, hiện có thể dùng với Clever Cloud;
- hỗ trợ upload hình ảnh thông qua Cloudinary.

Điểm khởi động của ứng dụng là:

```text
bin/www -> app.js -> src/routes/index.js
```

## 2. Công nghệ sử dụng

| Thành phần    | Công nghệ                        |
| ------------- | -------------------------------- |
| Runtime       | Node.js                          |
| Web framework | Express                          |
| Database      | MySQL qua `mysql2`               |
| Xác thực      | JWT, bcryptjs                    |
| Validation    | Joi                              |
| Security      | Helmet, CORS, express-rate-limit |
| Upload ảnh    | Multer, Cloudinary               |
| Development   | Nodemon                          |

## 3. Cấu trúc thư mục

Backend được tổ chức theo **module nghiệp vụ**. Mỗi module chứa các file liên quan đến một chức năng, thay vì tách tất cả controller/service/repository vào các folder lớn riêng biệt.

```text
backend/
├── app.js
├── bin/
│   └── www
├── scripts/
│   └── expire-held-seats.js
├── sql/
│   └── lean_ticketing_schema.mysql.sql
└── src/
    ├── modules/
    │   ├── auth/
    │   ├── bookings/
    │   ├── brands/
    │   ├── cinemas/
    │   ├── cities/
    │   ├── combos/
    │   ├── customers/
    │   ├── movies/
    │   ├── payments/
    │   ├── promotions/
    │   ├── rooms/
    │   ├── seats/
    │   ├── showtimes/
    │   └── tickets/
    ├── routes/
    │   └── index.js
    └── shared/
        ├── config/
        ├── middleware/
        └── utils/
```

### Cấu trúc trong một module

| Loại file         | Vai trò                                                        |
| ----------------- | -------------------------------------------------------------- |
| `*.routes.js`     | Khai báo endpoint và middleware áp dụng cho endpoint           |
| `*.controller.js` | Nhận request, gọi tầng xử lý và trả response                   |
| `*.service.js`    | Chứa nghiệp vụ phức tạp, transaction và kiểm tra business rule |
| `*.repository.js` | Thực hiện truy vấn MySQL                                       |
| `*.validation.js` | Kiểm tra dữ liệu đầu vào bằng Joi                              |

Module đơn giản có thể không cần `service`. Các module nhạy cảm về nghiệp vụ như `bookings` và `payments` sử dụng service để kiểm soát transaction và trạng thái dữ liệu.

## 4. Luồng xử lý request

```text
Client request
  ↓
app.js
  ↓
Middleware chung: Helmet, CORS, logger, body parser, rate limit
  ↓
src/routes/index.js
  ↓
Route của module
  ↓
Middleware theo chức năng: auth, role, validation
  ↓
Controller
  ↓
Service (nếu nghiệp vụ cần xử lý)
  ↓
Repository
  ↓
MySQL database
  ↓
JSON response
```

Ví dụ đăng nhập:

```text
POST /api/v1/auth/login
  → auth.routes.js
  → auth.controller.js
  → auth.service.js
  → customers.repository.js
  → database
```

## 5. API chính

Backend được mount tại prefix:

```text
/api/v1
```

| Endpoint group | Chức năng                              |
| -------------- | -------------------------------------- |
| `/auth`        | Đăng ký, đăng nhập                     |
| `/brands`      | Thương hiệu rạp                        |
| `/cities`      | Thành phố                              |
| `/cinemas`     | Rạp chiếu phim                         |
| `/rooms`       | Phòng chiếu                            |
| `/seats`       | Ghế vật lý trong phòng                 |
| `/movies`      | Danh sách và thông tin phim            |
| `/showtimes`   | Suất chiếu và sơ đồ ghế của suất chiếu |
| `/bookings`    | Tạo, hủy và theo dõi booking           |
| `/payments`    | Tạo và xác nhận thanh toán             |
| `/tickets`     | Thông tin vé                           |
| `/combos`      | Combo đồ ăn/thức uống                  |
| `/promotions`  | Mã khuyến mãi                          |

Health check hiện được khai báo tại:

```text
GET /
```

Ví dụ local:

```text
http://localhost:3000/
```

Lưu ý: `GET /api/v1/` hiện chưa có route gốc riêng, nên có thể trả về `Not Found`. Hãy kiểm tra API bằng endpoint cụ thể như:

```text
GET /api/v1/showtimes
GET /api/v1/movies/now-showing
```

## 6. Logic đặt ghế và đặt vé

### 6.1. Ghế theo suất chiếu

Bảng `seats` mô tả ghế vật lý của một phòng chiếu. Bảng `showtime_seats` mô tả trạng thái của từng ghế trong **mỗi suất chiếu**.

Một ghế có thể:

| Trạng thái  | Ý nghĩa                            |
| ----------- | ---------------------------------- |
| `available` | Có thể chọn                        |
| `held`      | Đang được một booking giữ tạm thời |
| `booked`    | Đã thanh toán/đặt thành công       |

Frontend lấy sơ đồ ghế thật qua:

```http
GET /api/v1/showtimes/:id/seats
```

Khi đọc seat map, backend giải phóng các ghế `held` đã hết hạn trước khi trả dữ liệu.

### 6.2. Tạo booking

Khi người dùng thanh toán các ghế đã chọn, frontend gửi:

```http
POST /api/v1/bookings
Authorization: Bearer <token>
```

Payload chính:

```json
{
  "showtime_id": 1,
  "showtime_seat_ids": [10, 11],
  "food_combos": [
    {
      "food_combo_id": 1,
      "quantity": 1
    }
  ],
  "promotion_code": "WELCOME10"
}
```

Backend xử lý trong transaction:

1. khóa các ghế đã chọn bằng `SELECT ... FOR UPDATE`;
2. giải phóng hold cũ đã hết hạn trên các ghế đó;
3. kiểm tra ghế chưa bị giữ hoặc đặt bởi booking khác;
4. tính tiền vé, combo và khuyến mãi;
5. tạo booking với trạng thái `pending`;
6. chuyển các ghế sang `held` trong 10 phút;
7. commit transaction.

Cách xử lý này ngăn hai request đồng thời cùng đặt một ghế.

### 6.3. Thanh toán và xác nhận vé

Khi booking đã được tạo, frontend gửi payment:

```http
POST /api/v1/payments
```

Backend kiểm tra:

- booking thuộc người dùng đang đăng nhập;
- booking vẫn còn trạng thái `pending`;
- thời hạn giữ ghế chưa hết;
- số tiền thanh toán bằng `final_amount` của booking.

Khi payment được chuyển sang `success`:

```http
PUT /api/v1/payments/:id/status
```

Backend sẽ:

1. tạo bản ghi `tickets` từ các ghế đang được giữ;
2. chuyển ghế từ `held` sang `booked`;
3. chuyển booking từ `pending` sang `confirmed`.

### 6.4. Dọn ghế giữ quá hạn

Ngoài việc tự dọn khi đọc sơ đồ ghế, backend có script:

```bash
yarn expire-holds
```

Script này giải phóng các ghế giữ quá 10 phút và hủy booking `pending` tương ứng. Khi deploy production, có thể chạy script bằng cron job định kỳ.

## 7. Database

File SQL chính:

```text
sql/lean_ticketing_schema.mysql.sql
```

File này hiện chứa:

- toàn bộ cấu trúc bảng;
- khóa ngoại và constraint;
- dữ liệu mẫu về khách hàng, rạp, phòng, ghế, phim, suất chiếu;
- combo, khuyến mãi;
- booking và payment mẫu.

### Các bảng quan trọng

| Nhóm                   | Bảng                                                             |
| ---------------------- | ---------------------------------------------------------------- |
| Người dùng             | `customers`                                                      |
| Hệ thống rạp           | `cities`, `cinema_brands`, `cinemas`, `screening_rooms`, `seats` |
| Nội dung và lịch chiếu | `movies`, `showtimes`, `showtime_seats`                          |
| Đặt vé                 | `bookings`, `tickets`, `payments`                                |
| Bán kèm                | `food_combos`, `booking_food_combos`, `promotions`               |

### Import database

Backend không còn sử dụng Node.js để import database. Khi tạo database mới, import trực tiếp file:

```text
sql/lean_ticketing_schema.mysql.sql
```

bằng công cụ MySQL client hoặc giao diện quản trị database phù hợp.

## 8. Kết nối MySQL / Clever Cloud

Kết nối runtime nằm tại:

```text
src/shared/config/database-env.js
src/shared/config/database.js
```

Biến của Clever Cloud

```env
MYSQL_ADDON_HOST=
MYSQL_ADDON_PORT=
MYSQL_ADDON_USER=
MYSQL_ADDON_PASSWORD=
MYSQL_ADDON_DB=
DB_TIMEZONE=Z
```

## 9. Bảo mật và phân quyền

Backend hiện áp dụng:

- JWT cho endpoint yêu cầu đăng nhập;
- middleware kiểm tra role cho chức năng quản trị;
- Joi validation cho body request;
- CORS whitelist qua biến `FRONTEND_URLS`;
- Helmet để bổ sung HTTP security headers;
- rate limit cho API;
- kiểm tra quyền sở hữu booking và payment.

Các biến bí mật như password database, JWT secret và Cloudinary secret không được commit lên GitHub.

## 10. Biến môi trường chính

Tham khảo file:

```text
.env.example
```

| Biến            | Công dụng                                |
| --------------- | ---------------------------------------- |
| `PORT`          | Port backend khi chạy local              |
| `MYSQL_ADDON_*` | Kết nối MySQL                            |
| `DB_TIMEZONE`   | Timezone sử dụng khi đọc/ghi database    |
| `JWT_SECRET`    | Khóa ký token đăng nhập                  |
| `FRONTEND_URLS` | Danh sách URL frontend được phép gọi API |
| `CLOUDINARY_*`  | Thông tin upload hình ảnh                |

Ví dụ khi deploy frontend trên Vercel:

```env
FRONTEND_URLS=http://localhost:5173,https://your-project.vercel.app
```

## 11. Chạy backend

Cài dependencies:

```bash
yarn install
```

Chạy chế độ development:

```bash
yarn dev
```

Chạy chế độ production:

```bash
yarn start
```

Backend local mặc định truy cập tại:

```text
http://localhost:3000/
```

## 12. Deploy hiện tại

Kiến trúc deploy dự kiến:

| Thành phần      | Dịch vụ      |
| --------------- | ------------ |
| Frontend Vue    | Vercel       |
| Backend Express | Render       |
| MySQL Database  | Clever Cloud |

Khi deploy backend trên Render:

1. đặt Root Directory là `cine-vue/backend`;
2. cấu hình biến môi trường kết nối Clever Cloud;
3. cấu hình `FRONTEND_URLS` chứa domain Vercel;
4. redeploy backend sau mỗi lần thay đổi environment variable.

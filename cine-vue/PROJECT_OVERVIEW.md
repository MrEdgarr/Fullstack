# Cine Vue - Tổng quan dự án

## 1. Dự án này là gì?

`cine-vue` là một dự án web đặt vé xem phim theo mô hình tách riêng:

- `backend`: cung cấp REST API cho dữ liệu phim, rạp, suất chiếu, đặt vé, thanh toán và xác thực.
- `frontend`: cung cấp giao diện người dùng bằng Vue 3 cho trang chủ, lịch chiếu, đăng nhập và luồng đặt vé.

Mục tiêu của dự án là mô phỏng một hệ thống bán vé rạp phim có các thành phần thực tế như:

- quản lý phim, rạp, phòng chiếu và ghế;
- giữ ghế theo từng suất chiếu;
- tạo booking, áp dụng mã giảm giá, chọn combo;
- ghi nhận thanh toán và phát hành vé sau khi thanh toán thành công.

## 2. Công nghệ chính

| Khu vực | Công nghệ |
| --- | --- |
| Backend | Node.js, Express, MySQL, JWT, Joi, Cloudinary |
| Frontend | Vue 3, Vite, Pinia, Vue Router, Axios, Tailwind CSS, DaisyUI |
| Điều phối khi phát triển | `concurrently` ở thư mục gốc để chạy frontend và backend cùng lúc |

## 3. Cấu trúc thư mục

```text
cine-vue/
├─ backend/                  # API, nghiệp vụ, database schema
├─ frontend/                 # Ứng dụng Vue 3
├─ package.json              # Script chạy cả hai phần cùng lúc
├─ PROJECT_OVERVIEW.md       # Tài liệu tổng quan này
```

Tài liệu chi tiết hơn:

- `backend/BACKEND_OVERVIEW.md`
- `frontend/FRONTEND_OVERVIEW.md`

## 4. Cách toàn bộ hệ thống hoạt động

### 4.1. Luồng tổng quát

```text
Người dùng
   ↓
Frontend Vue
   ↓ gọi API qua Axios
Backend Express
   ↓
MySQL
```

Frontend hiển thị giao diện, quản lý trạng thái bằng Pinia và gọi API qua `src/_services/api.js`.
Backend nhận request ở `/api/v1`, đi qua middleware, route, controller, query layer rồi thao tác với MySQL.

### 4.2. Luồng người dùng điển hình

1. Người dùng mở frontend.
2. Trang chủ gọi API để lấy phim đang chiếu và phim sắp chiếu.
3. Người dùng đăng nhập, backend trả về JWT.
4. Khi cần gọi endpoint được bảo vệ, frontend tự đính kèm token vào header `Authorization`.
5. Với luồng đặt vé phía backend:
   - lấy danh sách ghế theo suất chiếu;
   - tạo booking;
   - khóa các ghế đã chọn bằng transaction;
   - chuyển ghế sang trạng thái `held`;
   - áp dụng combo và mã khuyến mãi;
   - tạo payment;
   - khi payment thành công, booking được xác nhận, ghế chuyển sang `booked`, vé được tạo.

### 4.3. Cách backend bảo vệ dữ liệu đặt ghế

Phần đặt vé là lõi quan trọng nhất của hệ thống:

- `showtime_seats` là nguồn sự thật cho trạng thái ghế theo từng suất chiếu.
- Khi tạo booking, backend dùng `SELECT ... FOR UPDATE` trong transaction để tránh hai người cùng giữ một ghế.
- Ghế được giữ trong 10 phút bằng trạng thái `held` và trường `held_until`.
- Script `yarn expire-holds` dùng để giải phóng các ghế giữ quá hạn.

## 5. Trạng thái tích hợp hiện tại

Dự án đã có backend khá đầy đủ cho nghiệp vụ thật, nhưng frontend hiện vẫn là bản lai giữa dữ liệu thật và dữ liệu mock.

| Phần | Trạng thái hiện tại |
| --- | --- |
| Đăng nhập | Đã gọi API backend |
| Danh sách phim trang chủ | Đã gọi API backend |
| Lịch chiếu | Đang dùng dữ liệu mock |
| Chọn ghế | Đang dùng dữ liệu mock |
| Combo, voucher, phương thức thanh toán | Đang dùng dữ liệu mock |
| Booking end-to-end từ frontend sang backend | Chưa nối hoàn chỉnh |

Điểm này rất quan trọng khi đọc code: backend đã có luồng nghiệp vụ tương đối thực tế, nhưng frontend hiện chủ yếu thể hiện trải nghiệm giao diện và chưa tận dụng hết API backend.

## 6. Cách chạy dự án ở local

### 6.1. Chuẩn bị backend

1. Tạo file `.env` từ `.env.example` trong `backend/`.
2. Cấu hình MySQL và các biến môi trường cần thiết.
3. Import schema từ:

```text
backend/sql/lean_ticketing_schema.mysql.sql
```

### 6.2. Chuẩn bị frontend

1. Tạo file `.env` từ `.env.example` trong `frontend/`.
2. Kiểm tra biến:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### 6.3. Chạy cả hai phần

Từ thư mục gốc `cine-vue/`:

```bash
yarn dev
```

Script này sẽ chạy:

- frontend bằng Vite;
- backend bằng Express.


# Frontend - Giới thiệu và cách hoạt động

## 1. Vai trò của frontend

Thư mục `frontend/` là ứng dụng Vue 3 dành cho người dùng cuối. Nó cung cấp:

- trang chủ;
- trang lịch chiếu;
- trang chi tiết phim;
- modal đăng nhập, đăng ký và tìm kiếm;
- luồng đặt vé nhiều bước: chọn ghế, chọn combo, thanh toán.

Về mặt trải nghiệm, frontend đã có nhiều thành phần UI hoàn chỉnh. Tuy nhiên, ở trạng thái hiện tại, nó vẫn kết hợp cả API thật và dữ liệu mock.

## 2. Công nghệ chính

| Thành phần | Công nghệ |
| --- | --- |
| Framework | Vue 3 |
| Build tool | Vite |
| State management | Pinia |
| Routing | Vue Router |
| HTTP client | Axios |
| UI/CSS | Tailwind CSS, DaisyUI |
| Hỗ trợ DX | auto import, auto component registration, SVG loader |

## 3. Cấu trúc thư mục

```text
frontend/
├─ src/
│  ├─ assets/                    # CSS, icon, ảnh
│  ├─ components/
│  │  ├─ common/                 # component dùng lại
│  │  ├─ features/               # component theo tính năng
│  │  └─ layout/                 # navbar, footer, modal
│  ├─ composables/               # logic dùng lại, ví dụ kéo/zoom sơ đồ ghế
│  ├─ layouts/                   # layout chính
│  ├─ router/                    # cấu hình route
│  ├─ stores/                    # Pinia stores
│  ├─ utils/                     # helper và dữ liệu mock
│  ├─ views/                     # trang chính
│  ├─ _services/api.js           # cấu hình Axios
│  ├─ App.vue
│  └─ main.js
├─ vite.config.js
└─ FRONTEND_OVERVIEW.md
```

## 4. Cách frontend khởi động

```text
main.js
  ↓
createApp(App)
  ↓
gắn Pinia
  ↓
gắn Vue Router
  ↓
render App.vue
  ↓
RouterView hiển thị layout và view tương ứng
```

`ClientLayout.vue` là layout chính cho phía người dùng, gồm:

- `ClientNavbar`;
- `RouterView`;
- `ClientFooter`;
- các modal dùng chung như đăng nhập, đăng ký, tìm kiếm.

## 5. Router và các trang chính

Các route được khai báo trong `src/router/routes.js`.

| Route | Chức năng |
| --- | --- |
| `/` | trang chủ |
| `/movie/:slug` | trang chi tiết phim |
| `/movie/now-playing`, `/movie/coming-soon` | danh sách theo trạng thái |
| `/showtimes` | lịch chiếu |
| `/booking` | luồng đặt vé |
| `/blog`, `/news`, `/about` | trang nội dung |

## 6. Luồng dữ liệu hiện tại

### 6.1. Các store đã có lời gọi API thật

Các store sau đã có sẵn phần tích hợp với backend:

- `useAuthStore`
  - `POST /auth/login`
  - `POST /auth/register`
- `useMoviesStore`
  - `GET /movies`
  - `GET /movies/now-showing`
  - `GET /movies/upcoming`
  - `GET /movies/:id`

`src/_services/api.js` tự động:

- dùng `VITE_API_BASE_URL`;
- gắn JWT từ `localStorage`;
- xóa token và đưa người dùng về trang chủ khi gặp lỗi `401`.

### 6.2. Dữ liệu vẫn đang mock

Các phần sau hiện chưa nối vào backend thật:

| Tính năng | Nguồn dữ liệu hiện tại |
| --- | --- |
| Tìm kiếm phim | `utils/constants/Movie.js` |
| Lịch chiếu | `utils/constants/showtimesData.js` |
| Sơ đồ ghế | `utils/constants/seatsData.js` |
| Combo | `utils/constants/combosData.js` |
| Mã giảm giá | `utils/constants/promoCodes.js` |
| Phương thức thanh toán | `utils/constants/paymentData.js` |

Vì vậy, frontend hiện hoạt động tốt như một prototype giao diện, nhưng chưa phản ánh đầy đủ dữ liệu thật từ backend.

## 7. Luồng đặt vé trên frontend

### 7.1. Ba bước chính

`BookingView.vue` điều phối ba bước:

1. `BookingSeat`
2. `BookingFood`
3. `BookingPayment`

`useStepStore` quản lý bước hiện tại.

### 7.2. Chọn ghế

`BookingSeat.vue`:

- render sơ đồ ghế theo hàng;
- cho phép kéo, zoom bằng `useSeatMap`;
- phân biệt ghế thường, VIP, ghế đôi và ghế đã bán;
- dùng `useSeatStore` để chọn/bỏ chọn ghế.

`useSeatStore`:

- giới hạn tối đa 10 ghế;
- tự động chọn cả cặp với ghế đôi;
- tính tổng tiền ghế;
- lưu trạng thái vào `localStorage`.

### 7.3. Chọn combo và thanh toán

`useComboStore`:

- quản lý số lượng combo;
- tính tổng tiền đồ ăn.

`usePaymentStore`:

- lưu mã khuyến mãi;
- áp dụng phần trăm giảm giá;
- lưu phương thức thanh toán đang chọn.

`useBookingStore`:

- gom toàn bộ trạng thái booking;
- tính `totalPrice`, `voucherPrice`, `finalPrice`;
- reset toàn bộ khi hết thời gian hoặc rời trang.

### 7.4. Lưu trạng thái tạm thời

`utils/helpers/storage.js` lưu dữ liệu booking vào `localStorage` để:

- giữ lại bước hiện tại;
- giữ ghế/combo đã chọn khi reload;
- tự xóa dữ liệu sau thời gian hết hạn.

## 8. Cách chạy frontend

```bash
yarn dev
```

Build production:

```bash
yarn build
```

Biến môi trường mẫu:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

Trong `vite.config.js`, dev server còn cấu hình proxy:

```text
/api/v1 -> http://localhost:3000
```

## 9. Trạng thái hiện tại và điểm cần lưu ý

Frontend hiện đã có cấu trúc khá tốt cho một ứng dụng Vue 3 theo module tính năng, nhưng còn một số điểm chưa đồng bộ:

| Vấn đề | Ý nghĩa |
| --- | --- |
| `MovieDetail.vue` import `useMovieStore`, trong khi store hiện export `useMoviesStore` | Dễ gây lỗi khi chạy trang chi tiết phim |
| `MovieDetail.vue` gọi `setCurrentMovie`, nhưng store hiện tại không có action đó | Luồng chi tiết phim chưa khớp với store |
| `BookingSeat.vue` lấy `resetView` từ `useSeatMap`, nhưng composable chưa trả về hàm này | Có thể gây lỗi ở component sơ đồ ghế |
| `RegisterModal.vue` đang giả lập đăng ký thay vì gọi store thật và còn gọi `closeRegisterModal` chưa được khai báo | Luồng đăng ký chưa hoàn thiện |
| `BookingTicket.vue` đang hiển thị dữ liệu vé tĩnh | Chưa nối với dữ liệu booking/payment thật |
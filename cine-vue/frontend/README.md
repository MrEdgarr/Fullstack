# Cine-Vue (Frontend) 🎬

Đây là thư mục Front-end cho dự án **Website Đặt Vé Xem Phim (Cine-Vue)**. Dự án được xây dựng dựa trên các tiêu chuẩn hiện đại của Vue 3, mang lại trải nghiệm người dùng (UX) mượt mà, giao diện (UI) đẹp mắt và hiệu năng cao.

## 🛠 Tech Stack (Công nghệ sử dụng)

*   **Core Framework:** Vue 3 (Hoàn toàn sử dụng Composition API và cú pháp `<script setup>`).
*   **Build Tool:** Vite (Tốc độ build cực nhanh, HMR tức thời).
*   **State Management:** Pinia (Quản lý trạng thái gọn nhẹ, thay thế Vuex).
*   **Routing:** Vue Router.
*   **Styling:** Tailwind CSS kết hợp với DaisyUI (Cung cấp các component có sẵn với thiết kế hiện đại, dễ tùy biến).
*   **Carousel/Slider:** Swiper.js.
*   **HTTP Client:** Axios (Giao tiếp với Backend Node.js).

---

## 🚀 Tính năng nổi bật

1.  **Xác thực người dùng (Authentication):**
    *   Sử dụng Modal (Dialog) kết hợp JWT Token cho luồng Đăng nhập & Đăng ký.
    *   Hỗ trợ validation trực tiếp trên Form (sử dụng Regex cho Email, Số điện thoại VN, Mật khẩu mạnh, v.v.).

2.  **Đặt vé xem phim (Booking Flow):**
    *   Trải nghiệm chọn ghế trực quan (Hỗ trợ Ghế Đơn, Ghế Đôi, Giới hạn tối đa 10 ghế).
    *   Đồng bộ hóa dữ liệu phiên đặt vé (Lưu tạm thời bằng LocalStorage để không mất dữ liệu khi vô tình F5).
    *   Xử lý ngắt quãng: Tự động hết hạn phiên đặt vé và khóa chức năng chọn ghế nếu suất chiếu đã quá giờ hoặc hết thời gian chờ.

3.  **Hệ thống Thông báo Toàn cục (Global Notification System):**
    *   **Global Toast:** Thông báo nhẹ nhàng ở góc màn hình (như: Đăng nhập thành công, Thêm giỏ hàng...). Tự động ẩn sau 3 giây.
    *   **Global Dialog (Modal):** Hộp thoại bắt buộc xác nhận (như: Hết thời gian giữ ghế, Yêu cầu xóa) để kiểm soát luồng của người dùng.

---

## 📂 Cấu trúc thư mục chính

Dự án tuân theo kiến trúc dựa trên tính năng (Feature-based/Module-based) ở một số khu vực để mã nguồn luôn sạch sẽ khi mở rộng.

```text
frontend/
├── src/
│   ├── _services/        # Các cấu hình gọi API (Axios instance, Interceptors)
│   ├── assets/           # Tài nguyên tĩnh (Hình ảnh, CSS tổng, Fonts)
│   ├── components/       # Các UI Component
│   │   ├── common/       # Component dùng chung (Button, Input, Swiper...)
│   │   ├── features/     # Component theo từng tính năng cụ thể (Movie, Booking...)
│   │   └── layout/       # Bố cục trang (Header, Footer, Toast, Dialog Modal...)
│   ├── router/           # Định tuyến các trang (Vue Router)
│   ├── stores/           # State Management (Pinia - Auth, Booking, App...)
│   ├── utils/            # Các hàm hỗ trợ (Constants, Regex, Formatting...)
│   ├── views/            # Các trang chính (Home, BookingView, Showtimes...)
│   ├── App.vue           # Component Root của toàn bộ ứng dụng
│   └── main.js           # Điểm khởi chạy ứng dụng
└── tailwind.config.js    # Cấu hình TailwindCSS và DaisyUI
```

---

## ⚙️ Hướng dẫn cài đặt và chạy dự án

### 1. Cài đặt thư viện
Hãy chắc chắn rằng bạn đã cài đặt Node.js. Chạy lệnh sau để tải các packages cần thiết:
```bash
yarn install
# hoặc npm install
```

### 2. Chạy môi trường Phát triển (Development)
```bash
yarn dev
# hoặc npm run dev
```
Truy cập vào đường dẫn `http://localhost:5173` (hoặc cổng được cấu hình trên Terminal) để xem giao diện web. Mọi thay đổi trong code sẽ được cập nhật ngay lập tức nhờ Vite HMR.

### 3. Build cho môi trường Sản phẩm (Production)
```bash
yarn build
# hoặc npm run build
```
Lệnh này sẽ biên dịch mã nguồn và tối ưu hóa file thành thư mục `dist/` để sẵn sàng deploy lên server.

### 4. Kiểm tra mã nguồn (Linting)
```bash
yarn lint
# hoặc npm run lint
```

---

## ✍️ Quy chuẩn code (Coding Standards)

*   **Tên Component:** Sử dụng PascalCase cho tên file (VD: `GlobalToast.vue`) và kebab-case khi gọi trong template (`<global-toast />` hoặc `<GlobalToast />`).
*   **Tách biệt Logic:** Các đoạn mã logic phức tạp hoặc tái sử dụng nhiều lần nên được tách ra thành các `Composables` (VD: `useToastStore.js`, `useSeatStore.js`).
*   **Quy tắc CSS:** Ưu tiên 100% sử dụng utility classes của Tailwind và components của DaisyUI để code gọn gàng. Chỉ viết custom CSS ở thẻ `<style scoped>` khi thực sự cần thiết (như các hiệu ứng animation phức tạp).

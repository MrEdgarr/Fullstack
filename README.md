# 🌐 FULL-STACK REPOSITORY & ENGINEERING SHOWCASE

> Kho lưu trữ các dự án Full-Stack thực chiến, xây dựng theo tiêu chuẩn kiến trúc hiện đại, hiệu năng cao và giải quyết các bài toán kỹ thuật phức tạp (Concurrency, Atomic Transactions, State Management, Clean Architecture).

[![Author](https://img.shields.io/badge/Author-MrEdgarr-blue?style=for-the-badge&logo=github)](https://github.com/MrEdgarr)
[![Repository](https://img.shields.io/badge/Repository-Fullstack-purple?style=for-the-badge&logo=git)](https://github.com/MrEdgarr/Fullstack)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 📌 DANH MỤC DỰ ÁN (PROJECT SHOWCASE)

| Dự án | Lĩnh vực / Nghiệp vụ | Tech Stack chính | Live Demo / Docs |
| :--- | :--- | :--- | :--- |
| **[Cine-Vue](./cine-vue)** | Hệ thống Thương mại Điện tử Đặt vé Xem phim Trực tuyến | Vue 3, Node.js, Express, MySQL, Tailwind, DaisyUI Lofi | 🌐 [Live Demo](https://fullstack-gamma-indol.vercel.app/) <br> 📖 [Chi tiết kỹ thuật](./cine-vue/README.md) |

---

## 🎬 DỰ ÁN TRỌNG ĐIỂM: CINE-VUE (CINEMA TICKETING PLATFORM)

**Cine-Vue** là nền tảng đặt vé xem phim trực tuyến toàn diện, tập trung giải quyết bài toán trải nghiệm mua vé không rào cản kết hợp cơ chế xử lý đồng thời (Concurrency Control) ngăn chặn xung đột tài nguyên CSDL.

### ✨ Điểm nhấn Kỹ thuật Nổi bật (Core Highlights)

- **Frictionless Checkout (Đăng nhập ở bước cuối):** Khách hàng tự do duyệt phim, chọn ngày chiếu, tương tác sơ đồ ghế và combo bắp nước mà không bị chặn bắt buộc đăng nhập. Dữ liệu giỏ hàng được bảo toàn 100% khi chuyển sang bước thanh toán.
- **Cơ chế Đặt vé Nguyên tử (Atomic Seat Booking & Deterministic Locking):** Loại bỏ trạng thái giữ ghế lửng lơ (`held`) gây nghẽn tài nguyên. Câu truy vấn khóa hàng có sắp xếp tăng dần (`ORDER BY showtime_seat_id ASC`) triệt tiêu hoàn toàn nguy cơ **Deadlock (ABBA Deadlock)** khi nhiều khách đặt cùng lúc.
- **Giao diện Tối giản Hiện đại (DaisyUI Lofi Theme):** Thiết kế thanh lịch, tương phản cao, tối ưu hiển thị trên mọi thiết bị và mang lại cảm giác tập trung vào nội dung điện ảnh.
- **Quản lý Phiên & Dọn dẹp Thông minh:** Tự động phát hiện và xử lý JWT Token quá hạn, đồng bộ đăng xuất và dọn dẹp bộ nhớ đệm `localStorage` ngay trong thời gian thực.

### 🛠️ Tech Stack Cine-Vue

- **Frontend:** Vue 3 (Composition API `<script setup>`), Vite, Pinia Store, Vue Router 4, Tailwind CSS kết hợp DaisyUI 5, Swiper.js.
- **Backend:** Node.js, Express.js (Module-Based Architecture), Joi Validation, JWT, Bcrypt, Multer.
- **Database & Storage:** MySQL 8.0 (ACID Transactions, Row-level Locking), Cloudinary Media Storage.

👉 **Khám phá toàn bộ kiến trúc & tài liệu chi tiết tại:** [**Tài liệu Kỹ thuật Cine-Vue (`cine-vue/README.md`)**](./cine-vue/README.md)

---

## 📂 CẤU TRÚC REPOSITORY (WORKSPACE STRUCTURE)

```text
Fullstack/
├── cine-vue/                     # 🎬 Hệ thống đặt vé xem phim Full-Stack
│   ├── frontend/                 # Ứng dụng Client (Vue 3 SPA, DaisyUI Lofi, Pinia)
│   ├── backend/                  # Ứng dụng Server (Node.js, Express RESTful API, MySQL)
│   ├── package.json              # Điều phối chạy song song Client & Server
│   └── README.md                 # 📖 Tài liệu kỹ thuật chi tiết của Cine-Vue
│
└── README.md                     # 📌 Trang tổng quan Repository Fullstack (Trang này)
```

---

## 🚀 HƯỚNG DẪN KHỞI ĐỘNG NHANH (QUICK START)

Để chạy dự án **Cine-Vue** trên máy cá nhân:

```bash
# 1. Clone repository về máy
git clone https://github.com/MrEdgarr/Fullstack.git

# 2. Di chuyển vào thư mục dự án Cine-Vue
cd Fullstack/cine-vue

# 3. Cài đặt các gói phụ thuộc
yarn install
cd frontend && yarn install
cd ../backend && yarn install
cd ..

# 4. Cấu hình CSDL và môi trường
# - Import file CSDL: backend/sql/lean_ticketing_schema.mysql.sql vào MySQL Server
# - Tạo file backend/.env và frontend/.env (xem mẫu chi tiết trong cine-vue/README.md)

# 5. Khởi chạy toàn bộ hệ thống
yarn dev
```

- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:3000/api/v1`

---

## 📐 NGUYÊN TẮC KỸ THUẬT & CODE QUALITY

Toàn bộ mã nguồn trong repository này tuân thủ nghiêm ngặt các tiêu chuẩn:

1. **Module-Based Architecture:** Tổ chức mã nguồn backend theo tính năng nghiệp vụ độc lập (Feature-First), dễ bảo trì và mở rộng.
2. **Separation of Concerns:** Tách biệt triệt để tầng hiển thị, tầng quản lý trạng thái (Pinia) và logic tái sử dụng (Composables).
3. **Database Integrity & Concurrency:** Sử dụng Transaction bảo đảm ACID, khóa hàng có định hướng (Deterministic Ordering) chống xung đột tài nguyên.
4. **Security Best Practices:** Áp dụng Prepared Statements chống SQL Injection, Helmet chống XSS/Clickjacking, Rate-limiter phòng chống tấn công brute-force.

---

## 👨‍💻 TÁC GIẢ (AUTHOR)

- **Developer:** [MrEdgarr](https://github.com/MrEdgarr)
- **GitHub Repository:** [https://github.com/MrEdgarr/Fullstack](https://github.com/MrEdgarr/Fullstack)

---

_Repository được xây dựng với mục tiêu chia sẻ kiến thức, áp dụng các kỹ thuật lập trình hiện đại và giải quyết các bài toán Full-Stack thực tế._

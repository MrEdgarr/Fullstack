-- =============================================================================
-- LEAN CINEMA TICKETING SCHEMA & SEED DATA (MySQL 8.0+)
-- Scope: Ticket sales, seat inventory, food combos, promotions, payments
-- =============================================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- =============================================================================
-- 1. USERS & AUTH
-- =============================================================================

CREATE TABLE IF NOT EXISTS customers (
  customer_id INT NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500) NOT NULL DEFAULT 'https://res.cloudinary.com/drcwlcyov/image/upload/q_auto/f_auto/v1779011299/476749259-30bbcb9ee119ff4f5b22a58d44a1a3710e97913c3bd7574ed8627dd10f59988b_vdiazj.png',
  date_of_birth DATE DEFAULT NULL,
  role ENUM ('customer', 'admin') NOT NULL DEFAULT 'customer',
  status ENUM ('active', 'blocked') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (customer_id),
  UNIQUE KEY uk_customers_email (email),
  UNIQUE KEY uk_customers_phone (phone),
  KEY idx_customers_status (status)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- =============================================================================
-- 2. CINEMA CATALOG
-- =============================================================================

CREATE TABLE IF NOT EXISTS cities (
  city_id INT NOT NULL AUTO_INCREMENT,
  city_name VARCHAR(100) NOT NULL,
  country VARCHAR(50) NOT NULL DEFAULT 'Vietnam',
  province_code VARCHAR(10) DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (city_id),
  UNIQUE KEY uk_cities_name_country (city_name, country)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS cinema_brands (
  brand_id INT NOT NULL AUTO_INCREMENT,
  brand_name VARCHAR(100) NOT NULL,
  logo_url VARCHAR(500) DEFAULT NULL,
  status ENUM ('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (brand_id),
  UNIQUE KEY uk_cinema_brands_name (brand_name),
  KEY idx_cinema_brands_status (status)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS cinemas (
  cinema_id INT NOT NULL AUTO_INCREMENT,
  brand_id INT NOT NULL,
  city_id INT NOT NULL,
  cinema_name VARCHAR(150) NOT NULL,
  address VARCHAR(255) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  status ENUM ('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (cinema_id),
  KEY idx_cinemas_brand (brand_id),
  KEY idx_cinemas_city (city_id),
  KEY idx_cinemas_status (status),
  CONSTRAINT fk_cinemas_brand FOREIGN KEY (brand_id) REFERENCES cinema_brands (brand_id) ON DELETE RESTRICT,
  CONSTRAINT fk_cinemas_city FOREIGN KEY (city_id) REFERENCES cities (city_id) ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS screening_rooms (
  room_id INT NOT NULL AUTO_INCREMENT,
  cinema_id INT NOT NULL,
  room_name VARCHAR(50) NOT NULL,
  room_type ENUM ('2D', '3D', 'IMAX', '4DX') NOT NULL DEFAULT '2D',
  status ENUM ('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (room_id),
  UNIQUE KEY uk_room_name_per_cinema (cinema_id, room_name),
  KEY idx_rooms_cinema (cinema_id),
  CONSTRAINT fk_rooms_cinema FOREIGN KEY (cinema_id) REFERENCES cinemas (cinema_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS seats (
  seat_id INT NOT NULL AUTO_INCREMENT,
  room_id INT NOT NULL,
  row_letter CHAR(2) NOT NULL,
  seat_number SMALLINT NOT NULL,
  seat_type ENUM ('standard', 'vip', 'couple') NOT NULL DEFAULT 'standard',
  status ENUM ('active', 'maintenance') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (seat_id),
  UNIQUE KEY uk_seat_per_room (room_id, row_letter, seat_number),
  KEY idx_seats_room (room_id),
  CONSTRAINT fk_seats_room FOREIGN KEY (room_id) REFERENCES screening_rooms (room_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- =============================================================================
-- 3. MOVIES & SHOWTIMES
-- =============================================================================

CREATE TABLE IF NOT EXISTS movies (
  movie_id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) DEFAULT NULL,
  duration_minutes SMALLINT NOT NULL,
  genre VARCHAR(100) DEFAULT NULL,
  age_rating VARCHAR(10) NOT NULL,
  rating_percent DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  poster_url VARCHAR(500) DEFAULT NULL,
  banner_url VARCHAR(500) DEFAULT NULL,
  trailer_url VARCHAR(500) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  release_date DATE DEFAULT NULL,
  status ENUM ('upcoming', 'now_showing', 'ended') NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (movie_id),
  KEY idx_movies_status_release (status, release_date)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS showtimes (
  showtime_id INT NOT NULL AUTO_INCREMENT,
  movie_id INT NOT NULL,
  room_id INT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  price_standard DECIMAL(10, 2) NOT NULL,
  price_vip DECIMAL(10, 2) NOT NULL,
  price_couple DECIMAL(10, 2) NOT NULL,
  status ENUM ('scheduled', 'cancelled', 'completed') NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (showtime_id),
  UNIQUE KEY uk_room_start_time (room_id, start_time),
  KEY idx_showtimes_movie_start (movie_id, start_time),
  KEY idx_showtimes_room_start (room_id, start_time),
  CONSTRAINT chk_showtimes_time_range CHECK (end_time > start_time),
  CONSTRAINT chk_showtimes_prices CHECK (
    price_standard >= 0
    AND price_vip >= 0
    AND price_couple >= 0
  ),
  CONSTRAINT fk_showtimes_movie FOREIGN KEY (movie_id) REFERENCES movies (movie_id) ON DELETE RESTRICT,
  CONSTRAINT fk_showtimes_room FOREIGN KEY (room_id) REFERENCES screening_rooms (room_id) ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS showtime_seats (
  showtime_seat_id INT NOT NULL AUTO_INCREMENT,
  showtime_id INT NOT NULL,
  seat_id INT NOT NULL,
  status ENUM ('available', 'held', 'booked') NOT NULL DEFAULT 'available',
  held_by_booking_id INT DEFAULT NULL,
  held_until DATETIME DEFAULT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (showtime_seat_id),
  UNIQUE KEY uk_showtime_seat (showtime_id, seat_id),
  KEY idx_showtime_seats_status (showtime_id, status),
  KEY idx_showtime_seats_booking (held_by_booking_id),
  CONSTRAINT chk_showtime_seats_price CHECK (price >= 0),
  CONSTRAINT fk_showtime_seats_showtime FOREIGN KEY (showtime_id) REFERENCES showtimes (showtime_id) ON DELETE CASCADE,
  CONSTRAINT fk_showtime_seats_seat FOREIGN KEY (seat_id) REFERENCES seats (seat_id) ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- =============================================================================
-- 4. PROMOTIONS & BOOKINGS
-- =============================================================================

CREATE TABLE IF NOT EXISTS promotions (
  promotion_id INT NOT NULL AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL,
  discount_type ENUM ('percent', 'fixed') NOT NULL,
  discount_value DECIMAL(12, 2) NOT NULL,
  max_discount_amount DECIMAL(12, 2) DEFAULT NULL,
  min_order_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  starts_at DATETIME NOT NULL,
  ends_at DATETIME NOT NULL,
  status ENUM ('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (promotion_id),
  UNIQUE KEY uk_promotions_code (code),
  KEY idx_promotions_window (status, starts_at, ends_at),
  CONSTRAINT chk_promotions_values CHECK (
    discount_value >= 0
    AND min_order_amount >= 0
    AND (max_discount_amount IS NULL OR max_discount_amount >= 0)
    AND ends_at > starts_at
  )
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS bookings (
  booking_id INT NOT NULL AUTO_INCREMENT,
  booking_code VARCHAR(20) DEFAULT NULL,
  customer_id INT NOT NULL,
  showtime_id INT NOT NULL,
  promotion_id INT DEFAULT NULL,
  status ENUM ('pending', 'confirmed', 'cancelled', 'completed') NOT NULL DEFAULT 'pending',
  subtotal_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  final_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  expires_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (booking_id),
  UNIQUE KEY uk_bookings_booking_code (booking_code),
  KEY idx_bookings_customer_created (customer_id, created_at),
  KEY idx_bookings_showtime_status (showtime_id, status),
  CONSTRAINT chk_bookings_amounts CHECK (
    subtotal_amount >= 0
    AND discount_amount >= 0
    AND final_amount >= 0
    AND discount_amount <= subtotal_amount
  ),
  CONSTRAINT fk_bookings_customer FOREIGN KEY (customer_id) REFERENCES customers (customer_id) ON DELETE RESTRICT,
  CONSTRAINT fk_bookings_showtime FOREIGN KEY (showtime_id) REFERENCES showtimes (showtime_id) ON DELETE RESTRICT,
  CONSTRAINT fk_bookings_promotion FOREIGN KEY (promotion_id) REFERENCES promotions (promotion_id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

ALTER TABLE showtime_seats 
  ADD CONSTRAINT fk_showtime_seats_booking 
  FOREIGN KEY (held_by_booking_id) REFERENCES bookings (booking_id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS tickets (
  ticket_id INT NOT NULL AUTO_INCREMENT,
  booking_id INT NOT NULL,
  showtime_seat_id INT NOT NULL,
  seat_id INT NOT NULL,
  actual_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (ticket_id),
  UNIQUE KEY uk_ticket_showtime_seat (showtime_seat_id),
  UNIQUE KEY uk_ticket_booking_seat (booking_id, seat_id),
  CONSTRAINT chk_tickets_actual_price CHECK (actual_price >= 0),
  CONSTRAINT fk_tickets_booking FOREIGN KEY (booking_id) REFERENCES bookings (booking_id) ON DELETE CASCADE,
  CONSTRAINT fk_tickets_showtime_seat FOREIGN KEY (showtime_seat_id) REFERENCES showtime_seats (showtime_seat_id) ON DELETE RESTRICT,
  CONSTRAINT fk_tickets_seat FOREIGN KEY (seat_id) REFERENCES seats (seat_id) ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- =============================================================================
-- 5. PAYMENT & FOOD COMBOS
-- =============================================================================

CREATE TABLE IF NOT EXISTS payment_methods (
  payment_method_id INT NOT NULL AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  payment_method ENUM ('cash', 'card', 'momo', 'vnpay', 'zalopay', 'shopeepay', 'applepay', 'payoo') NOT NULL,
  icon_key VARCHAR(50) DEFAULT NULL,
  description VARCHAR(255) DEFAULT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  status ENUM ('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (payment_method_id),
  UNIQUE KEY uk_payment_methods_code (code),
  KEY idx_payment_methods_status_sort (status, sort_order)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS payments (
  payment_id INT NOT NULL AUTO_INCREMENT,
  booking_id INT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  payment_method ENUM ('cash', 'card', 'momo', 'vnpay', 'zalopay', 'shopeepay', 'applepay', 'payoo') NOT NULL,
  status ENUM ('pending', 'success', 'failed') NOT NULL DEFAULT 'pending',
  transaction_id VARCHAR(100) DEFAULT NULL,
  payment_time TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (payment_id),
  UNIQUE KEY uk_payments_transaction_id (transaction_id),
  KEY idx_payments_booking_status (booking_id, status),
  CONSTRAINT chk_payments_amount CHECK (amount >= 0),
  CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings (booking_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS food_combos (
  food_combo_id INT NOT NULL AUTO_INCREMENT,
  cinema_id INT NOT NULL,
  combo_name VARCHAR(150) NOT NULL,
  description VARCHAR(255) DEFAULT NULL,
  image_url VARCHAR(500) DEFAULT NULL,
  price DECIMAL(10, 2) NOT NULL,
  status ENUM ('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (food_combo_id),
  UNIQUE KEY uk_food_combo_per_cinema (cinema_id, combo_name),
  KEY idx_food_combos_cinema (cinema_id),
  KEY idx_food_combos_status (status),
  CONSTRAINT chk_food_combos_price CHECK (price >= 0),
  CONSTRAINT fk_food_combos_cinema FOREIGN KEY (cinema_id) REFERENCES cinemas (cinema_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS booking_food_combos (
  booking_food_combo_id INT NOT NULL AUTO_INCREMENT,
  booking_id INT NOT NULL,
  food_combo_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  line_total DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (booking_food_combo_id),
  UNIQUE KEY uk_booking_food_combo (booking_id, food_combo_id),
  KEY idx_booking_food_combos_booking (booking_id),
  CONSTRAINT chk_booking_food_combos_values CHECK (
    quantity > 0
    AND unit_price >= 0
    AND line_total >= 0
  ),
  CONSTRAINT fk_booking_food_combos_booking FOREIGN KEY (booking_id) REFERENCES bookings (booking_id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_food_combos_combo FOREIGN KEY (food_combo_id) REFERENCES food_combos (food_combo_id) ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- =============================================================================
-- 6. SEED DATA (COMPACT & OPTIMIZED)
-- =============================================================================

-- Payment methods
INSERT INTO payment_methods (code, name, payment_method, icon_key, description, sort_order, status)
VALUES
  ('atm-card', 'Thẻ ATM / Thẻ quốc tế', 'card', 'visa', 'Thanh toán bằng thẻ ATM, Visa hoặc Mastercard', 1, 'active'),
  ('shopeepay', 'ShopeePay', 'shopeepay', 'shopeepay', 'Thanh toán qua ví ShopeePay', 2, 'active'),
  ('apple-pay', 'Apple Pay', 'applepay', 'applepay', 'Thanh toán qua Apple Pay', 3, 'active'),
  ('momo', 'Ví MoMo', 'momo', 'momo', 'Thanh toán qua ví MoMo', 4, 'active'),
  ('payoo', 'Payoo', 'payoo', 'payoo', 'Thanh toán qua Payoo', 5, 'active')
ON DUPLICATE KEY UPDATE name = VALUES(name), status = 'active';

-- Accounts (Password: Password123)
INSERT INTO customers (full_name, email, phone, password_hash, role)
VALUES
  ('System Admin', 'admin@example.com', '0900000000', '$2b$10$cOKnf93qNph9yLI./pG8yegWHx9OhRZoOLOci8y/atvVv0ywU.6NC', 'admin'),
  ('Demo Customer', 'customer@example.com', '0911111111', '$2b$10$cOKnf93qNph9yLI./pG8yegWHx9OhRZoOLOci8y/atvVv0ywU.6NC', 'customer'),
  ('Nguyễn Minh', 'minh.nguyen@example.com', '0922222222', '$2b$10$cOKnf93qNph9yLI./pG8yegWHx9OhRZoOLOci8y/atvVv0ywU.6NC', 'customer'),
  ('Trần Lan', 'lan.tran@example.com', '0933333333', '$2b$10$cOKnf93qNph9yLI./pG8yegWHx9OhRZoOLOci8y/atvVv0ywU.6NC', 'customer')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), status = 'active';

-- Cities
INSERT INTO cities (city_name, country, province_code)
VALUES
  ('Hà Nội', 'Vietnam', 'HN'),
  ('TP. Hồ Chí Minh', 'Vietnam', 'HCM'),
  ('Đà Nẵng', 'Vietnam', 'DN'),
  ('Hải Phòng', 'Vietnam', 'HP'),
  ('Cần Thơ', 'Vietnam', 'CT')
ON DUPLICATE KEY UPDATE province_code = VALUES(province_code);

-- Brands
INSERT INTO cinema_brands (brand_name, logo_url)
VALUES
  ('CGV Cinemas', 'https://placehold.co/240x120?text=CGV'),
  ('Lotte Cinema', 'https://placehold.co/240x120?text=Lotte'),
  ('Galaxy Cinema', 'https://placehold.co/240x120?text=Galaxy'),
  ('BHD Star Cineplex', 'https://placehold.co/240x120?text=BHD'),
  ('CineStar', 'https://placehold.co/240x120?text=CineStar')
ON DUPLICATE KEY UPDATE logo_url = VALUES(logo_url), status = 'active';

-- Cinemas
INSERT INTO cinemas (brand_id, city_id, cinema_name, address, phone)
VALUES
  (1, 1, 'CGV Vincom Center Bà Triệu', '191 Bà Triệu, Hai Bà Trưng, Hà Nội', '19006017'),
  (1, 2, 'CGV Crescent Mall', '101 Tôn Dật Tiên, Quận 7, TP. Hồ Chí Minh', '19006018'),
  (2, 3, 'Lotte Cinema Đà Nẵng', '255-257 Hùng Vương, Hải Châu, Đà Nẵng', '19005588'),
  (3, 2, 'Galaxy Nguyễn Du', '116 Nguyễn Du, Quận 1, TP. Hồ Chí Minh', '19002224'),
  (4, 1, 'BHD Star Phạm Ngọc Thạch', '2 Phạm Ngọc Thạch, Đống Đa, Hà Nội', '19002099'),
  (5, 5, 'CineStar Cần Thơ', 'Sense City, Ninh Kiều, Cần Thơ', '19006660')
ON DUPLICATE KEY UPDATE address = VALUES(address), status = 'active';

-- Screening rooms (3 rooms for each cinema: Room 1 2D, Room 2 IMAX, Room 3 3D)
INSERT INTO screening_rooms (cinema_id, room_name, room_type)
SELECT c.cinema_id, r.room_name, r.room_type
FROM cinemas c
CROSS JOIN (
  SELECT 'Room 1' AS room_name, '2D' AS room_type
  UNION ALL SELECT 'Room 2', 'IMAX'
  UNION ALL SELECT 'Room 3', '3D'
) r
ON DUPLICATE KEY UPDATE room_type = VALUES(room_type), status = 'active';

-- Seats (Rows A-F x 10 seats = 60 seats per room)
INSERT INTO seats (room_id, row_letter, seat_number, seat_type)
SELECT r.room_id, rows_grid.row_letter, num_grid.seat_number, rows_grid.seat_type
FROM screening_rooms r
CROSS JOIN (
  SELECT 'A' AS row_letter, 'standard' AS seat_type
  UNION ALL SELECT 'B', 'standard'
  UNION ALL SELECT 'C', 'vip'
  UNION ALL SELECT 'D', 'vip'
  UNION ALL SELECT 'E', 'couple'
  UNION ALL SELECT 'F', 'couple'
) rows_grid
CROSS JOIN (
  SELECT 1 AS seat_number UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5
  UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
) num_grid
ON DUPLICATE KEY UPDATE seat_type = VALUES(seat_type), status = 'active';

-- Movies
INSERT INTO movies (
  title, title_en, duration_minutes, genre, age_rating, rating_percent,
  poster_url, banner_url, trailer_url, description, release_date, status
)
VALUES
  ('Lật Mặt 9: Vòng Xoáy', 'Face Off 9', 118, 'Hành động, Tâm lý', 'T16', 92, 'https://placehold.co/400x600?text=Lat+Mat+9', 'https://placehold.co/1200x500?text=Lat+Mat+9', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Một bộ phim hành động Việt Nam với nhịp kể nhanh và nhiều nút thắt.', CURDATE() - INTERVAL 7 DAY, 'now_showing'),
  ('Doraemon: Nobita Và Bản Giao Hưởng Địa Cầu', 'Doraemon: Nobita''s Earth Symphony', 115, 'Hoạt hình, Gia đình', 'P', 89, 'https://placehold.co/400x600?text=Doraemon', 'https://placehold.co/1200x500?text=Doraemon', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Chuyến phiêu lưu âm nhạc dành cho gia đình và trẻ em.', CURDATE() - INTERVAL 5 DAY, 'now_showing'),
  ('Mission: Impossible - Final Reckoning', 'Mission: Impossible - Final Reckoning', 169, 'Hành động, Phiêu lưu', 'T16', 91, 'https://placehold.co/400x600?text=Mission+Impossible', 'https://placehold.co/1200x500?text=Mission+Impossible', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Một nhiệm vụ cuối cùng với quy mô toàn cầu.', CURDATE() - INTERVAL 3 DAY, 'now_showing'),
  ('Mưa Đỏ', 'Red Rain', 124, 'Chiến tranh, Lịch sử', 'T16', 86, 'https://placehold.co/400x600?text=Mua+Do', 'https://placehold.co/1200x500?text=Mua+Do', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Câu chuyện lịch sử được kể qua góc nhìn nhân vật trẻ.', CURDATE() - INTERVAL 2 DAY, 'now_showing'),
  ('Shin Cậu Bé Bút Chì', 'Crayon Shin-chan', 95, 'Hoạt hình, Gia đình', 'K', 88, 'https://placehold.co/400x600?text=Shin-chan', 'https://placehold.co/1200x500?text=Shin-chan', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Phim hoạt hình vui nhộn cho mọi lứa tuổi.', CURDATE() - INTERVAL 1 DAY, 'now_showing'),
  ('Avengers: Secret Empire', 'Avengers: Secret Empire', 135, 'Hành động, Sci-Fi', 'T13', 0, 'https://placehold.co/400x600?text=Avengers', 'https://placehold.co/1200x500?text=Avengers', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Cuộc chiến mới của các siêu anh hùng.', CURDATE() + INTERVAL 10 DAY, 'upcoming'),
  ('Conan: Dư Ảnh Của Độc Nhãn', 'Detective Conan: One-Eyed Flashback', 110, 'Hoạt hình, Trinh thám', 'T13', 0, 'https://placehold.co/400x600?text=Conan', 'https://placehold.co/1200x500?text=Conan', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Một vụ án mới kéo Conan vào cuộc truy tìm sự thật.', CURDATE() + INTERVAL 15 DAY, 'upcoming'),
  ('Inside Out 3', 'Inside Out 3', 102, 'Hoạt hình, Gia đình', 'P', 0, 'https://placehold.co/400x600?text=Inside+Out+3', 'https://placehold.co/1200x500?text=Inside+Out+3', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Một hành trình mới vào thế giới cảm xúc.', CURDATE() + INTERVAL 20 DAY, 'upcoming')
ON DUPLICATE KEY UPDATE title = VALUES(title), release_date = VALUES(release_date), status = VALUES(status);

-- Promotions
INSERT INTO promotions (code, discount_type, discount_value, max_discount_amount, min_order_amount, starts_at, ends_at, status)
VALUES
  ('WELCOME10', 'percent', 10, 50000, 100000, '2026-01-01 00:00:00', '2030-12-31 23:59:59', 'active'),
  ('STUDENT20', 'percent', 20, 60000, 120000, '2026-01-01 00:00:00', '2030-12-31 23:59:59', 'active'),
  ('WEEKDAY50K', 'fixed', 50000, NULL, 200000, '2026-01-01 00:00:00', '2030-12-31 23:59:59', 'active'),
  ('COMBO15', 'percent', 15, 40000, 150000, '2026-01-01 00:00:00', '2030-12-31 23:59:59', 'active')
ON DUPLICATE KEY UPDATE discount_value = VALUES(discount_value), status = 'active';

-- Food combos
INSERT INTO food_combos (cinema_id, combo_name, description, image_url, price)
SELECT c.cinema_id, ct.combo_name, ct.description, ct.image_url, ct.price
FROM cinemas c
CROSS JOIN (
  SELECT 'Combo Solo' AS combo_name, '1 bắp vừa + 1 nước ngọt vừa' AS description, 'https://placehold.co/500x350?text=Combo+Solo' AS image_url, 70000 AS price
  UNION ALL SELECT 'Combo Couple', '1 bắp lớn + 2 nước ngọt vừa', 'https://placehold.co/500x350?text=Combo+Couple', 115000
  UNION ALL SELECT 'Combo Family', '2 bắp lớn + 4 nước ngọt vừa', 'https://placehold.co/500x350?text=Combo+Family', 210000
) ct
ON DUPLICATE KEY UPDATE price = VALUES(price), status = 'active';

-- =============================================================================
-- 7. SHOWTIMES & SEAT INVENTORY (DYNAMIC FOR NEXT 5 DAYS)
-- =============================================================================

-- Generate Showtimes for upcoming 5 days (4 time slots per room per day)
INSERT INTO showtimes (movie_id, room_id, start_time, end_time, price_standard, price_vip, price_couple, status)
SELECT 
    m.movie_id,
    r.room_id,
    TIMESTAMP(CURDATE() + INTERVAL d.day_offset DAY, t.start_time) AS start_time,
    TIMESTAMP(CURDATE() + INTERVAL d.day_offset DAY, t.start_time) + INTERVAL m.duration_minutes MINUTE AS end_time,
    t.price_standard,
    t.price_vip,
    t.price_couple,
    'scheduled'
FROM screening_rooms r
JOIN (
    SELECT 1 AS day_offset UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5
) d
CROSS JOIN (
    SELECT '10:00:00' AS start_time, 80000.00 AS price_standard, 110000.00 AS price_vip, 160000.00 AS price_couple
    UNION ALL SELECT '14:00:00', 80000.00, 110000.00, 160000.00
    UNION ALL SELECT '18:00:00', 95000.00, 125000.00, 190000.00
    UNION ALL SELECT '21:15:00', 95000.00, 125000.00, 190000.00
) t
JOIN (
    SELECT movie_id, duration_minutes, ROW_NUMBER() OVER (ORDER BY movie_id) AS rn
    FROM movies
    WHERE status = 'now_showing'
) m ON m.rn = ((r.room_id + d.day_offset) % 4) + 1
ON DUPLICATE KEY UPDATE end_time = VALUES(end_time), status = 'scheduled';

-- Automatically populate available seats for all created showtimes
INSERT INTO showtime_seats (showtime_id, seat_id, price, status)
SELECT 
    st.showtime_id,
    s.seat_id,
    CASE s.seat_type
        WHEN 'vip' THEN st.price_vip
        WHEN 'couple' THEN st.price_couple
        ELSE st.price_standard
    END AS price,
    'available' AS status
FROM showtimes st
JOIN seats s ON s.room_id = st.room_id AND s.status = 'active'
LEFT JOIN showtime_seats ss ON ss.showtime_id = st.showtime_id AND ss.seat_id = s.seat_id
WHERE ss.showtime_seat_id IS NULL;

-- =============================================================================
-- 8. DEMO CONFIRMED BOOKING & PAYMENT
-- =============================================================================

INSERT INTO bookings (booking_code, customer_id, showtime_id, status, subtotal_amount, discount_amount, final_amount)
SELECT 
    'DEMO-CONFIRMED-001',
    c.customer_id,
    st.showtime_id,
    'confirmed',
    275000.00,
    0.00,
    275000.00
FROM customers c
CROSS JOIN (
    SELECT showtime_id FROM showtimes WHERE DATE(start_time) = CURDATE() + INTERVAL 1 DAY ORDER BY showtime_id LIMIT 1
) st
WHERE c.email = 'customer@example.com'
ON DUPLICATE KEY UPDATE status = 'confirmed';

UPDATE showtime_seats ss
JOIN bookings b ON b.booking_code = 'DEMO-CONFIRMED-001'
SET ss.status = 'booked'
WHERE ss.showtime_id = b.showtime_id
LIMIT 2;

INSERT IGNORE INTO tickets (booking_id, showtime_seat_id, seat_id, actual_price)
SELECT b.booking_id, ss.showtime_seat_id, ss.seat_id, ss.price
FROM bookings b
JOIN showtime_seats ss ON ss.showtime_id = b.showtime_id AND ss.status = 'booked'
WHERE b.booking_code = 'DEMO-CONFIRMED-001';

INSERT INTO payments (booking_id, amount, payment_method, status, transaction_id, payment_time)
SELECT b.booking_id, b.final_amount, 'momo', 'success', 'DEMO-TXN-001', NOW()
FROM bookings b
WHERE b.booking_code = 'DEMO-CONFIRMED-001'
ON DUPLICATE KEY UPDATE status = 'success';

-- Lean cinema ticketing schema
-- Scope: ticket sales, seat inventory, food combos, simple promotions, and payments.
-- Import into MySQL 8+.
SET
  NAMES utf8mb4;

SET
  time_zone = '+00:00';

-- =========================
-- 1. Users
-- =========================
CREATE TABLE
  customers (
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

-- =========================
-- 2. Cinema catalog
-- =========================
CREATE TABLE
  cities (
    city_id INT NOT NULL AUTO_INCREMENT,
    city_name VARCHAR(100) NOT NULL,
    country VARCHAR(50) NOT NULL DEFAULT 'Vietnam',
    province_code VARCHAR(10) DEFAULT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (city_id),
    UNIQUE KEY uk_cities_name_country (city_name, country)
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE
  cinema_brands (
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

CREATE TABLE
  cinemas (
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

CREATE TABLE
  screening_rooms (
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

CREATE TABLE
  seats (
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

CREATE TABLE
  movies (
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

-- =========================
-- 3. Showtime and seat inventory
-- =========================
CREATE TABLE
  showtimes (
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

CREATE TABLE
  showtime_seats (
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

-- =========================
-- 4. Booking
-- =========================
CREATE TABLE
  promotions (
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
    KEY idx_promotions_window (status, starts_at, ends_at)
    ,
    CONSTRAINT chk_promotions_values CHECK (
      discount_value >= 0
      AND min_order_amount >= 0
      AND (max_discount_amount IS NULL OR max_discount_amount >= 0)
      AND ends_at > starts_at
    )
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE
  bookings (
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

ALTER TABLE showtime_seats ADD CONSTRAINT fk_showtime_seats_booking FOREIGN KEY (held_by_booking_id) REFERENCES bookings (booking_id) ON DELETE SET NULL;

CREATE TABLE
  tickets (
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

-- =========================
-- 5. Payment
-- =========================
CREATE TABLE
  payments (
    payment_id INT NOT NULL AUTO_INCREMENT,
    booking_id INT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    payment_method ENUM ('cash', 'card', 'momo', 'vnpay', 'zalopay') NOT NULL,
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

-- =========================
-- 6. Food combo ordering
-- =========================
CREATE TABLE
  food_combos (
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

CREATE TABLE
  booking_food_combos (
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

-- =========================
-- 7. Seed data
-- =========================
INSERT INTO
  customers (full_name, email, phone, password_hash, role)
VALUES
  (
    'System Admin',
    'admin@example.com',
    '0900000000',
    '$2b$10$cOKnf93qNph9yLI./pG8yegWHx9OhRZoOLOci8y/atvVv0ywU.6NC',
    'admin'
  ),
  (
    'Demo Customer',
    'customer@example.com',
    '0911111111',
    '$2b$10$cOKnf93qNph9yLI./pG8yegWHx9OhRZoOLOci8y/atvVv0ywU.6NC',
    'customer'
  );

INSERT INTO
  cities (city_name, country, province_code)
VALUES
  ('Hà Nội', 'Vietnam', 'HN'),
  ('TP. Hồ Chí Minh', 'Vietnam', 'HCM');

INSERT INTO
  cinema_brands (brand_name, logo_url)
VALUES
  ('CGV Cinemas', NULL),
  ('Lotte Cinema', NULL);

INSERT INTO
  cinemas (brand_id, city_id, cinema_name, address, phone)
VALUES
  (
    1,
    1,
    'Cinemax Royal City',
    'Tầng B2, Royal City, Hà Nội',
    '19009999'
  ),
  (
    2,
    2,
    'Cinemax Landmark',
    'Quận 1, TP. Hồ Chí Minh',
    '19008888'
  );

INSERT INTO
  screening_rooms (cinema_id, room_name, room_type)
VALUES
  (1, 'Room 1', '2D'),
  (1, 'Room 2', 'IMAX');

INSERT INTO
  seats (room_id, row_letter, seat_number, seat_type)
VALUES
  (1, 'A', 1, 'standard'),
  (1, 'A', 2, 'standard'),
  (1, 'A', 3, 'standard'),
  (1, 'A', 4, 'standard'),
  (1, 'A', 5, 'standard'),
  (1, 'B', 1, 'standard'),
  (1, 'B', 2, 'vip'),
  (1, 'B', 3, 'vip'),
  (1, 'B', 4, 'standard'),
  (1, 'B', 5, 'standard'),
  (1, 'C', 1, 'standard'),
  (1, 'C', 2, 'couple'),
  (1, 'C', 3, 'couple'),
  (1, 'C', 4, 'standard'),
  (1, 'C', 5, 'standard'),
  (2, 'A', 1, 'standard'),
  (2, 'A', 2, 'standard'),
  (2, 'A', 3, 'standard'),
  (2, 'A', 4, 'vip'),
  (2, 'A', 5, 'vip');

INSERT INTO
  movies (
    title,
    title_en,
    duration_minutes,
    genre,
    age_rating,
    rating_percent,
    release_date,
    status
  )
VALUES
  (
    'Shin Cậu Bé Bút Chì',
    'Crayon Shin-chan',
    95,
    'Hoạt hình, Gia đình',
    'K',
    88.50,
    '2026-05-01',
    'now_showing'
  ),
  (
    'Avengers: Secret Empire',
    'Avengers: Secret Empire',
    135,
    'Hành động, Sci-Fi',
    'T13',
    0.00,
    '2026-06-05',
    'upcoming'
  );

INSERT INTO
  showtimes (
    movie_id,
    room_id,
    start_time,
    end_time,
    price_standard,
    price_vip,
    price_couple
  )
VALUES
  (
    1,
    1,
    '2026-05-20 19:00:00',
    '2026-05-20 20:35:00',
    90000,
    120000,
    180000
  ),
  (
    1,
    2,
    '2026-05-20 21:00:00',
    '2026-05-20 22:35:00',
    120000,
    150000,
    220000
  );

INSERT INTO
  showtime_seats (showtime_id, seat_id, price)
SELECT
  st.showtime_id,
  s.seat_id,
  CASE s.seat_type
    WHEN 'vip' THEN st.price_vip
    WHEN 'couple' THEN st.price_couple
    ELSE st.price_standard
  END AS price
FROM
  showtimes st
  JOIN seats s ON s.room_id = st.room_id
WHERE
  s.status = 'active';

INSERT INTO
  promotions (
    code,
    discount_type,
    discount_value,
    max_discount_amount,
    min_order_amount,
    starts_at,
    ends_at
  )
VALUES
  (
    'WELCOME10',
    'percent',
    10,
    50000,
    100000,
    '2026-01-01 00:00:00',
    '2026-12-31 23:59:59'
  ),
  (
    'FIXED20K',
    'fixed',
    20000,
    NULL,
    150000,
    '2026-01-01 00:00:00',
    '2026-12-31 23:59:59'
  );

INSERT INTO
  food_combos (cinema_id, combo_name, description, price)
VALUES
  (1, 'Combo Couple', '1 bắp lớn + 2 nước ngọt vừa', 115000),
  (1, 'Combo Solo', '1 bắp vừa + 1 nước ngọt vừa', 70000),
  (2, 'Combo Premium', '1 bắp lớn + 2 nước ngọt lớn', 135000);

-- =========================
-- 8. Extended demo data
-- =========================

INSERT INTO customers (full_name, email, phone, password_hash, role)
VALUES
  ('System Admin', 'admin@example.com', '0900000000', '$2b$10$cOKnf93qNph9yLI./pG8yegWHx9OhRZoOLOci8y/atvVv0ywU.6NC', 'admin'),
  ('Demo Customer', 'customer@example.com', '0911111111', '$2b$10$cOKnf93qNph9yLI./pG8yegWHx9OhRZoOLOci8y/atvVv0ywU.6NC', 'customer'),
  ('Nguyễn Minh', 'minh.nguyen@example.com', '0922222222', '$2b$10$cOKnf93qNph9yLI./pG8yegWHx9OhRZoOLOci8y/atvVv0ywU.6NC', 'customer'),
  ('Trần Lan', 'lan.tran@example.com', '0933333333', '$2b$10$cOKnf93qNph9yLI./pG8yegWHx9OhRZoOLOci8y/atvVv0ywU.6NC', 'customer')
ON DUPLICATE KEY UPDATE
  full_name = VALUES(full_name),
  phone = VALUES(phone),
  role = VALUES(role),
  status = 'active';

INSERT INTO cities (city_name, country, province_code)
VALUES
  ('Hà Nội', 'Vietnam', 'HN'),
  ('TP. Hồ Chí Minh', 'Vietnam', 'HCM'),
  ('Đà Nẵng', 'Vietnam', 'DN'),
  ('Hải Phòng', 'Vietnam', 'HP'),
  ('Cần Thơ', 'Vietnam', 'CT')
ON DUPLICATE KEY UPDATE
  province_code = VALUES(province_code);

INSERT INTO cinema_brands (brand_name, logo_url)
VALUES
  ('CGV Cinemas', 'https://placehold.co/240x120?text=CGV'),
  ('Lotte Cinema', 'https://placehold.co/240x120?text=Lotte'),
  ('Galaxy Cinema', 'https://placehold.co/240x120?text=Galaxy'),
  ('BHD Star Cineplex', 'https://placehold.co/240x120?text=BHD'),
  ('CineStar', 'https://placehold.co/240x120?text=CineStar')
ON DUPLICATE KEY UPDATE
  logo_url = VALUES(logo_url),
  status = 'active';

INSERT INTO cinemas (brand_id, city_id, cinema_name, address, phone)
SELECT b.brand_id, c.city_id, 'CGV Vincom Center Bà Triệu', '191 Bà Triệu, Hai Bà Trưng, Hà Nội', '19006017'
FROM cinema_brands b
JOIN cities c ON c.city_name = 'Hà Nội' AND c.country = 'Vietnam'
WHERE b.brand_name = 'CGV Cinemas'
  AND NOT EXISTS (
    SELECT 1 FROM cinemas existing
    WHERE existing.cinema_name = 'CGV Vincom Center Bà Triệu'
      AND existing.address = '191 Bà Triệu, Hai Bà Trưng, Hà Nội'
  );

INSERT INTO cinemas (brand_id, city_id, cinema_name, address, phone)
SELECT b.brand_id, c.city_id, 'CGV Crescent Mall', '101 Tôn Dật Tiên, Quận 7, TP. Hồ Chí Minh', '19006018'
FROM cinema_brands b
JOIN cities c ON c.city_name = 'TP. Hồ Chí Minh' AND c.country = 'Vietnam'
WHERE b.brand_name = 'CGV Cinemas'
  AND NOT EXISTS (
    SELECT 1 FROM cinemas existing
    WHERE existing.cinema_name = 'CGV Crescent Mall'
      AND existing.address = '101 Tôn Dật Tiên, Quận 7, TP. Hồ Chí Minh'
  );

INSERT INTO cinemas (brand_id, city_id, cinema_name, address, phone)
SELECT b.brand_id, c.city_id, 'Lotte Cinema Đà Nẵng', '255-257 Hùng Vương, Hải Châu, Đà Nẵng', '19005588'
FROM cinema_brands b
JOIN cities c ON c.city_name = 'Đà Nẵng' AND c.country = 'Vietnam'
WHERE b.brand_name = 'Lotte Cinema'
  AND NOT EXISTS (
    SELECT 1 FROM cinemas existing
    WHERE existing.cinema_name = 'Lotte Cinema Đà Nẵng'
      AND existing.address = '255-257 Hùng Vương, Hải Châu, Đà Nẵng'
  );

INSERT INTO cinemas (brand_id, city_id, cinema_name, address, phone)
SELECT b.brand_id, c.city_id, 'Galaxy Nguyễn Du', '116 Nguyễn Du, Quận 1, TP. Hồ Chí Minh', '19002224'
FROM cinema_brands b
JOIN cities c ON c.city_name = 'TP. Hồ Chí Minh' AND c.country = 'Vietnam'
WHERE b.brand_name = 'Galaxy Cinema'
  AND NOT EXISTS (
    SELECT 1 FROM cinemas existing
    WHERE existing.cinema_name = 'Galaxy Nguyễn Du'
      AND existing.address = '116 Nguyễn Du, Quận 1, TP. Hồ Chí Minh'
  );

INSERT INTO cinemas (brand_id, city_id, cinema_name, address, phone)
SELECT b.brand_id, c.city_id, 'BHD Star Phạm Ngọc Thạch', '2 Phạm Ngọc Thạch, Đống Đa, Hà Nội', '19002099'
FROM cinema_brands b
JOIN cities c ON c.city_name = 'Hà Nội' AND c.country = 'Vietnam'
WHERE b.brand_name = 'BHD Star Cineplex'
  AND NOT EXISTS (
    SELECT 1 FROM cinemas existing
    WHERE existing.cinema_name = 'BHD Star Phạm Ngọc Thạch'
      AND existing.address = '2 Phạm Ngọc Thạch, Đống Đa, Hà Nội'
  );

INSERT INTO cinemas (brand_id, city_id, cinema_name, address, phone)
SELECT b.brand_id, c.city_id, 'CineStar Cần Thơ', 'Sense City, Ninh Kiều, Cần Thơ', '19006660'
FROM cinema_brands b
JOIN cities c ON c.city_name = 'Cần Thơ' AND c.country = 'Vietnam'
WHERE b.brand_name = 'CineStar'
  AND NOT EXISTS (
    SELECT 1 FROM cinemas existing
    WHERE existing.cinema_name = 'CineStar Cần Thơ'
      AND existing.address = 'Sense City, Ninh Kiều, Cần Thơ'
  );

INSERT INTO screening_rooms (cinema_id, room_name, room_type)
SELECT c.cinema_id, rt.room_name, rt.room_type
FROM cinemas c
CROSS JOIN (
  SELECT 'Room 1' AS room_name, '2D' AS room_type
  UNION ALL
  SELECT 'Room 2', 'IMAX'
  UNION ALL
  SELECT 'Room 3', '3D'
) rt
WHERE c.cinema_name IN ('CGV Vincom Center Bà Triệu', 'CGV Crescent Mall', 'Lotte Cinema Đà Nẵng', 'Galaxy Nguyễn Du', 'BHD Star Phạm Ngọc Thạch', 'CineStar Cần Thơ')
ON DUPLICATE KEY UPDATE
  room_type = VALUES(room_type),
  status = 'active';

INSERT INTO seats (room_id, row_letter, seat_number, seat_type)
SELECT r.room_id, rp.row_letter, n.seat_number, rp.seat_type
FROM screening_rooms r
JOIN cinemas c ON c.cinema_id = r.cinema_id
CROSS JOIN (
  SELECT 'A' AS row_letter, 'standard' AS seat_type
  UNION ALL
  SELECT 'B', 'standard'
  UNION ALL
  SELECT 'C', 'vip'
  UNION ALL
  SELECT 'D', 'vip'
  UNION ALL
  SELECT 'E', 'couple'
  UNION ALL
  SELECT 'F', 'couple'
) rp
CROSS JOIN (
  SELECT 1 AS seat_number
  UNION ALL
  SELECT 2
  UNION ALL
  SELECT 3
  UNION ALL
  SELECT 4
  UNION ALL
  SELECT 5
  UNION ALL
  SELECT 6
  UNION ALL
  SELECT 7
  UNION ALL
  SELECT 8
  UNION ALL
  SELECT 9
  UNION ALL
  SELECT 10
) n
WHERE c.cinema_name IN ('CGV Vincom Center Bà Triệu', 'CGV Crescent Mall', 'Lotte Cinema Đà Nẵng', 'Galaxy Nguyễn Du', 'BHD Star Phạm Ngọc Thạch', 'CineStar Cần Thơ')
ON DUPLICATE KEY UPDATE
  seat_type = VALUES(seat_type),
  status = 'active';

INSERT INTO movies (
  title, title_en, duration_minutes, genre, age_rating, rating_percent,
  poster_url, banner_url, trailer_url, description, release_date, status
)
VALUES
  ('Lật Mặt 9: Vòng Xoáy', 'Face Off 9', 118, 'Hành động, Tâm lý', 'T16', 92, 'https://placehold.co/400x600?text=Lat+Mat+9', 'https://placehold.co/1200x500?text=Lat+Mat+9', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Một bộ phim hành động Việt Nam với nhịp kể nhanh và nhiều nút thắt.', '2026-05-10', 'now_showing'),
  ('Doraemon: Nobita Và Bản Giao Hưởng Địa Cầu', 'Doraemon: Nobita''s Earth Symphony', 115, 'Hoạt hình, Gia đình', 'P', 89, 'https://placehold.co/400x600?text=Doraemon', 'https://placehold.co/1200x500?text=Doraemon', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Chuyến phiêu lưu âm nhạc dành cho gia đình và trẻ em.', '2026-05-12', 'now_showing'),
  ('Mission: Impossible - Final Reckoning', 'Mission: Impossible - Final Reckoning', 169, 'Hành động, Phiêu lưu', 'T16', 91, 'https://placehold.co/400x600?text=Mission+Impossible', 'https://placehold.co/1200x500?text=Mission+Impossible', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Một nhiệm vụ cuối cùng với quy mô toàn cầu.', '2026-05-15', 'now_showing'),
  ('Conan: Dư Ảnh Của Độc Nhãn', 'Detective Conan: One-Eyed Flashback', 110, 'Hoạt hình, Trinh thám', 'T13', 0, 'https://placehold.co/400x600?text=Conan', 'https://placehold.co/1200x500?text=Conan', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Một vụ án mới kéo Conan vào cuộc truy tìm sự thật.', '2026-06-01', 'upcoming'),
  ('Mưa Đỏ', 'Red Rain', 124, 'Chiến tranh, Lịch sử', 'T16', 86, 'https://placehold.co/400x600?text=Mua+Do', 'https://placehold.co/1200x500?text=Mua+Do', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Câu chuyện lịch sử được kể qua góc nhìn nhân vật trẻ.', '2026-05-08', 'now_showing'),
  ('Inside Out 3', 'Inside Out 3', 102, 'Hoạt hình, Gia đình', 'P', 0, 'https://placehold.co/400x600?text=Inside+Out+3', 'https://placehold.co/1200x500?text=Inside+Out+3', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Một hành trình mới vào thế giới cảm xúc.', '2026-06-20', 'upcoming'),
  ('Địa Đạo: Mặt Trời Trong Bóng Tối', 'Tunnel: Sun in the Dark', 128, 'Lịch sử, Tâm lý', 'T16', 84, 'https://placehold.co/400x600?text=Dia+Dao', 'https://placehold.co/1200x500?text=Dia+Dao', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Bộ phim khai thác tinh thần bền bỉ trong thời chiến.', '2026-04-10', 'ended'),
  ('Fantastic Four: First Steps', 'Fantastic Four: First Steps', 130, 'Siêu anh hùng, Sci-Fi', 'T13', 0, 'https://placehold.co/400x600?text=Fantastic+Four', 'https://placehold.co/1200x500?text=Fantastic+Four', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Một khởi đầu mới cho gia đình siêu anh hùng.', '2026-07-05', 'upcoming')
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  title_en = VALUES(title_en),
  duration_minutes = VALUES(duration_minutes),
  genre = VALUES(genre),
  age_rating = VALUES(age_rating),
  rating_percent = VALUES(rating_percent),
  poster_url = VALUES(poster_url),
  banner_url = VALUES(banner_url),
  trailer_url = VALUES(trailer_url),
  description = VALUES(description),
  release_date = VALUES(release_date),
  status = VALUES(status);

INSERT INTO promotions (
  code, discount_type, discount_value, max_discount_amount, min_order_amount, starts_at, ends_at
)
VALUES
  ('WELCOME10', 'percent', 10, 50000, 100000, '2026-01-01 00:00:00', '2026-12-31 23:59:59'),
  ('STUDENT20', 'percent', 20, 60000, 120000, '2026-01-01 00:00:00', '2026-12-31 23:59:59'),
  ('WEEKDAY50K', 'fixed', 50000, NULL, 200000, '2026-01-01 00:00:00', '2026-12-31 23:59:59'),
  ('COMBO15', 'percent', 15, 40000, 150000, '2026-01-01 00:00:00', '2026-12-31 23:59:59')
ON DUPLICATE KEY UPDATE
  discount_type = VALUES(discount_type),
  discount_value = VALUES(discount_value),
  max_discount_amount = VALUES(max_discount_amount),
  min_order_amount = VALUES(min_order_amount),
  starts_at = VALUES(starts_at),
  ends_at = VALUES(ends_at),
  status = 'active';

INSERT INTO food_combos (cinema_id, combo_name, description, image_url, price)
SELECT c.cinema_id, ct.combo_name, ct.description, ct.image_url, ct.price
FROM cinemas c
CROSS JOIN (
  SELECT 'Combo Solo' AS combo_name, '1 b???p v???a + 1 n?????c ng???t v???a' AS description, 'https://placehold.co/500x350?text=Combo+Solo' AS image_url, 70000 AS price
  UNION ALL
  SELECT 'Combo Couple', '1 b???p l???n + 2 n?????c ng???t v???a', 'https://placehold.co/500x350?text=Combo+Couple', 115000
  UNION ALL
  SELECT 'Combo Family', '2 b???p l???n + 4 n?????c ng???t v???a', 'https://placehold.co/500x350?text=Combo+Family', 210000
) ct
WHERE c.cinema_name IN ('CGV Vincom Center Bà Triệu', 'CGV Crescent Mall', 'Lotte Cinema Đà Nẵng', 'Galaxy Nguyễn Du', 'BHD Star Phạm Ngọc Thạch', 'CineStar Cần Thơ')
ON DUPLICATE KEY UPDATE
  description = VALUES(description),
  image_url = VALUES(image_url),
  price = VALUES(price),
  status = 'active';

INSERT INTO showtimes (
  movie_id, room_id, start_time, end_time, price_standard, price_vip, price_couple
)
SELECT m.movie_id, r.room_id, p.start_time, p.end_time, p.price_standard, p.price_vip, p.price_couple
FROM (
  SELECT 'Face Off 9' AS movie_title_en, 'CGV Vincom Center Bà Triệu' AS cinema_name, 'Room 1' AS room_name, '2026-05-20 10:00:00' AS start_time, '2026-05-20 12:18:00' AS end_time, 80000 AS price_standard, 110000 AS price_vip, 160000 AS price_couple
  UNION ALL
  SELECT 'Doraemon: Nobita''s Earth Symphony', 'CGV Vincom Center Bà Triệu', 'Room 1', '2026-05-20 14:00:00', '2026-05-20 16:15:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Mission: Impossible - Final Reckoning', 'CGV Vincom Center Bà Triệu', 'Room 1', '2026-05-20 18:00:00', '2026-05-20 21:09:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Red Rain', 'CGV Vincom Center Bà Triệu', 'Room 1', '2026-05-20 21:15:00', '2026-05-20 23:39:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Crayon Shin-chan', 'CGV Vincom Center Bà Triệu', 'Room 2', '2026-05-20 10:00:00', '2026-05-20 11:55:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Avengers: Secret Empire', 'CGV Vincom Center Bà Triệu', 'Room 2', '2026-05-20 14:00:00', '2026-05-20 16:35:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Face Off 9', 'CGV Vincom Center Bà Triệu', 'Room 2', '2026-05-20 18:00:00', '2026-05-20 20:18:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Doraemon: Nobita''s Earth Symphony', 'CGV Vincom Center Bà Triệu', 'Room 2', '2026-05-20 21:15:00', '2026-05-20 23:30:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Mission: Impossible - Final Reckoning', 'CGV Vincom Center Bà Triệu', 'Room 3', '2026-05-20 10:00:00', '2026-05-20 13:09:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Red Rain', 'CGV Vincom Center Bà Triệu', 'Room 3', '2026-05-20 14:00:00', '2026-05-20 16:24:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Crayon Shin-chan', 'CGV Vincom Center Bà Triệu', 'Room 3', '2026-05-20 18:00:00', '2026-05-20 19:55:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Avengers: Secret Empire', 'CGV Vincom Center Bà Triệu', 'Room 3', '2026-05-20 21:15:00', '2026-05-20 23:50:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Face Off 9', 'CGV Crescent Mall', 'Room 1', '2026-05-20 10:00:00', '2026-05-20 12:18:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Doraemon: Nobita''s Earth Symphony', 'CGV Crescent Mall', 'Room 1', '2026-05-20 14:00:00', '2026-05-20 16:15:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Mission: Impossible - Final Reckoning', 'CGV Crescent Mall', 'Room 1', '2026-05-20 18:00:00', '2026-05-20 21:09:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Red Rain', 'CGV Crescent Mall', 'Room 1', '2026-05-20 21:15:00', '2026-05-20 23:39:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Crayon Shin-chan', 'CGV Crescent Mall', 'Room 2', '2026-05-20 10:00:00', '2026-05-20 11:55:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Avengers: Secret Empire', 'CGV Crescent Mall', 'Room 2', '2026-05-20 14:00:00', '2026-05-20 16:35:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Face Off 9', 'CGV Crescent Mall', 'Room 2', '2026-05-20 18:00:00', '2026-05-20 20:18:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Doraemon: Nobita''s Earth Symphony', 'CGV Crescent Mall', 'Room 2', '2026-05-20 21:15:00', '2026-05-20 23:30:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Mission: Impossible - Final Reckoning', 'CGV Crescent Mall', 'Room 3', '2026-05-20 10:00:00', '2026-05-20 13:09:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Red Rain', 'CGV Crescent Mall', 'Room 3', '2026-05-20 14:00:00', '2026-05-20 16:24:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Crayon Shin-chan', 'CGV Crescent Mall', 'Room 3', '2026-05-20 18:00:00', '2026-05-20 19:55:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Avengers: Secret Empire', 'CGV Crescent Mall', 'Room 3', '2026-05-20 21:15:00', '2026-05-20 23:50:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Face Off 9', 'Lotte Cinema Đà Nẵng', 'Room 1', '2026-05-20 10:00:00', '2026-05-20 12:18:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Doraemon: Nobita''s Earth Symphony', 'Lotte Cinema Đà Nẵng', 'Room 1', '2026-05-20 14:00:00', '2026-05-20 16:15:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Mission: Impossible - Final Reckoning', 'Lotte Cinema Đà Nẵng', 'Room 1', '2026-05-20 18:00:00', '2026-05-20 21:09:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Red Rain', 'Lotte Cinema Đà Nẵng', 'Room 1', '2026-05-20 21:15:00', '2026-05-20 23:39:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Crayon Shin-chan', 'Lotte Cinema Đà Nẵng', 'Room 2', '2026-05-20 10:00:00', '2026-05-20 11:55:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Avengers: Secret Empire', 'Lotte Cinema Đà Nẵng', 'Room 2', '2026-05-20 14:00:00', '2026-05-20 16:35:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Face Off 9', 'Lotte Cinema Đà Nẵng', 'Room 2', '2026-05-20 18:00:00', '2026-05-20 20:18:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Doraemon: Nobita''s Earth Symphony', 'Lotte Cinema Đà Nẵng', 'Room 2', '2026-05-20 21:15:00', '2026-05-20 23:30:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Mission: Impossible - Final Reckoning', 'CGV Vincom Center Bà Triệu', 'Room 1', '2026-05-21 10:00:00', '2026-05-21 13:09:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Red Rain', 'CGV Vincom Center Bà Triệu', 'Room 1', '2026-05-21 14:00:00', '2026-05-21 16:24:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Crayon Shin-chan', 'CGV Vincom Center Bà Triệu', 'Room 1', '2026-05-21 18:00:00', '2026-05-21 19:55:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Avengers: Secret Empire', 'CGV Vincom Center Bà Triệu', 'Room 1', '2026-05-21 21:15:00', '2026-05-21 23:50:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Face Off 9', 'CGV Vincom Center Bà Triệu', 'Room 2', '2026-05-21 10:00:00', '2026-05-21 12:18:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Doraemon: Nobita''s Earth Symphony', 'CGV Vincom Center Bà Triệu', 'Room 2', '2026-05-21 14:00:00', '2026-05-21 16:15:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Mission: Impossible - Final Reckoning', 'CGV Vincom Center Bà Triệu', 'Room 2', '2026-05-21 18:00:00', '2026-05-21 21:09:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Red Rain', 'CGV Vincom Center Bà Triệu', 'Room 2', '2026-05-21 21:15:00', '2026-05-21 23:39:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Crayon Shin-chan', 'CGV Vincom Center Bà Triệu', 'Room 3', '2026-05-21 10:00:00', '2026-05-21 11:55:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Avengers: Secret Empire', 'CGV Vincom Center Bà Triệu', 'Room 3', '2026-05-21 14:00:00', '2026-05-21 16:35:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Face Off 9', 'CGV Vincom Center Bà Triệu', 'Room 3', '2026-05-21 18:00:00', '2026-05-21 20:18:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Doraemon: Nobita''s Earth Symphony', 'CGV Vincom Center Bà Triệu', 'Room 3', '2026-05-21 21:15:00', '2026-05-21 23:30:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Mission: Impossible - Final Reckoning', 'CGV Crescent Mall', 'Room 1', '2026-05-21 10:00:00', '2026-05-21 13:09:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Red Rain', 'CGV Crescent Mall', 'Room 1', '2026-05-21 14:00:00', '2026-05-21 16:24:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Crayon Shin-chan', 'CGV Crescent Mall', 'Room 1', '2026-05-21 18:00:00', '2026-05-21 19:55:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Avengers: Secret Empire', 'CGV Crescent Mall', 'Room 1', '2026-05-21 21:15:00', '2026-05-21 23:50:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Face Off 9', 'CGV Crescent Mall', 'Room 2', '2026-05-21 10:00:00', '2026-05-21 12:18:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Doraemon: Nobita''s Earth Symphony', 'CGV Crescent Mall', 'Room 2', '2026-05-21 14:00:00', '2026-05-21 16:15:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Mission: Impossible - Final Reckoning', 'CGV Crescent Mall', 'Room 2', '2026-05-21 18:00:00', '2026-05-21 21:09:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Red Rain', 'CGV Crescent Mall', 'Room 2', '2026-05-21 21:15:00', '2026-05-21 23:39:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Crayon Shin-chan', 'CGV Crescent Mall', 'Room 3', '2026-05-21 10:00:00', '2026-05-21 11:55:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Avengers: Secret Empire', 'CGV Crescent Mall', 'Room 3', '2026-05-21 14:00:00', '2026-05-21 16:35:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Face Off 9', 'CGV Crescent Mall', 'Room 3', '2026-05-21 18:00:00', '2026-05-21 20:18:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Doraemon: Nobita''s Earth Symphony', 'CGV Crescent Mall', 'Room 3', '2026-05-21 21:15:00', '2026-05-21 23:30:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Mission: Impossible - Final Reckoning', 'Lotte Cinema Đà Nẵng', 'Room 1', '2026-05-21 10:00:00', '2026-05-21 13:09:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Red Rain', 'Lotte Cinema Đà Nẵng', 'Room 1', '2026-05-21 14:00:00', '2026-05-21 16:24:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Crayon Shin-chan', 'Lotte Cinema Đà Nẵng', 'Room 1', '2026-05-21 18:00:00', '2026-05-21 19:55:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Avengers: Secret Empire', 'Lotte Cinema Đà Nẵng', 'Room 1', '2026-05-21 21:15:00', '2026-05-21 23:50:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Face Off 9', 'Lotte Cinema Đà Nẵng', 'Room 2', '2026-05-21 10:00:00', '2026-05-21 12:18:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Doraemon: Nobita''s Earth Symphony', 'Lotte Cinema Đà Nẵng', 'Room 2', '2026-05-21 14:00:00', '2026-05-21 16:15:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Mission: Impossible - Final Reckoning', 'Lotte Cinema Đà Nẵng', 'Room 2', '2026-05-21 18:00:00', '2026-05-21 21:09:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Red Rain', 'Lotte Cinema Đà Nẵng', 'Room 2', '2026-05-21 21:15:00', '2026-05-21 23:39:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Crayon Shin-chan', 'CGV Vincom Center Bà Triệu', 'Room 1', '2026-05-22 10:00:00', '2026-05-22 11:55:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Avengers: Secret Empire', 'CGV Vincom Center Bà Triệu', 'Room 1', '2026-05-22 14:00:00', '2026-05-22 16:35:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Face Off 9', 'CGV Vincom Center Bà Triệu', 'Room 1', '2026-05-22 18:00:00', '2026-05-22 20:18:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Doraemon: Nobita''s Earth Symphony', 'CGV Vincom Center Bà Triệu', 'Room 1', '2026-05-22 21:15:00', '2026-05-22 23:30:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Mission: Impossible - Final Reckoning', 'CGV Vincom Center Bà Triệu', 'Room 2', '2026-05-22 10:00:00', '2026-05-22 13:09:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Red Rain', 'CGV Vincom Center Bà Triệu', 'Room 2', '2026-05-22 14:00:00', '2026-05-22 16:24:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Crayon Shin-chan', 'CGV Vincom Center Bà Triệu', 'Room 2', '2026-05-22 18:00:00', '2026-05-22 19:55:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Avengers: Secret Empire', 'CGV Vincom Center Bà Triệu', 'Room 2', '2026-05-22 21:15:00', '2026-05-22 23:50:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Face Off 9', 'CGV Vincom Center Bà Triệu', 'Room 3', '2026-05-22 10:00:00', '2026-05-22 12:18:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Doraemon: Nobita''s Earth Symphony', 'CGV Vincom Center Bà Triệu', 'Room 3', '2026-05-22 14:00:00', '2026-05-22 16:15:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Mission: Impossible - Final Reckoning', 'CGV Vincom Center Bà Triệu', 'Room 3', '2026-05-22 18:00:00', '2026-05-22 21:09:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Red Rain', 'CGV Vincom Center Bà Triệu', 'Room 3', '2026-05-22 21:15:00', '2026-05-22 23:39:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Crayon Shin-chan', 'CGV Crescent Mall', 'Room 1', '2026-05-22 10:00:00', '2026-05-22 11:55:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Avengers: Secret Empire', 'CGV Crescent Mall', 'Room 1', '2026-05-22 14:00:00', '2026-05-22 16:35:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Face Off 9', 'CGV Crescent Mall', 'Room 1', '2026-05-22 18:00:00', '2026-05-22 20:18:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Doraemon: Nobita''s Earth Symphony', 'CGV Crescent Mall', 'Room 1', '2026-05-22 21:15:00', '2026-05-22 23:30:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Mission: Impossible - Final Reckoning', 'CGV Crescent Mall', 'Room 2', '2026-05-22 10:00:00', '2026-05-22 13:09:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Red Rain', 'CGV Crescent Mall', 'Room 2', '2026-05-22 14:00:00', '2026-05-22 16:24:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Crayon Shin-chan', 'CGV Crescent Mall', 'Room 2', '2026-05-22 18:00:00', '2026-05-22 19:55:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Avengers: Secret Empire', 'CGV Crescent Mall', 'Room 2', '2026-05-22 21:15:00', '2026-05-22 23:50:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Face Off 9', 'CGV Crescent Mall', 'Room 3', '2026-05-22 10:00:00', '2026-05-22 12:18:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Doraemon: Nobita''s Earth Symphony', 'CGV Crescent Mall', 'Room 3', '2026-05-22 14:00:00', '2026-05-22 16:15:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Mission: Impossible - Final Reckoning', 'CGV Crescent Mall', 'Room 3', '2026-05-22 18:00:00', '2026-05-22 21:09:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Red Rain', 'CGV Crescent Mall', 'Room 3', '2026-05-22 21:15:00', '2026-05-22 23:39:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Crayon Shin-chan', 'Lotte Cinema Đà Nẵng', 'Room 1', '2026-05-22 10:00:00', '2026-05-22 11:55:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Avengers: Secret Empire', 'Lotte Cinema Đà Nẵng', 'Room 1', '2026-05-22 14:00:00', '2026-05-22 16:35:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Face Off 9', 'Lotte Cinema Đà Nẵng', 'Room 1', '2026-05-22 18:00:00', '2026-05-22 20:18:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Doraemon: Nobita''s Earth Symphony', 'Lotte Cinema Đà Nẵng', 'Room 1', '2026-05-22 21:15:00', '2026-05-22 23:30:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Mission: Impossible - Final Reckoning', 'Lotte Cinema Đà Nẵng', 'Room 2', '2026-05-22 10:00:00', '2026-05-22 13:09:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Red Rain', 'Lotte Cinema Đà Nẵng', 'Room 2', '2026-05-22 14:00:00', '2026-05-22 16:24:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Crayon Shin-chan', 'Lotte Cinema Đà Nẵng', 'Room 2', '2026-05-22 18:00:00', '2026-05-22 19:55:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Avengers: Secret Empire', 'Lotte Cinema Đà Nẵng', 'Room 2', '2026-05-22 21:15:00', '2026-05-22 23:50:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Face Off 9', 'CGV Vincom Center Bà Triệu', 'Room 1', '2026-05-23 10:00:00', '2026-05-23 12:18:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Doraemon: Nobita''s Earth Symphony', 'CGV Vincom Center Bà Triệu', 'Room 1', '2026-05-23 14:00:00', '2026-05-23 16:15:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Mission: Impossible - Final Reckoning', 'CGV Vincom Center Bà Triệu', 'Room 1', '2026-05-23 18:00:00', '2026-05-23 21:09:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Red Rain', 'CGV Vincom Center Bà Triệu', 'Room 1', '2026-05-23 21:15:00', '2026-05-23 23:39:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Crayon Shin-chan', 'CGV Vincom Center Bà Triệu', 'Room 2', '2026-05-23 10:00:00', '2026-05-23 11:55:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Avengers: Secret Empire', 'CGV Vincom Center Bà Triệu', 'Room 2', '2026-05-23 14:00:00', '2026-05-23 16:35:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Face Off 9', 'CGV Vincom Center Bà Triệu', 'Room 2', '2026-05-23 18:00:00', '2026-05-23 20:18:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Doraemon: Nobita''s Earth Symphony', 'CGV Vincom Center Bà Triệu', 'Room 2', '2026-05-23 21:15:00', '2026-05-23 23:30:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Mission: Impossible - Final Reckoning', 'CGV Vincom Center Bà Triệu', 'Room 3', '2026-05-23 10:00:00', '2026-05-23 13:09:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Red Rain', 'CGV Vincom Center Bà Triệu', 'Room 3', '2026-05-23 14:00:00', '2026-05-23 16:24:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Crayon Shin-chan', 'CGV Vincom Center Bà Triệu', 'Room 3', '2026-05-23 18:00:00', '2026-05-23 19:55:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Avengers: Secret Empire', 'CGV Vincom Center Bà Triệu', 'Room 3', '2026-05-23 21:15:00', '2026-05-23 23:50:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Face Off 9', 'CGV Crescent Mall', 'Room 1', '2026-05-23 10:00:00', '2026-05-23 12:18:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Doraemon: Nobita''s Earth Symphony', 'CGV Crescent Mall', 'Room 1', '2026-05-23 14:00:00', '2026-05-23 16:15:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Mission: Impossible - Final Reckoning', 'CGV Crescent Mall', 'Room 1', '2026-05-23 18:00:00', '2026-05-23 21:09:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Red Rain', 'CGV Crescent Mall', 'Room 1', '2026-05-23 21:15:00', '2026-05-23 23:39:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Crayon Shin-chan', 'CGV Crescent Mall', 'Room 2', '2026-05-23 10:00:00', '2026-05-23 11:55:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Avengers: Secret Empire', 'CGV Crescent Mall', 'Room 2', '2026-05-23 14:00:00', '2026-05-23 16:35:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Face Off 9', 'CGV Crescent Mall', 'Room 2', '2026-05-23 18:00:00', '2026-05-23 20:18:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Doraemon: Nobita''s Earth Symphony', 'CGV Crescent Mall', 'Room 2', '2026-05-23 21:15:00', '2026-05-23 23:30:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Mission: Impossible - Final Reckoning', 'CGV Crescent Mall', 'Room 3', '2026-05-23 10:00:00', '2026-05-23 13:09:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Red Rain', 'CGV Crescent Mall', 'Room 3', '2026-05-23 14:00:00', '2026-05-23 16:24:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Crayon Shin-chan', 'CGV Crescent Mall', 'Room 3', '2026-05-23 18:00:00', '2026-05-23 19:55:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Avengers: Secret Empire', 'CGV Crescent Mall', 'Room 3', '2026-05-23 21:15:00', '2026-05-23 23:50:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Face Off 9', 'Lotte Cinema Đà Nẵng', 'Room 1', '2026-05-23 10:00:00', '2026-05-23 12:18:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Doraemon: Nobita''s Earth Symphony', 'Lotte Cinema Đà Nẵng', 'Room 1', '2026-05-23 14:00:00', '2026-05-23 16:15:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Mission: Impossible - Final Reckoning', 'Lotte Cinema Đà Nẵng', 'Room 1', '2026-05-23 18:00:00', '2026-05-23 21:09:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Red Rain', 'Lotte Cinema Đà Nẵng', 'Room 1', '2026-05-23 21:15:00', '2026-05-23 23:39:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Crayon Shin-chan', 'Lotte Cinema Đà Nẵng', 'Room 2', '2026-05-23 10:00:00', '2026-05-23 11:55:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Avengers: Secret Empire', 'Lotte Cinema Đà Nẵng', 'Room 2', '2026-05-23 14:00:00', '2026-05-23 16:35:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Face Off 9', 'Lotte Cinema Đà Nẵng', 'Room 2', '2026-05-23 18:00:00', '2026-05-23 20:18:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Doraemon: Nobita''s Earth Symphony', 'Lotte Cinema Đà Nẵng', 'Room 2', '2026-05-23 21:15:00', '2026-05-23 23:30:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Mission: Impossible - Final Reckoning', 'CGV Vincom Center Bà Triệu', 'Room 1', '2026-05-24 10:00:00', '2026-05-24 13:09:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Red Rain', 'CGV Vincom Center Bà Triệu', 'Room 1', '2026-05-24 14:00:00', '2026-05-24 16:24:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Crayon Shin-chan', 'CGV Vincom Center Bà Triệu', 'Room 1', '2026-05-24 18:00:00', '2026-05-24 19:55:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Avengers: Secret Empire', 'CGV Vincom Center Bà Triệu', 'Room 1', '2026-05-24 21:15:00', '2026-05-24 23:50:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Face Off 9', 'CGV Vincom Center Bà Triệu', 'Room 2', '2026-05-24 10:00:00', '2026-05-24 12:18:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Doraemon: Nobita''s Earth Symphony', 'CGV Vincom Center Bà Triệu', 'Room 2', '2026-05-24 14:00:00', '2026-05-24 16:15:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Mission: Impossible - Final Reckoning', 'CGV Vincom Center Bà Triệu', 'Room 2', '2026-05-24 18:00:00', '2026-05-24 21:09:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Red Rain', 'CGV Vincom Center Bà Triệu', 'Room 2', '2026-05-24 21:15:00', '2026-05-24 23:39:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Crayon Shin-chan', 'CGV Vincom Center Bà Triệu', 'Room 3', '2026-05-24 10:00:00', '2026-05-24 11:55:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Avengers: Secret Empire', 'CGV Vincom Center Bà Triệu', 'Room 3', '2026-05-24 14:00:00', '2026-05-24 16:35:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Face Off 9', 'CGV Vincom Center Bà Triệu', 'Room 3', '2026-05-24 18:00:00', '2026-05-24 20:18:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Doraemon: Nobita''s Earth Symphony', 'CGV Vincom Center Bà Triệu', 'Room 3', '2026-05-24 21:15:00', '2026-05-24 23:30:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Mission: Impossible - Final Reckoning', 'CGV Crescent Mall', 'Room 1', '2026-05-24 10:00:00', '2026-05-24 13:09:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Red Rain', 'CGV Crescent Mall', 'Room 1', '2026-05-24 14:00:00', '2026-05-24 16:24:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Crayon Shin-chan', 'CGV Crescent Mall', 'Room 1', '2026-05-24 18:00:00', '2026-05-24 19:55:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Avengers: Secret Empire', 'CGV Crescent Mall', 'Room 1', '2026-05-24 21:15:00', '2026-05-24 23:50:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Face Off 9', 'CGV Crescent Mall', 'Room 2', '2026-05-24 10:00:00', '2026-05-24 12:18:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Doraemon: Nobita''s Earth Symphony', 'CGV Crescent Mall', 'Room 2', '2026-05-24 14:00:00', '2026-05-24 16:15:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Mission: Impossible - Final Reckoning', 'CGV Crescent Mall', 'Room 2', '2026-05-24 18:00:00', '2026-05-24 21:09:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Red Rain', 'CGV Crescent Mall', 'Room 2', '2026-05-24 21:15:00', '2026-05-24 23:39:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Crayon Shin-chan', 'CGV Crescent Mall', 'Room 3', '2026-05-24 10:00:00', '2026-05-24 11:55:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Avengers: Secret Empire', 'CGV Crescent Mall', 'Room 3', '2026-05-24 14:00:00', '2026-05-24 16:35:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Face Off 9', 'CGV Crescent Mall', 'Room 3', '2026-05-24 18:00:00', '2026-05-24 20:18:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Doraemon: Nobita''s Earth Symphony', 'CGV Crescent Mall', 'Room 3', '2026-05-24 21:15:00', '2026-05-24 23:30:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Mission: Impossible - Final Reckoning', 'Lotte Cinema Đà Nẵng', 'Room 1', '2026-05-24 10:00:00', '2026-05-24 13:09:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Red Rain', 'Lotte Cinema Đà Nẵng', 'Room 1', '2026-05-24 14:00:00', '2026-05-24 16:24:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Crayon Shin-chan', 'Lotte Cinema Đà Nẵng', 'Room 1', '2026-05-24 18:00:00', '2026-05-24 19:55:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Avengers: Secret Empire', 'Lotte Cinema Đà Nẵng', 'Room 1', '2026-05-24 21:15:00', '2026-05-24 23:50:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Face Off 9', 'Lotte Cinema Đà Nẵng', 'Room 2', '2026-05-24 10:00:00', '2026-05-24 12:18:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Doraemon: Nobita''s Earth Symphony', 'Lotte Cinema Đà Nẵng', 'Room 2', '2026-05-24 14:00:00', '2026-05-24 16:15:00', 80000, 110000, 160000
  UNION ALL
  SELECT 'Mission: Impossible - Final Reckoning', 'Lotte Cinema Đà Nẵng', 'Room 2', '2026-05-24 18:00:00', '2026-05-24 21:09:00', 95000, 125000, 190000
  UNION ALL
  SELECT 'Red Rain', 'Lotte Cinema Đà Nẵng', 'Room 2', '2026-05-24 21:15:00', '2026-05-24 23:39:00', 95000, 125000, 190000
) p
JOIN movies m ON m.title_en = p.movie_title_en
JOIN cinemas c ON c.cinema_name = p.cinema_name
JOIN screening_rooms r ON r.cinema_id = c.cinema_id AND r.room_name = p.room_name
ON DUPLICATE KEY UPDATE
  movie_id = VALUES(movie_id),
  end_time = VALUES(end_time),
  price_standard = VALUES(price_standard),
  price_vip = VALUES(price_vip),
  price_couple = VALUES(price_couple),
  status = 'scheduled';

INSERT INTO showtime_seats (showtime_id, seat_id, price)
SELECT
  st.showtime_id,
  s.seat_id,
  CASE s.seat_type
    WHEN 'vip' THEN st.price_vip
    WHEN 'couple' THEN st.price_couple
    ELSE st.price_standard
  END AS price
FROM showtimes st
JOIN screening_rooms r ON r.room_id = st.room_id
JOIN cinemas c ON c.cinema_id = r.cinema_id
JOIN seats s ON s.room_id = st.room_id
LEFT JOIN showtime_seats ss
  ON ss.showtime_id = st.showtime_id
 AND ss.seat_id = s.seat_id
WHERE st.start_time BETWEEN '2026-05-20 00:00:00' AND '2026-05-24 23:59:59'
  AND (
      (c.cinema_name = 'CGV Vincom Center Bà Triệu' AND r.room_name = 'Room 1')
      OR (c.cinema_name = 'CGV Vincom Center Bà Triệu' AND r.room_name = 'Room 2')
      OR (c.cinema_name = 'CGV Vincom Center Bà Triệu' AND r.room_name = 'Room 3')
      OR (c.cinema_name = 'CGV Crescent Mall' AND r.room_name = 'Room 1')
      OR (c.cinema_name = 'CGV Crescent Mall' AND r.room_name = 'Room 2')
      OR (c.cinema_name = 'CGV Crescent Mall' AND r.room_name = 'Room 3')
      OR (c.cinema_name = 'Lotte Cinema Đà Nẵng' AND r.room_name = 'Room 1')
      OR (c.cinema_name = 'Lotte Cinema Đà Nẵng' AND r.room_name = 'Room 2')
  )
  AND s.status = 'active'
  AND ss.showtime_seat_id IS NULL;

INSERT INTO bookings (
  booking_code, customer_id, showtime_id, status, subtotal_amount, discount_amount, final_amount, expires_at
)
SELECT
  'DEMO-CONFIRMED-001',
  customer.customer_id,
  st.showtime_id,
  'confirmed',
  seat_summary.ticket_subtotal + combo.price,
  0,
  seat_summary.ticket_subtotal + combo.price,
  NULL
FROM customers customer
JOIN showtimes st ON st.start_time = '2026-05-20 10:00:00'
JOIN screening_rooms room ON room.room_id = st.room_id AND room.room_name = 'Room 1'
JOIN cinemas cinema ON cinema.cinema_id = room.cinema_id AND cinema.cinema_name = 'CGV Vincom Center Bà Triệu'
JOIN food_combos combo ON combo.cinema_id = cinema.cinema_id AND combo.combo_name = 'Combo Solo'
CROSS JOIN (
  SELECT SUM(selected_seats.price) AS ticket_subtotal
  FROM (
    SELECT ss.price
    FROM showtime_seats ss
    JOIN showtimes selected_showtime ON selected_showtime.showtime_id = ss.showtime_id
    JOIN screening_rooms selected_room ON selected_room.room_id = selected_showtime.room_id
    JOIN cinemas selected_cinema ON selected_cinema.cinema_id = selected_room.cinema_id
    WHERE selected_cinema.cinema_name = 'CGV Vincom Center Bà Triệu'
      AND selected_room.room_name = 'Room 1'
      AND selected_showtime.start_time = '2026-05-20 10:00:00'
      AND ss.status = 'available'
    ORDER BY ss.showtime_seat_id
    LIMIT 2
  ) selected_seats
) seat_summary
WHERE customer.email = 'customer@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM bookings existing
    WHERE existing.booking_code = 'DEMO-CONFIRMED-001'
  );

UPDATE showtime_seats
SET status = 'booked',
    held_by_booking_id = NULL,
    held_until = NULL
WHERE showtime_seat_id IN (
  SELECT selected.showtime_seat_id
  FROM (
    SELECT ss.showtime_seat_id
    FROM showtime_seats ss
    JOIN showtimes st ON st.showtime_id = ss.showtime_id
    JOIN screening_rooms room ON room.room_id = st.room_id
    JOIN cinemas cinema ON cinema.cinema_id = room.cinema_id
    WHERE cinema.cinema_name = 'CGV Vincom Center Bà Triệu'
      AND room.room_name = 'Room 1'
      AND st.start_time = '2026-05-20 10:00:00'
    ORDER BY ss.showtime_seat_id
    LIMIT 2
  ) selected
);

INSERT IGNORE INTO tickets (booking_id, showtime_seat_id, seat_id, actual_price)
SELECT booking.booking_id, ss.showtime_seat_id, ss.seat_id, ss.price
FROM bookings booking
JOIN showtimes st ON st.showtime_id = booking.showtime_id
JOIN showtime_seats ss ON ss.showtime_id = st.showtime_id
WHERE booking.booking_code = 'DEMO-CONFIRMED-001'
  AND ss.status = 'booked'
ORDER BY ss.showtime_seat_id
LIMIT 2;

INSERT INTO booking_food_combos (booking_id, food_combo_id, quantity, unit_price, line_total)
SELECT booking.booking_id, combo.food_combo_id, 1, combo.price, combo.price
FROM bookings booking
JOIN showtimes st ON st.showtime_id = booking.showtime_id
JOIN screening_rooms room ON room.room_id = st.room_id
JOIN cinemas cinema ON cinema.cinema_id = room.cinema_id
JOIN food_combos combo ON combo.cinema_id = cinema.cinema_id AND combo.combo_name = 'Combo Solo'
WHERE booking.booking_code = 'DEMO-CONFIRMED-001'
ON DUPLICATE KEY UPDATE
  quantity = VALUES(quantity),
  unit_price = VALUES(unit_price),
  line_total = VALUES(line_total);

INSERT INTO payments (booking_id, amount, payment_method, status, transaction_id, payment_time)
SELECT booking.booking_id, booking.final_amount, 'momo', 'success', 'DEMO-TXN-001', NOW()
FROM bookings booking
WHERE booking.booking_code = 'DEMO-CONFIRMED-001'
ON DUPLICATE KEY UPDATE
  booking_id = VALUES(booking_id),
  amount = VALUES(amount),
  status = 'success',
  payment_time = NOW();

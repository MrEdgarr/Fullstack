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
    slug VARCHAR(255) NOT NULL,
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
    UNIQUE KEY uk_movies_slug (slug),
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
    slug,
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
    'shin-cau-be-but-chi',
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
    'avengers-secret-empire',
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

-- =============================================================================
-- CINEHUB ADMIN AGGREGATOR - IDEMPOTENT DATABASE UPGRADE & SEED (MySQL 8.0+)
-- Safe to run multiple times in phpMyAdmin / MySQL Workbench / CLI (No #1060)
-- =============================================================================

SET NAMES utf8mb4;

-- =============================================================================
-- 1. UPGRADE cinema_brands (Safe Column Checks)
-- =============================================================================

SET @s = (SELECT IF(COUNT(*) = 0, "ALTER TABLE cinema_brands ADD COLUMN brand_code VARCHAR(20) DEFAULT NULL", "SELECT 1") FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cinema_brands' AND COLUMN_NAME = 'brand_code');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(COUNT(*) = 0, "ALTER TABLE cinema_brands ADD COLUMN commission_rate DECIMAL(5, 2) NOT NULL DEFAULT 5.50", "SELECT 1") FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cinema_brands' AND COLUMN_NAME = 'commission_rate');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(COUNT(*) = 0, "ALTER TABLE cinema_brands ADD COLUMN settlement_cycle ENUM('daily', 't3', 'weekly', 'monthly') NOT NULL DEFAULT 't3'", "SELECT 1") FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cinema_brands' AND COLUMN_NAME = 'settlement_cycle');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(COUNT(*) = 0, "ALTER TABLE cinema_brands ADD COLUMN api_status ENUM('healthy', 'latency_warning', 'maintenance') NOT NULL DEFAULT 'healthy'", "SELECT 1") FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cinema_brands' AND COLUMN_NAME = 'api_status');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(COUNT(*) = 0, "ALTER TABLE cinema_brands ADD COLUMN latency_ms INT NOT NULL DEFAULT 45", "SELECT 1") FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cinema_brands' AND COLUMN_NAME = 'latency_ms');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(COUNT(*) = 0, "ALTER TABLE cinema_brands ADD COLUMN sync_protocol VARCHAR(150) DEFAULT 'REST Gateway v2.0'", "SELECT 1") FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cinema_brands' AND COLUMN_NAME = 'sync_protocol');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(COUNT(*) = 0, "ALTER TABLE cinema_brands ADD COLUMN active_contract_until DATE DEFAULT '2027-12-31'", "SELECT 1") FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cinema_brands' AND COLUMN_NAME = 'active_contract_until');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(COUNT(*) = 0, "ALTER TABLE cinema_brands ADD COLUMN co_funding_promos TINYINT(1) NOT NULL DEFAULT 1", "SELECT 1") FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cinema_brands' AND COLUMN_NAME = 'co_funding_promos');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

INSERT INTO cinema_brands (brand_name, logo_url, status, brand_code, commission_rate, settlement_cycle, api_status, latency_ms, sync_protocol, active_contract_until, co_funding_promos)
VALUES
  ('Beta Cinemas', 'https://placehold.co/240x120?text=Beta', 'active', 'BETA', 7.20, 'daily', 'healthy', 52, 'Beta Cloud Connect POS API', '2028-01-01', 1),
  ('Mega GS Cinemas', 'https://placehold.co/240x120?text=MegaGS', 'active', 'MGS', 6.50, 'monthly', 'healthy', 55, 'Mega GS Gateway Sync v2', '2026-12-31', 0)
ON DUPLICATE KEY UPDATE
  brand_code = VALUES(brand_code),
  commission_rate = VALUES(commission_rate),
  settlement_cycle = VALUES(settlement_cycle),
  sync_protocol = VALUES(sync_protocol);

UPDATE cinema_brands SET
  brand_code = 'CGV',
  commission_rate = 4.80,
  settlement_cycle = 'daily',
  api_status = 'healthy',
  latency_ms = 38,
  sync_protocol = 'CJ CGV Vista API v4.8 (Webhook Direct)',
  active_contract_until = '2027-12-31',
  co_funding_promos = 1
WHERE brand_id = 1 OR brand_name LIKE '%CGV%';

UPDATE cinema_brands SET
  brand_code = 'LOTTE',
  commission_rate = 5.20,
  settlement_cycle = 't3',
  api_status = 'healthy',
  latency_ms = 64,
  sync_protocol = 'Lotte RTS Cinema Core Socket v2.1',
  active_contract_until = '2027-06-30',
  co_funding_promos = 1
WHERE brand_id = 2 OR brand_name LIKE '%Lotte%';

UPDATE cinema_brands SET
  brand_code = 'GLX',
  commission_rate = 5.50,
  settlement_cycle = 'weekly',
  api_status = 'healthy',
  latency_ms = 42,
  sync_protocol = 'Galaxy Cloud Sync REST Engine',
  active_contract_until = '2026-11-30',
  co_funding_promos = 1
WHERE brand_id = 3 OR brand_name LIKE '%Galaxy%';

UPDATE cinema_brands SET
  brand_code = 'BHD',
  commission_rate = 6.00,
  settlement_cycle = 't3',
  api_status = 'latency_warning',
  latency_ms = 148,
  sync_protocol = 'BHD GraphQL Ticketing Gateway v3',
  active_contract_until = '2026-09-15',
  co_funding_promos = 0
WHERE brand_id = 4 OR brand_name LIKE '%BHD%';

UPDATE cinema_brands SET
  brand_code = 'STAR',
  commission_rate = 7.00,
  settlement_cycle = 'weekly',
  api_status = 'healthy',
  latency_ms = 61,
  sync_protocol = 'Cinestar Core Hub v1.9',
  active_contract_until = '2027-04-10',
  co_funding_promos = 1
WHERE brand_id = 5 OR brand_name LIKE '%CineStar%';

-- =============================================================================
-- 2. UPGRADE cinemas (Safe Column Checks)
-- =============================================================================

SET @s = (SELECT IF(COUNT(*) = 0, "ALTER TABLE cinemas ADD COLUMN district VARCHAR(100) DEFAULT 'Trung tâm'", "SELECT 1") FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cinemas' AND COLUMN_NAME = 'district');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(COUNT(*) = 0, "ALTER TABLE cinemas ADD COLUMN special_formats VARCHAR(255) DEFAULT 'Dolby Atmos, 2D Laser'", "SELECT 1") FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cinemas' AND COLUMN_NAME = 'special_formats');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

UPDATE cinemas SET district = 'Hai Bà Trưng', special_formats = 'IMAX Laser, Gold Class' WHERE cinema_name LIKE '%Bà Triệu%';
UPDATE cinemas SET district = 'Quận 7', special_formats = 'IMAX Laser, 4DX' WHERE cinema_name LIKE '%Crescent%';
UPDATE cinemas SET district = 'Hải Châu', special_formats = 'Dolby Atmos, Superplex' WHERE cinema_name LIKE '%Đà Nẵng%';
UPDATE cinemas SET district = 'Quận 1', special_formats = 'Dolby Atmos, ScreenX' WHERE cinema_name LIKE '%Nguyễn Du%';
UPDATE cinemas SET district = 'Đống Đa', special_formats = 'Dolby Atmos, Onyx LED' WHERE cinema_name LIKE '%Phạm Ngọc Thạch%';
UPDATE cinemas SET district = 'Ninh Kiều', special_formats = 'Dolby Atmos, 2D Laser' WHERE cinema_name LIKE '%Cần Thơ%';
UPDATE cinemas SET district = 'Thanh Xuân', special_formats = 'IMAX Laser, Dolby Atmos' WHERE cinema_name LIKE '%Royal%';
UPDATE cinemas SET district = 'Bình Thạnh', special_formats = 'IMAX Laser, Gold Class' WHERE cinema_name LIKE '%Landmark%';

-- =============================================================================
-- 3. UPGRADE movies (Safe Column Checks)
-- =============================================================================

ALTER TABLE movies
  MODIFY COLUMN status ENUM('upcoming', 'coming_soon', 'sneak_show', 'now_showing', 'ended') NOT NULL DEFAULT 'upcoming';

SET @s = (SELECT IF(COUNT(*) = 0, "ALTER TABLE movies ADD COLUMN director VARCHAR(150) DEFAULT 'Đạo diễn Quốc tế'", "SELECT 1") FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'movies' AND COLUMN_NAME = 'director');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(COUNT(*) = 0, "ALTER TABLE movies ADD COLUMN cast_members VARCHAR(500) DEFAULT 'Dàn diễn viên chính'", "SELECT 1") FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'movies' AND COLUMN_NAME = 'cast_members');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(COUNT(*) = 0, "ALTER TABLE movies ADD COLUMN country VARCHAR(100) DEFAULT 'Việt Nam'", "SELECT 1") FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'movies' AND COLUMN_NAME = 'country');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(COUNT(*) = 0, "ALTER TABLE movies ADD COLUMN censorship_license VARCHAR(255) DEFAULT 'GP số 248/QĐ-ĐA - Cục Điện Ảnh cấp phép phổ biến toàn quốc'", "SELECT 1") FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'movies' AND COLUMN_NAME = 'censorship_license');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(COUNT(*) = 0, "ALTER TABLE movies ADD COLUMN language_info VARCHAR(150) DEFAULT 'Phụ đề & Lồng tiếng Việt'", "SELECT 1") FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'movies' AND COLUMN_NAME = 'language_info');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(COUNT(*) = 0, "ALTER TABLE movies ADD COLUMN formats VARCHAR(255) DEFAULT '2D Phụ đề, IMAX Laser'", "SELECT 1") FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'movies' AND COLUMN_NAME = 'formats');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

UPDATE movies SET director = 'Lý Hải', cast_members = 'Thanh Hiền, Trương Minh Cường, Đinh Y Nhung, Quách Ngọc Tuyên', country = 'Việt Nam', language_info = 'Tiếng Việt - Phụ đề Anh', formats = '2D Phụ đề, Dolby Atmos', censorship_license = 'GP số 612/QĐ-ĐA - Phổ biến cho khán giả từ 16 tuổi trở lên' WHERE title LIKE '%Lật Mặt%';
UPDATE movies SET director = 'Kazuaki Imai', cast_members = 'Wasabi Mizuta, Megumi Ohara, Yumi Kakazu', country = 'Nhật Bản', language_info = 'Tiếng Nhật - Lồng tiếng & Phụ đề Việt', formats = '2D Lồng tiếng, 2D Phụ đề', censorship_license = 'GP số 118/QĐ-ĐA - Phổ biến mọi độ tuổi (P)' WHERE title LIKE '%Doraemon%';
UPDATE movies SET director = 'Christopher McQuarrie', cast_members = 'Tom Cruise, Hayley Atwell, Ving Rhames, Simon Pegg', country = 'Mỹ', language_info = 'Tiếng Anh - Phụ đề Việt', formats = 'IMAX Laser, 4DX, ScreenX, 2D Phụ đề', censorship_license = 'GP số 305/QĐ-ĐA - Phổ biến từ 16 tuổi trở lên' WHERE title LIKE '%Mission%';
UPDATE movies SET director = 'Đặng Thái Huyền', cast_members = 'Hứa Vĩ Văn, Doãn Quốc Đam, Tuấn Trần', country = 'Việt Nam', language_info = 'Tiếng Việt', formats = '2D Phụ đề, Dolby Atmos', censorship_license = 'GP số 410/QĐ-ĐA - Cục Điện Ảnh cấp phép' WHERE title LIKE '%Mưa Đỏ%';
UPDATE movies SET director = 'Masakazu Hashimoto', cast_members = 'Yumiko Kobayashi, Miki Narahashi, Toshiyuki Morikawa', country = 'Nhật Bản', language_info = 'Tiếng Nhật - Lồng tiếng Việt', formats = '2D Lồng tiếng, 2D Phụ đề', censorship_license = 'GP số 219/QĐ-ĐA - Khán giả dưới 13 tuổi có người giám hộ (K)' WHERE title LIKE '%Shin%';
UPDATE movies SET director = 'Chika Nagaoka', cast_members = 'Minami Takayama, Wakana Yamazaki, Rikiya Koyama', country = 'Nhật Bản', language_info = 'Tiếng Nhật - Phụ đề & Lồng tiếng Việt', formats = '2D Lồng tiếng, 2D Phụ đề, 4DX', censorship_license = 'GP số 521/QĐ-ĐA - Phổ biến khán giả từ 13 tuổi' WHERE title LIKE '%Conan%';
UPDATE movies SET director = 'Bùi Thạc Chuyên', cast_members = 'Thái Hòa, Quang Tuấn, Hồ Thu Anh', country = 'Việt Nam', language_info = 'Tiếng Việt - Phụ đề Anh', formats = 'IMAX Laser, 2D Phụ đề', censorship_license = 'GP số 399/QĐ-ĐA - Cục Điện Ảnh cấp phép toàn quốc' WHERE title LIKE '%Địa Đạo%';

-- =============================================================================
-- 4. UPGRADE promotions (Safe Column Checks)
-- =============================================================================

SET @s = (SELECT IF(COUNT(*) = 0, "ALTER TABLE promotions ADD COLUMN title VARCHAR(200) DEFAULT NULL", "SELECT 1") FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'promotions' AND COLUMN_NAME = 'title');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(COUNT(*) = 0, "ALTER TABLE promotions ADD COLUMN description VARCHAR(500) DEFAULT NULL", "SELECT 1") FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'promotions' AND COLUMN_NAME = 'description');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(COUNT(*) = 0, "ALTER TABLE promotions ADD COLUMN applicable_chains VARCHAR(255) DEFAULT 'all'", "SELECT 1") FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'promotions' AND COLUMN_NAME = 'applicable_chains');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(COUNT(*) = 0, "ALTER TABLE promotions ADD COLUMN budget_limit DECIMAL(14, 2) NOT NULL DEFAULT 150000000.00", "SELECT 1") FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'promotions' AND COLUMN_NAME = 'budget_limit');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(COUNT(*) = 0, "ALTER TABLE promotions ADD COLUMN budget_spent DECIMAL(14, 2) NOT NULL DEFAULT 42500000.00", "SELECT 1") FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'promotions' AND COLUMN_NAME = 'budget_spent');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(COUNT(*) = 0, "ALTER TABLE promotions ADD COLUMN platform_split_ratio INT NOT NULL DEFAULT 50", "SELECT 1") FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'promotions' AND COLUMN_NAME = 'platform_split_ratio');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(COUNT(*) = 0, "ALTER TABLE promotions ADD COLUMN used_count INT NOT NULL DEFAULT 1250", "SELECT 1") FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'promotions' AND COLUMN_NAME = 'used_count');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

UPDATE promotions SET
  title = 'Ưu Đãi Chào Bạn Mới - Giảm 10%',
  description = 'Áp dụng cho tất cả rạp CGV, Lotte và Galaxy trên toàn quốc.',
  applicable_chains = 'cgv,lotte,galaxy',
  budget_limit = 200000000.00,
  budget_spent = 142500000.00,
  platform_split_ratio = 60,
  used_count = 3562
WHERE code = 'WELCOME10';

UPDATE promotions SET
  title = 'HSSV Siêu Rẻ - Giảm 20% Giá Vé',
  description = 'Ưu đãi dành cho Học sinh Sinh viên tại mọi cụm rạp đối tác.',
  applicable_chains = 'beta,cinestar,cgv',
  budget_limit = 100000000.00,
  budget_spent = 68400000.00,
  platform_split_ratio = 40,
  used_count = 2490
WHERE code = 'STUDENT20';

UPDATE promotions SET
  title = 'Thứ Tư Vui Vẻ - Giảm Ngay 50.000đ',
  description = 'Ưu đãi liên kết ngân hàng & ví điện tử cho giao dịch từ 200k.',
  applicable_chains = 'all',
  budget_limit = 150000000.00,
  budget_spent = 58200000.00,
  platform_split_ratio = 50,
  used_count = 1164
WHERE code = 'WEEKDAY50K';

UPDATE promotions SET
  title = 'Quét VietQR / Combo Bắp Nước',
  description = 'Tài trợ chéo khi đặt vé kèm Combo bắp nước trên toàn hệ thống.',
  applicable_chains = 'all',
  budget_limit = 120000000.00,
  budget_spent = 39600000.00,
  platform_split_ratio = 55,
  used_count = 980
WHERE code IN ('COMBO15', 'FIXED20K');

-- =============================================================================
-- 5. UPGRADE bookings (Safe Column Checks)
-- =============================================================================

SET @s = (SELECT IF(COUNT(*) = 0, "ALTER TABLE bookings ADD COLUMN partner_ticket_code VARCHAR(50) DEFAULT NULL", "SELECT 1") FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'partner_ticket_code');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(COUNT(*) = 0, "ALTER TABLE bookings ADD COLUMN ticket_status ENUM('issued', 'checked_in', 'sync_error') NOT NULL DEFAULT 'issued'", "SELECT 1") FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'ticket_status');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

UPDATE bookings SET
  partner_ticket_code = CONCAT('VISTA-POS-', LPAD(booking_id, 5, '0')),
  ticket_status = CASE
    WHEN status = 'cancelled' THEN 'sync_error'
    WHEN status = 'completed' THEN 'checked_in'
    ELSE 'issued'
  END
WHERE partner_ticket_code IS NULL;

-- =============================================================================
-- 6. CREATE & SEED partner_settlements
-- =============================================================================

CREATE TABLE IF NOT EXISTS partner_settlements (
  settlement_id INT NOT NULL AUTO_INCREMENT,
  settlement_code VARCHAR(50) NOT NULL,
  brand_id INT NOT NULL,
  period_label VARCHAR(100) NOT NULL,
  total_transactions INT NOT NULL DEFAULT 0,
  total_gmv DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  platform_commission DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  discount_co_funded DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  net_payable_to_partner DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  discrepancies_count INT NOT NULL DEFAULT 0,
  status ENUM('audited', 'approved', 'paid') NOT NULL DEFAULT 'audited',
  due_date DATE DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (settlement_id),
  UNIQUE KEY uk_partner_settlements_code (settlement_code),
  KEY idx_partner_settlements_brand (brand_id),
  CONSTRAINT fk_partner_settlements_brand FOREIGN KEY (brand_id) REFERENCES cinema_brands (brand_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

INSERT INTO partner_settlements (
  settlement_code, brand_id, period_label, total_transactions, total_gmv,
  platform_commission, discount_co_funded, net_payable_to_partner, discrepancies_count, status, due_date
)
VALUES
  ('set-cgv-1026', 1, 'Kỳ Đối Soát Tháng 10/2026', 98450, 12480000000.00, 599040000.00, 114200000.00, 11766760000.00, 3, 'audited', '2026-11-07'),
  ('set-lotte-1026', 2, 'Kỳ Đối Soát Tháng 10/2026', 64200, 7120000000.00, 370240000.00, 68500000.00, 6681260000.00, 1, 'approved', '2026-11-05'),
  ('set-glx-1026', 3, 'Kỳ Đối Soát Tháng 10/2026', 41800, 4350000000.00, 239250000.00, 42000000.00, 4068750000.00, 0, 'paid', '2026-11-02'),
  ('set-bhd-1026', 4, 'Kỳ Đối Soát Tháng 10/2026', 28900, 2680000000.00, 160800000.00, 25400000.00, 2493800000.00, 0, 'audited', '2026-11-07'),
  ('set-star-1026', 5, 'Kỳ Đối Soát Tháng 10/2026', 31400, 2180000000.00, 152600000.00, 19800000.00, 2007600000.00, 0, 'paid', '2026-11-01')
ON DUPLICATE KEY UPDATE
  total_transactions = VALUES(total_transactions),
  total_gmv = VALUES(total_gmv),
  platform_commission = VALUES(platform_commission),
  net_payable_to_partner = VALUES(net_payable_to_partner);

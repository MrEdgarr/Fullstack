-- =============================================================================
-- SQL SCRIPT: FULL KHUNG GIỜ CHIẾU TOÀN BỘ CÁC CA (ĐÃ LOẠI BỎ 100% PHÒNG 3D)
-- =============================================================================
-- Mô tả:
-- 1. Xóa sạch 100% tất cả suất chiếu phòng 3D (không còn hiển thị 3D trên web).
-- 2. Chuyển đổi các phòng 3D cũ thành phòng 2D tiêu chuẩn (Room 3).
-- 3. Bổ sung các phòng chiếu 2D (Room 4, Room 5, Room 6) và sinh ghế tự động.
-- 4. Đảm bảo mỗi bộ phim đều có FULL CÁC KHUNG GIỜ CHIẾU TRONG NGÀY (Sáng đến Đêm).
-- 5. Lập đầy lịch chiếu cho 7 ngày tới (từ hôm nay CURDATE() đến 6 ngày tiếp theo).
-- 6. Tự động sinh toàn bộ ghế trống (showtime_seats) với trạng thái 'available'.
-- =============================================================================

START TRANSACTION;

-- 1. Xóa sạch tất cả suất chiếu phòng 3D chưa có người đặt vé
DELETE st FROM showtimes st
JOIN screening_rooms r ON st.room_id = r.room_id
LEFT JOIN bookings b ON b.showtime_id = st.showtime_id
WHERE r.room_type = '3D' AND b.booking_id IS NULL;

-- 2. Chuyển đổi phòng 3D cũ thành phòng 2D (Room 3)
UPDATE screening_rooms
SET room_type = '2D', room_name = 'Room 3'
WHERE room_type = '3D';

-- 3. Bổ sung thêm các phòng 2D (Room 4, Room 5, Room 6) cho các rạp
INSERT IGNORE INTO screening_rooms (cinema_id, room_name, room_type, status)
SELECT c.cinema_id, r.room_name, '2D', 'active'
FROM cinemas c
CROSS JOIN (
    SELECT 'Room 4' AS room_name
    UNION ALL SELECT 'Room 5'
    UNION ALL SELECT 'Room 6'
) r;

-- 4. Tự động sinh ghế ngồi (60 ghế/phòng) cho các phòng mới bổ sung
INSERT INTO seats (room_id, row_letter, seat_number, seat_type, status)
SELECT r.room_id, rows_grid.row_letter, num_grid.seat_number, rows_grid.seat_type, 'active'
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
LEFT JOIN seats s ON s.room_id = r.room_id 
                 AND s.row_letter = rows_grid.row_letter 
                 AND s.seat_number = num_grid.seat_number
WHERE s.seat_id IS NULL AND r.room_type IN ('2D', 'IMAX') AND r.status = 'active';

-- 5. Làm mới an toàn: Xóa các suất chiếu cũ trong 7 ngày tới chưa có khách đặt vé
DELETE st FROM showtimes st
LEFT JOIN bookings b ON b.showtime_id = st.showtime_id
WHERE st.start_time >= CURDATE()
  AND b.booking_id IS NULL;

-- 6. Đảm bảo trạng thái phim phát hành hợp lệ (now_showing)
UPDATE movies 
SET release_date = LEAST(release_date, CURDATE() - INTERVAL 2 DAY), status = 'now_showing'
WHERE movie_id IN (
    SELECT movie_id FROM (
        SELECT movie_id FROM movies WHERE status = 'now_showing' OR release_date <= CURDATE()
    ) tmp
);

-- 7. Thêm và lấp đầy FULL KHUNG GIỜ CHIẾU TRONG NGÀY (Từ 08:15 sáng đến 23:15 đêm)
INSERT INTO showtimes (
    movie_id,
    room_id,
    start_time,
    end_time,
    price_standard,
    price_vip,
    price_couple,
    status
)
SELECT 
    m.movie_id,
    r.room_id,
    -- Giờ bắt đầu suất chiếu
    TIMESTAMP(CURDATE() + INTERVAL d.day_offset DAY, t.slot_time) AS start_time,
    -- Giờ kết thúc: thời lượng phim + 15 phút dọn rạp & quảng cáo
    TIMESTAMP(CURDATE() + INTERVAL d.day_offset DAY, t.slot_time) + INTERVAL (m.duration_minutes + 15) MINUTE AS end_time,
    -- Giá vé theo loại phòng chiếu
    CASE r.room_type
        WHEN 'IMAX' THEN t.base_standard + 40000.00
        ELSE t.base_standard
    END AS price_standard,
    CASE r.room_type
        WHEN 'IMAX' THEN t.base_vip + 45000.00
        ELSE t.base_vip
    END AS price_vip,
    CASE r.room_type
        WHEN 'IMAX' THEN t.base_couple + 60000.00
        ELSE t.base_couple
    END AS price_couple,
    'scheduled' AS status
FROM screening_rooms r
-- Lặp 7 ngày: Từ hôm nay (0) đến 6 ngày tới (6)
CROSS JOIN (
    SELECT 0 AS day_offset
    UNION ALL SELECT 1
    UNION ALL SELECT 2
    UNION ALL SELECT 3
    UNION ALL SELECT 4
    UNION ALL SELECT 5
    UNION ALL SELECT 6
) d
-- 7 KHUNG GIỜ CHIẾU TRẢI ĐỀU TẤT CẢ CÁC CA TRONG NGÀY
CROSS JOIN (
    SELECT 1 AS slot_index, '08:15:00' AS slot_time, 75000.00 AS base_standard, 95000.00 AS base_vip, 140000.00 AS base_couple
    UNION ALL SELECT 2,     '10:45:00',              80000.00,                  105000.00,              155000.00
    UNION ALL SELECT 3,     '13:15:00',              85000.00,                  110000.00,              160000.00
    UNION ALL SELECT 4,     '15:45:00',              90000.00,                  115000.00,              170000.00
    UNION ALL SELECT 5,     '18:15:00',              95000.00,                  130000.00,              190000.00
    UNION ALL SELECT 6,     '20:45:00',              95000.00,                  130000.00,              190000.00
    UNION ALL SELECT 7,     '23:15:00',              80000.00,                  105000.00,              155000.00
) t
-- Phân bổ tuần hoàn luân phiên tất cả các phim đang chiếu
JOIN (
    SELECT 
        movie_id, 
        duration_minutes, 
        ROW_NUMBER() OVER (ORDER BY movie_id) AS rn,
        COUNT(*) OVER () AS total_movies
    FROM movies
    WHERE status = 'now_showing'
) m ON m.rn = (((r.room_id + d.day_offset) % m.total_movies) + 1)
-- CHỈ CHIẾU PHÒNG 2D VÀ IMAX (LOẠI BỎ HOÀN TOÀN PHÒNG 3D)
WHERE r.room_type IN ('2D', 'IMAX') AND r.status = 'active';

-- 8. Tự động sinh toàn bộ ghế trống (showtime_seats) cho các suất chiếu vừa thêm
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

COMMIT;

-- 9. Báo cáo thống kê chi tiết theo loại phòng
SELECT 
    DATE(st.start_time) AS 'Ngay_Chieu',
    r.room_type AS 'Loai_Phong',
    COUNT(DISTINCT st.showtime_id) AS 'Tong_Suat_Chieu',
    COUNT(DISTINCT st.movie_id) AS 'So_Phim_Chieu'
FROM showtimes st
JOIN screening_rooms r ON st.room_id = r.room_id
WHERE st.start_time >= CURDATE()
GROUP BY DATE(st.start_time), r.room_type
ORDER BY DATE(st.start_time), r.room_type;

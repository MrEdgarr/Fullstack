-- =============================================================================
-- CẬP NHẬT LỊCH CHIẾU VỀ THỜI GIAN HIỆN TẠI / CÁC NGÀY TỚI
-- =============================================================================

START TRANSACTION;

-- 1. Tính toán khoảng cách ngày để đưa suất chiếu sớm nhất về ngày hiện tại (CURDATE())
SET @min_date = (SELECT MIN(DATE(start_time)) FROM showtimes);
SET @target_date = CURDATE(); -- Có thể đổi thành (CURDATE() + INTERVAL 1 DAY) nếu muốn bắt đầu từ ngày mai
SET @diff_days = DATEDIFF(@target_date, IFNULL(@min_date, CURDATE()));

-- 2. Dời toàn bộ ngày chiếu của showtimes sang các ngày tới (giữ nguyên giờ & phút)
UPDATE showtimes
SET 
    start_time = DATE_ADD(start_time, INTERVAL @diff_days DAY),
    end_time = DATE_ADD(end_time, INTERVAL @diff_days DAY),
    status = 'scheduled'
WHERE showtime_id > 0;

-- 3. Đồng bộ trạng thái và ngày phát hành của phim
UPDATE movies 
SET release_date = CURDATE() - INTERVAL 3 DAY, status = 'now_showing' 
WHERE status = 'now_showing';

UPDATE movies 
SET release_date = CURDATE() + INTERVAL 10 DAY, status = 'upcoming' 
WHERE status = 'upcoming';

-- 4. Bổ sung ghế trống (showtime_seats) nếu còn thiếu
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

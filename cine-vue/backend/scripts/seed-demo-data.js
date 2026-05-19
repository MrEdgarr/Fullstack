require("dotenv").config();

const fs = require("fs");
const mysql = require("mysql2/promise");

const requiredEnvVars = [
  "DB_HOST",
  "DB_PORT",
  "DB_USERNAME",
  "DB_PASSWORD",
  "DB_DBNAME",
];

const missingEnvVars = requiredEnvVars.filter((name) => !process.env[name]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
  process.exit(1);
}

const ssl =
  process.env.DB_SSL_CA_BASE64
    ? {
        ca: Buffer.from(process.env.DB_SSL_CA_BASE64, "base64").toString("utf8"),
      }
    : process.env.DB_SSL_CA_PATH
      ? {
          ca: fs.readFileSync(process.env.DB_SSL_CA_PATH, "utf8"),
        }
      : undefined;

// bcrypt hash for password: 123
const DEMO_PASSWORD_HASH =
  "$2b$10$cOKnf93qNph9yLI./pG8yegWHx9OhRZoOLOci8y/atvVv0ywU.6NC";

const cities = [
  { city_name: "Hà Nội", country: "Vietnam", province_code: "HN" },
  { city_name: "TP. Hồ Chí Minh", country: "Vietnam", province_code: "HCM" },
  { city_name: "Đà Nẵng", country: "Vietnam", province_code: "DN" },
  { city_name: "Hải Phòng", country: "Vietnam", province_code: "HP" },
  { city_name: "Cần Thơ", country: "Vietnam", province_code: "CT" },
];

const brands = [
  { brand_name: "CGV Cinemas", logo_url: "https://placehold.co/240x120?text=CGV" },
  { brand_name: "Lotte Cinema", logo_url: "https://placehold.co/240x120?text=Lotte" },
  { brand_name: "Galaxy Cinema", logo_url: "https://placehold.co/240x120?text=Galaxy" },
  { brand_name: "BHD Star Cineplex", logo_url: "https://placehold.co/240x120?text=BHD" },
  { brand_name: "CineStar", logo_url: "https://placehold.co/240x120?text=CineStar" },
];

const cinemas = [
  {
    brand_name: "CGV Cinemas",
    city_name: "Hà Nội",
    cinema_name: "CGV Vincom Center Bà Triệu",
    address: "191 Bà Triệu, Hai Bà Trưng, Hà Nội",
    phone: "19006017",
  },
  {
    brand_name: "CGV Cinemas",
    city_name: "TP. Hồ Chí Minh",
    cinema_name: "CGV Crescent Mall",
    address: "101 Tôn Dật Tiên, Quận 7, TP. Hồ Chí Minh",
    phone: "19006018",
  },
  {
    brand_name: "Lotte Cinema",
    city_name: "Đà Nẵng",
    cinema_name: "Lotte Cinema Đà Nẵng",
    address: "255-257 Hùng Vương, Hải Châu, Đà Nẵng",
    phone: "19005588",
  },
  {
    brand_name: "Galaxy Cinema",
    city_name: "TP. Hồ Chí Minh",
    cinema_name: "Galaxy Nguyễn Du",
    address: "116 Nguyễn Du, Quận 1, TP. Hồ Chí Minh",
    phone: "19002224",
  },
  {
    brand_name: "BHD Star Cineplex",
    city_name: "Hà Nội",
    cinema_name: "BHD Star Phạm Ngọc Thạch",
    address: "2 Phạm Ngọc Thạch, Đống Đa, Hà Nội",
    phone: "19002099",
  },
  {
    brand_name: "CineStar",
    city_name: "Cần Thơ",
    cinema_name: "CineStar Cần Thơ",
    address: "Sense City, Ninh Kiều, Cần Thơ",
    phone: "19006660",
  },
];

const movies = [
  {
    title: "Lật Mặt 9: Vòng Xoáy",
    title_en: "Face Off 9",
    slug: "lat-mat-9-vong-xoay",
    duration_minutes: 118,
    genre: "Hành động, Tâm lý",
    age_rating: "T16",
    rating_percent: 92,
    poster_url: "https://placehold.co/400x600?text=Lat+Mat+9",
    banner_url: "https://placehold.co/1200x500?text=Lat+Mat+9",
    trailer_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Một bộ phim hành động Việt Nam với nhịp kể nhanh và nhiều nút thắt.",
    release_date: "2026-05-10",
    status: "now_showing",
  },
  {
    title: "Doraemon: Nobita Và Bản Giao Hưởng Địa Cầu",
    title_en: "Doraemon: Nobita's Earth Symphony",
    slug: "doraemon-nobita-va-ban-giao-huong-dia-cau",
    duration_minutes: 115,
    genre: "Hoạt hình, Gia đình",
    age_rating: "P",
    rating_percent: 89,
    poster_url: "https://placehold.co/400x600?text=Doraemon",
    banner_url: "https://placehold.co/1200x500?text=Doraemon",
    trailer_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Chuyến phiêu lưu âm nhạc dành cho gia đình và trẻ em.",
    release_date: "2026-05-12",
    status: "now_showing",
  },
  {
    title: "Mission: Impossible - Final Reckoning",
    title_en: "Mission: Impossible - Final Reckoning",
    slug: "mission-impossible-final-reckoning",
    duration_minutes: 169,
    genre: "Hành động, Phiêu lưu",
    age_rating: "T16",
    rating_percent: 91,
    poster_url: "https://placehold.co/400x600?text=Mission+Impossible",
    banner_url: "https://placehold.co/1200x500?text=Mission+Impossible",
    trailer_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Một nhiệm vụ cuối cùng với quy mô toàn cầu.",
    release_date: "2026-05-15",
    status: "now_showing",
  },
  {
    title: "Conan: Dư Ảnh Của Độc Nhãn",
    title_en: "Detective Conan: One-Eyed Flashback",
    slug: "conan-du-anh-cua-doc-nhan",
    duration_minutes: 110,
    genre: "Hoạt hình, Trinh thám",
    age_rating: "T13",
    rating_percent: 0,
    poster_url: "https://placehold.co/400x600?text=Conan",
    banner_url: "https://placehold.co/1200x500?text=Conan",
    trailer_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Một vụ án mới kéo Conan vào cuộc truy tìm sự thật.",
    release_date: "2026-06-01",
    status: "upcoming",
  },
  {
    title: "Mưa Đỏ",
    title_en: "Red Rain",
    slug: "mua-do",
    duration_minutes: 124,
    genre: "Chiến tranh, Lịch sử",
    age_rating: "T16",
    rating_percent: 86,
    poster_url: "https://placehold.co/400x600?text=Mua+Do",
    banner_url: "https://placehold.co/1200x500?text=Mua+Do",
    trailer_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Câu chuyện lịch sử được kể qua góc nhìn nhân vật trẻ.",
    release_date: "2026-05-08",
    status: "now_showing",
  },
  {
    title: "Inside Out 3",
    title_en: "Inside Out 3",
    slug: "inside-out-3",
    duration_minutes: 102,
    genre: "Hoạt hình, Gia đình",
    age_rating: "P",
    rating_percent: 0,
    poster_url: "https://placehold.co/400x600?text=Inside+Out+3",
    banner_url: "https://placehold.co/1200x500?text=Inside+Out+3",
    trailer_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Một hành trình mới vào thế giới cảm xúc.",
    release_date: "2026-06-20",
    status: "upcoming",
  },
  {
    title: "Địa Đạo: Mặt Trời Trong Bóng Tối",
    title_en: "Tunnel: Sun in the Dark",
    slug: "dia-dao-mat-troi-trong-bong-toi",
    duration_minutes: 128,
    genre: "Lịch sử, Tâm lý",
    age_rating: "T16",
    rating_percent: 84,
    poster_url: "https://placehold.co/400x600?text=Dia+Dao",
    banner_url: "https://placehold.co/1200x500?text=Dia+Dao",
    trailer_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Bộ phim khai thác tinh thần bền bỉ trong thời chiến.",
    release_date: "2026-04-10",
    status: "ended",
  },
  {
    title: "Fantastic Four: First Steps",
    title_en: "Fantastic Four: First Steps",
    slug: "fantastic-four-first-steps",
    duration_minutes: 130,
    genre: "Siêu anh hùng, Sci-Fi",
    age_rating: "T13",
    rating_percent: 0,
    poster_url: "https://placehold.co/400x600?text=Fantastic+Four",
    banner_url: "https://placehold.co/1200x500?text=Fantastic+Four",
    trailer_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Một khởi đầu mới cho gia đình siêu anh hùng.",
    release_date: "2026-07-05",
    status: "upcoming",
  },
];

const promotions = [
  {
    code: "WELCOME10",
    discount_type: "percent",
    discount_value: 10,
    max_discount_amount: 50000,
    min_order_amount: 100000,
  },
  {
    code: "STUDENT20",
    discount_type: "percent",
    discount_value: 20,
    max_discount_amount: 60000,
    min_order_amount: 120000,
  },
  {
    code: "WEEKDAY50K",
    discount_type: "fixed",
    discount_value: 50000,
    max_discount_amount: null,
    min_order_amount: 200000,
  },
  {
    code: "COMBO15",
    discount_type: "percent",
    discount_value: 15,
    max_discount_amount: 40000,
    min_order_amount: 150000,
  },
];

const demoCustomers = [
  {
    full_name: "System Admin",
    email: "admin@example.com",
    phone: "0900000000",
    role: "admin",
  },
  {
    full_name: "Demo Customer",
    email: "customer@example.com",
    phone: "0911111111",
    role: "customer",
  },
  {
    full_name: "Nguyễn Minh",
    email: "minh.nguyen@example.com",
    phone: "0922222222",
    role: "customer",
  },
  {
    full_name: "Trần Lan",
    email: "lan.tran@example.com",
    phone: "0933333333",
    role: "customer",
  },
];

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DBNAME,
    timezone: process.env.DB_TIMEZONE || "Z",
    multipleStatements: true,
    ...(ssl && { ssl }),
  });

  try {
    await connection.beginTransaction();

    const cityIds = await seedCities(connection);
    const brandIds = await seedBrands(connection);
    const customerIds = await seedCustomers(connection);
    const cinemaIds = await seedCinemas(connection, cityIds, brandIds);
    const roomIds = await seedRooms(connection, cinemaIds);
    await seedSeats(connection, roomIds);
    const movieIds = await seedMovies(connection);
    const comboIds = await seedFoodCombos(connection, cinemaIds);
    await seedPromotions(connection);
    const showtimeIds = await seedShowtimes(connection, roomIds, movieIds);
    await seedDemoBooking(connection, customerIds, showtimeIds, comboIds);

    await connection.commit();

    const counts = await getTableCounts(connection);
    console.log("Demo data seeded successfully.");
    console.table(counts);
  } catch (error) {
    await connection.rollback();
    console.error("Demo data seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await connection.end();
  }
}

async function seedCustomers(connection) {
  const ids = new Map();

  for (const customer of demoCustomers) {
    await connection.execute(
      `
      INSERT INTO customers (full_name, email, phone, password_hash, role)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        full_name = VALUES(full_name),
        phone = VALUES(phone),
        role = VALUES(role),
        status = 'active'
      `,
      [customer.full_name, customer.email, customer.phone, DEMO_PASSWORD_HASH, customer.role],
    );

    const [rows] = await connection.execute(
      "SELECT customer_id FROM customers WHERE email = ?",
      [customer.email],
    );
    ids.set(customer.email, rows[0].customer_id);
  }

  return ids;
}

async function seedCities(connection) {
  const ids = new Map();

  for (const city of cities) {
    await connection.execute(
      `
      INSERT INTO cities (city_name, country, province_code)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE province_code = VALUES(province_code)
      `,
      [city.city_name, city.country, city.province_code],
    );

    const [rows] = await connection.execute(
      "SELECT city_id FROM cities WHERE city_name = ? AND country = ?",
      [city.city_name, city.country],
    );
    ids.set(city.city_name, rows[0].city_id);
  }

  return ids;
}

async function seedBrands(connection) {
  const ids = new Map();

  for (const brand of brands) {
    await connection.execute(
      `
      INSERT INTO cinema_brands (brand_name, logo_url)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE
        logo_url = VALUES(logo_url),
        status = 'active'
      `,
      [brand.brand_name, brand.logo_url],
    );

    const [rows] = await connection.execute(
      "SELECT brand_id FROM cinema_brands WHERE brand_name = ?",
      [brand.brand_name],
    );
    ids.set(brand.brand_name, rows[0].brand_id);
  }

  return ids;
}

async function seedCinemas(connection, cityIds, brandIds) {
  const ids = new Map();

  for (const cinema of cinemas) {
    const brandId = brandIds.get(cinema.brand_name);
    const cityId = cityIds.get(cinema.city_name);
    const [existing] = await connection.execute(
      "SELECT cinema_id FROM cinemas WHERE cinema_name = ? AND address = ? LIMIT 1",
      [cinema.cinema_name, cinema.address],
    );

    if (existing.length > 0) {
      await connection.execute(
        `
        UPDATE cinemas
        SET brand_id = ?, city_id = ?, phone = ?, status = 'active'
        WHERE cinema_id = ?
        `,
        [brandId, cityId, cinema.phone, existing[0].cinema_id],
      );
      ids.set(cinema.cinema_name, existing[0].cinema_id);
      continue;
    }

    const [result] = await connection.execute(
      `
      INSERT INTO cinemas (brand_id, city_id, cinema_name, address, phone)
      VALUES (?, ?, ?, ?, ?)
      `,
      [brandId, cityId, cinema.cinema_name, cinema.address, cinema.phone],
    );
    ids.set(cinema.cinema_name, result.insertId);
  }

  return ids;
}

async function seedRooms(connection, cinemaIds) {
  const ids = new Map();
  const roomTemplates = [
    { room_name: "Room 1", room_type: "2D" },
    { room_name: "Room 2", room_type: "IMAX" },
    { room_name: "Room 3", room_type: "3D" },
  ];

  for (const [cinemaName, cinemaId] of cinemaIds.entries()) {
    for (const room of roomTemplates) {
      await connection.execute(
        `
        INSERT INTO screening_rooms (cinema_id, room_name, room_type)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
          room_type = VALUES(room_type),
          status = 'active'
        `,
        [cinemaId, room.room_name, room.room_type],
      );

      const [rows] = await connection.execute(
        "SELECT room_id FROM screening_rooms WHERE cinema_id = ? AND room_name = ?",
        [cinemaId, room.room_name],
      );
      ids.set(`${cinemaName}:${room.room_name}`, rows[0].room_id);
    }
  }

  return ids;
}

async function seedSeats(connection, roomIds) {
  const seatPlan = [
    { row: "A", type: "standard" },
    { row: "B", type: "standard" },
    { row: "C", type: "vip" },
    { row: "D", type: "vip" },
    { row: "E", type: "couple" },
    { row: "F", type: "couple" },
  ];
  const values = [];

  for (const roomId of roomIds.values()) {
    for (const row of seatPlan) {
      for (let seatNumber = 1; seatNumber <= 10; seatNumber += 1) {
        values.push([roomId, row.row, seatNumber, row.type]);
      }
    }
  }

  if (values.length === 0) return;

  await connection.query(
    `
    INSERT INTO seats (room_id, row_letter, seat_number, seat_type)
    VALUES ?
    ON DUPLICATE KEY UPDATE
      seat_type = VALUES(seat_type),
      status = 'active'
    `,
    [values],
  );
}

async function seedMovies(connection) {
  const ids = new Map();

  for (const movie of movies) {
    await connection.execute(
      `
      INSERT INTO movies (
        title,
        title_en,
        slug,
        duration_minutes,
        genre,
        age_rating,
        rating_percent,
        poster_url,
        banner_url,
        trailer_url,
        description,
        release_date,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        status = VALUES(status)
      `,
      [
        movie.title,
        movie.title_en,
        movie.slug,
        movie.duration_minutes,
        movie.genre,
        movie.age_rating,
        movie.rating_percent,
        movie.poster_url,
        movie.banner_url,
        movie.trailer_url,
        movie.description,
        movie.release_date,
        movie.status,
      ],
    );

    const [rows] = await connection.execute("SELECT movie_id FROM movies WHERE slug = ?", [
      movie.slug,
    ]);
    ids.set(movie.slug, rows[0].movie_id);
  }

  return ids;
}

async function seedPromotions(connection) {
  for (const promotion of promotions) {
    await connection.execute(
      `
      INSERT INTO promotions (
        code,
        discount_type,
        discount_value,
        max_discount_amount,
        min_order_amount,
        starts_at,
        ends_at
      )
      VALUES (?, ?, ?, ?, ?, '2026-01-01 00:00:00', '2026-12-31 23:59:59')
      ON DUPLICATE KEY UPDATE
        discount_type = VALUES(discount_type),
        discount_value = VALUES(discount_value),
        max_discount_amount = VALUES(max_discount_amount),
        min_order_amount = VALUES(min_order_amount),
        starts_at = VALUES(starts_at),
        ends_at = VALUES(ends_at),
        status = 'active'
      `,
      [
        promotion.code,
        promotion.discount_type,
        promotion.discount_value,
        promotion.max_discount_amount,
        promotion.min_order_amount,
      ],
    );
  }
}

async function seedFoodCombos(connection, cinemaIds) {
  const ids = new Map();
  const comboTemplates = [
    {
      combo_name: "Combo Solo",
      description: "1 bắp vừa + 1 nước ngọt vừa",
      image_url: "https://placehold.co/500x350?text=Combo+Solo",
      price: 70000,
    },
    {
      combo_name: "Combo Couple",
      description: "1 bắp lớn + 2 nước ngọt vừa",
      image_url: "https://placehold.co/500x350?text=Combo+Couple",
      price: 115000,
    },
    {
      combo_name: "Combo Family",
      description: "2 bắp lớn + 4 nước ngọt vừa",
      image_url: "https://placehold.co/500x350?text=Combo+Family",
      price: 210000,
    },
  ];

  for (const [cinemaName, cinemaId] of cinemaIds.entries()) {
    for (const combo of comboTemplates) {
      await connection.execute(
        `
        INSERT INTO food_combos (cinema_id, combo_name, description, image_url, price)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          description = VALUES(description),
          image_url = VALUES(image_url),
          price = VALUES(price),
          status = 'active'
        `,
        [cinemaId, combo.combo_name, combo.description, combo.image_url, combo.price],
      );

      const [rows] = await connection.execute(
        "SELECT food_combo_id FROM food_combos WHERE cinema_id = ? AND combo_name = ?",
        [cinemaId, combo.combo_name],
      );
      ids.set(`${cinemaName}:${combo.combo_name}`, rows[0].food_combo_id);
    }
  }

  return ids;
}

async function seedShowtimes(connection, roomIds, movieIds) {
  const seededRooms = Array.from(roomIds.entries()).slice(0, 8);
  const movieCycle = [
    "lat-mat-9-vong-xoay",
    "doraemon-nobita-va-ban-giao-huong-dia-cau",
    "mission-impossible-final-reckoning",
    "mua-do",
    "shin-cau-be-but-chi",
    "avengers-secret-empire",
  ].filter((slug) => movieIds.has(slug));
  const baseDate = new Date("2026-05-20T00:00:00Z");
  const startHours = [10, 14, 18, 21];
  let index = 0;
  const plans = [];

  for (let day = 0; day < 5; day += 1) {
    for (const [, roomId] of seededRooms) {
      for (const hour of startHours) {
        const slug = movieCycle[index % movieCycle.length];
        const movieId = movieIds.get(slug);
        const movie = movies.find((item) => item.slug === slug) || {
          duration_minutes: 120,
        };
        const start = new Date(baseDate);
        start.setUTCDate(baseDate.getUTCDate() + day);
        start.setUTCHours(hour, hour === 21 ? 15 : 0, 0, 0);
        const end = new Date(start.getTime() + (movie.duration_minutes + 20) * 60 * 1000);
        const priceStandard = hour >= 18 ? 95000 : 80000;
        const priceVip = priceStandard + 30000;
        const priceCouple = priceStandard * 2;

        plans.push({
          movieId,
          roomId,
          startTime: toMysqlDateTime(start),
          endTime: toMysqlDateTime(end),
          priceStandard,
          priceVip,
          priceCouple,
        });
        index += 1;
      }
    }
  }

  if (plans.length === 0) return [];

  await connection.query(
    `
    INSERT INTO showtimes (
      movie_id,
      room_id,
      start_time,
      end_time,
      price_standard,
      price_vip,
      price_couple
    )
    VALUES ?
    ON DUPLICATE KEY UPDATE
      movie_id = VALUES(movie_id),
      end_time = VALUES(end_time),
      price_standard = VALUES(price_standard),
      price_vip = VALUES(price_vip),
      price_couple = VALUES(price_couple),
      status = 'scheduled'
    `,
    [
      plans.map((plan) => [
        plan.movieId,
        plan.roomId,
        plan.startTime,
        plan.endTime,
        plan.priceStandard,
        plan.priceVip,
        plan.priceCouple,
      ]),
    ],
  );

  const roomIdList = [...new Set(plans.map((plan) => plan.roomId))];
  const [rows] = await connection.query(
    `
    SELECT
      showtime_id,
      room_id,
      DATE_FORMAT(start_time, '%Y-%m-%d %H:%i:%s') AS start_time
    FROM showtimes
    WHERE room_id IN (?)
      AND start_time BETWEEN ? AND ?
    ORDER BY showtime_id
    `,
    [roomIdList, "2026-05-20 00:00:00", "2026-05-25 23:59:59"],
  );
  const plannedKeys = new Set(plans.map((plan) => `${plan.roomId}|${plan.startTime}`));
  const ids = rows
    .filter((row) => plannedKeys.has(`${row.room_id}|${row.start_time}`))
    .map((row) => row.showtime_id);

  await seedShowtimeSeats(connection, ids);

  return ids;
}

async function seedShowtimeSeats(connection, showtimeIds) {
  if (showtimeIds.length === 0) return;

  await connection.query(
    `
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
    JOIN seats s ON s.room_id = st.room_id
    LEFT JOIN showtime_seats ss
      ON ss.showtime_id = st.showtime_id
     AND ss.seat_id = s.seat_id
    WHERE st.showtime_id IN (?)
      AND s.status = 'active'
      AND ss.showtime_seat_id IS NULL
    `,
    [showtimeIds],
  );
}

async function seedDemoBooking(connection, customerIds, showtimeIds, comboIds) {
  const bookingCode = "DEMO-CONFIRMED-001";
  const customerId = customerIds.get("customer@example.com");
  const showtimeId = showtimeIds[0];
  const comboId = Array.from(comboIds.values())[0];

  const [existingBookingRows] = await connection.execute(
    "SELECT booking_id FROM bookings WHERE booking_code = ?",
    [bookingCode],
  );

  if (existingBookingRows.length > 0) {
    return;
  }

  const [seatRows] = await connection.execute(
    `
    SELECT showtime_seat_id, seat_id, price
    FROM showtime_seats
    WHERE showtime_id = ?
      AND status = 'available'
    ORDER BY showtime_seat_id
    LIMIT 2
    `,
    [showtimeId],
  );

  if (seatRows.length < 2) {
    return;
  }

  const ticketSubtotal = seatRows.reduce((sum, seat) => sum + Number(seat.price), 0);
  const comboQuantity = 1;
  const [[comboRow]] = await connection.execute(
    "SELECT price FROM food_combos WHERE food_combo_id = ?",
    [comboId],
  );
  const comboSubtotal = Number(comboRow.price) * comboQuantity;
  const finalAmount = ticketSubtotal + comboSubtotal;

  const [bookingResult] = await connection.execute(
    `
    INSERT INTO bookings (
      booking_code,
      customer_id,
      showtime_id,
      status,
      subtotal_amount,
      discount_amount,
      final_amount,
      expires_at
    )
    VALUES (?, ?, ?, 'confirmed', ?, 0, ?, NULL)
    `,
    [bookingCode, customerId, showtimeId, finalAmount, finalAmount],
  );
  const bookingId = bookingResult.insertId;

  await connection.execute(
    `
    UPDATE showtime_seats
    SET status = 'booked',
        held_by_booking_id = NULL,
        held_until = NULL
    WHERE showtime_seat_id IN (?, ?)
    `,
    [seatRows[0].showtime_seat_id, seatRows[1].showtime_seat_id],
  );

  for (const seat of seatRows) {
    await connection.execute(
      `
      INSERT IGNORE INTO tickets (booking_id, showtime_seat_id, seat_id, actual_price)
      VALUES (?, ?, ?, ?)
      `,
      [bookingId, seat.showtime_seat_id, seat.seat_id, seat.price],
    );
  }

  await connection.execute(
    `
    INSERT INTO booking_food_combos (
      booking_id,
      food_combo_id,
      quantity,
      unit_price,
      line_total
    )
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      quantity = VALUES(quantity),
      unit_price = VALUES(unit_price),
      line_total = VALUES(line_total)
    `,
    [bookingId, comboId, comboQuantity, comboRow.price, comboSubtotal],
  );

  await connection.execute(
    `
    INSERT INTO payments (
      booking_id,
      amount,
      payment_method,
      status,
      transaction_id,
      payment_time
    )
    VALUES (?, ?, 'momo', 'success', 'DEMO-TXN-001', NOW())
    ON DUPLICATE KEY UPDATE
      booking_id = VALUES(booking_id),
      amount = VALUES(amount),
      status = 'success',
      payment_time = NOW()
    `,
    [bookingId, finalAmount],
  );
}

async function getTableCounts(connection) {
  const tables = [
    "customers",
    "cities",
    "cinema_brands",
    "cinemas",
    "screening_rooms",
    "seats",
    "movies",
    "showtimes",
    "showtime_seats",
    "promotions",
    "food_combos",
    "bookings",
    "booking_food_combos",
    "payments",
    "tickets",
  ];
  const counts = [];

  for (const table of tables) {
    const [rows] = await connection.query(`SELECT COUNT(*) AS count FROM ${table}`);
    counts.push({ table, count: rows[0].count });
  }

  return counts;
}

function toMysqlDateTime(date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

main();

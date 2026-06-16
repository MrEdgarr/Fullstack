const DEFAULT_BRAND_LOGO = "https://placehold.co/80x80?text=Cinema";

exports.mapMovieScheduleResponse = (scheduleRows, optionRows, filters = {}) => ({
  cityOptions: createCityOptions(optionRows),
  cinemaOptions: createCinemaOptions(optionRows, filters.cityId),
  cinemaBrands: mapRowsToCinemaBrandTree(scheduleRows),
});

exports.mapScheduleResponse = (scheduleRows, optionRows, filters = {}) => ({
  movieOptions: createMovieOptions(optionRows),
  cityOptions: createCityOptions(optionRows),
  cinemaOptions: createAvailableCinemaOptions(optionRows, filters),
  movies: mapRowsToMovieTree(scheduleRows),
});

function createMovieOptions(rows) {
  const movieMap = new Map();

  rows.forEach((row) => {
    if (!row.movie_id) return;

    movieMap.set(Number(row.movie_id), normalizeShowtime(row).movie);
  });

  return sortByTitle(Array.from(movieMap.values()));
}

function createCityOptions(rows) {
  const cityMap = new Map();

  rows.forEach((row) => {
    if (!row.city_id) return;

    cityMap.set(Number(row.city_id), {
      id: Number(row.city_id),
      name: row.city_name,
    });
  });

  return sortByName(Array.from(cityMap.values()));
}

function createCinemaOptions(rows, selectedCityId) {
  const cinemaMap = new Map();
  const cityId = Number(selectedCityId);

  rows.forEach((row) => {
    if (selectedCityId && Number(row.city_id) !== cityId) return;

    cinemaMap.set(Number(row.cinema_id), {
      id: Number(row.cinema_id),
      cinema_id: Number(row.cinema_id),
      name: row.cinema_name,
      address: row.cinema_address || "",
      cityId: Number(row.city_id),
      cityName: row.city_name,
    });
  });

  return sortByName(Array.from(cinemaMap.values()));
}

function createAvailableCinemaOptions(rows, filters = {}) {
  const cinemaMap = new Map();
  const cityId = Number(filters.cityId);
  const movieId = Number(filters.movieId);

  rows.forEach((row) => {
    const showtime = normalizeShowtime(row);

    if (filters.date && showtime.date !== filters.date) return;
    if (filters.cityId && showtime.cityId !== cityId) return;
    if (filters.movieId && showtime.movie.id !== movieId) return;
    if (isShowtimePast(showtime.date, showtime.time)) return;

    cinemaMap.set(showtime.cinema.id, {
      ...showtime.cinema,
      cityId: showtime.cityId,
      cityName: showtime.cityName,
    });
  });

  return sortByName(Array.from(cinemaMap.values()));
}

function mapRowsToCinemaBrandTree(rows) {
  const brandMap = new Map();

  rows.forEach((row) => {
    const showtime = normalizeShowtime(row);
    const brand = getOrCreateBrand(brandMap, showtime.brand);
    const branch = getOrCreateBranch(brand.branchesMap, showtime.cinema);
    const format = getOrCreateFormat(branch.formatsMap, showtime);

    format.slots.push(showtime);
  });

  return sortByName(Array.from(brandMap.values()).map(normalizeBrandGroup));
}

function mapRowsToMovieTree(rows) {
  const movieMap = new Map();

  rows.forEach((row) => {
    const showtime = normalizeShowtime(row);

    if (!movieMap.has(showtime.movie.id)) {
      movieMap.set(showtime.movie.id, {
        movie: showtime.movie,
        showtimes: [],
      });
    }

    const item = movieMap.get(showtime.movie.id);
    const group = getOrCreateMovieShowtimeGroup(item.showtimes, showtime);

    group.times.push({
      id: showtime.id,
      showtime_id: showtime.showtime_id,
      time: showtime.time,
    });
  });

  movieMap.forEach((item) => {
    item.showtimes.forEach((group) => {
      group.times.sort((a, b) => a.time.localeCompare(b.time));
    });
  });

  return Array.from(movieMap.values());
}

function normalizeShowtime(row) {
  const date = row.show_date || toDatePart(row.start_time);
  const time = row.show_time || toTimePart(row.start_time);

  const movie = {
    id: Number(row.movie_id),
    movie_id: Number(row.movie_id),
    title: row.title || "Phim chưa xác định",
    poster: row.poster_url,
    genre: row.genre,
    durationMinutes: Number(row.duration_minutes || 0),
  };
  const cinema = {
    id: Number(row.cinema_id),
    cinema_id: Number(row.cinema_id),
    name: row.cinema_name || "Rạp đang cập nhật",
    address: row.cinema_address || "",
  };
  const brand = {
    id: Number(row.brand_id || row.cinema_id || 0),
    name: row.brand_name || "Rạp chiếu",
    logo: row.brand_logo_url || DEFAULT_BRAND_LOGO,
  };

  return {
    id: Number(row.showtime_id),
    showtime_id: Number(row.showtime_id),
    movie_id: Number(row.movie_id),
    date,
    time,
    room: row.room_name || `Phòng ${row.room_id}`,
    format: formatRoomType(row.room_type),
    ageRestriction: row.age_rating || "Đang cập nhật",
    priceStandard: Number(row.price_standard || 0),
    priceVip: Number(row.price_vip || 0),
    priceCouple: Number(row.price_couple || 0),
    cityId: Number(row.city_id || 0),
    cityName: row.city_name || "",
    movie,
    cinema,
    brand,
  };
}

function getOrCreateMovieShowtimeGroup(groups, showtime) {
  const groupKey = `${showtime.cinema.id}-${showtime.room}-${showtime.format}-${showtime.date}`;
  let group = groups.find((candidate) => candidate.key === groupKey);

  if (!group) {
    group = {
      key: groupKey,
      cinema: showtime.cinema,
      cinemaId: showtime.cinema.id,
      date: showtime.date,
      format: showtime.format,
      ageRestriction: showtime.ageRestriction,
      room: showtime.room,
      times: [],
    };
    groups.push(group);
  }

  return group;
}

function getOrCreateBrand(brandMap, brandData) {
  if (!brandMap.has(brandData.id)) {
    brandMap.set(brandData.id, {
      ...brandData,
      branchesMap: new Map(),
    });
  }

  return brandMap.get(brandData.id);
}

function getOrCreateBranch(branchesMap, cinemaData) {
  if (!branchesMap.has(cinemaData.id)) {
    branchesMap.set(cinemaData.id, {
      ...cinemaData,
      formatsMap: new Map(),
    });
  }

  return branchesMap.get(cinemaData.id);
}

function getOrCreateFormat(formatsMap, showtime) {
  const formatKey = `${showtime.format}-${showtime.room}`;

  if (!formatsMap.has(formatKey)) {
    formatsMap.set(formatKey, {
      key: formatKey,
      type: `${showtime.format} - ${showtime.room}`,
      slots: [],
    });
  }

  return formatsMap.get(formatKey);
}

function normalizeBrandGroup(brand) {
  const branches = sortByName(Array.from(brand.branchesMap.values()).map(normalizeBranchGroup));

  return {
    id: brand.id,
    name: brand.name,
    logo: brand.logo,
    branchCount: branches.length,
    branches,
  };
}

function normalizeBranchGroup(branch) {
  return {
    id: branch.id,
    name: branch.name,
    address: branch.address,
    formats: Array.from(branch.formatsMap.values()).map((format) => ({
      ...format,
      slots: format.slots.sort((a, b) => a.time.localeCompare(b.time)),
    })),
  };
}

function formatRoomType(roomType) {
  if (!roomType) return "2D";

  const normalizedRoomType = String(roomType).toLowerCase();
  if (normalizedRoomType === "imax") return "IMAX";
  if (normalizedRoomType === "4dx") return "4DX";
  if (normalizedRoomType === "3d") return "3D";

  return "2D";
}

function sortByName(items) {
  return items.sort((a, b) => a.name.localeCompare(b.name, "vi"));
}

function sortByTitle(items) {
  return items.sort((a, b) => a.title.localeCompare(b.title, "vi"));
}

function isShowtimePast(date, timeStr) {
  const now = new Date();
  const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];

  if (date < today) return true;
  if (date > today) return false;

  const [hour, minute] = timeStr.split(":").map(Number);
  if (hour < now.getHours()) return true;
  if (hour === now.getHours() && minute < now.getMinutes()) return true;

  return false;
}

function toDatePart(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function toTimePart(value) {
  if (!value) return "";

  const text = String(value);
  if (text.includes("T")) return text.slice(11, 16);
  if (text.length >= 16) return text.slice(11, 16);

  return text.slice(0, 5);
}

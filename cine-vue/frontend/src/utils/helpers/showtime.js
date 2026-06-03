const DEFAULT_BRAND_LOGO = "https://placehold.co/80x80?text=Cinema";

export const getTodayDate = () => {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);

    return localDate.toISOString().split("T")[0];
};
// Tạo danh sách tùy chọn thành phố từ dữ liệu showtime, loại bỏ trùng lặp và sắp xếp theo tên
export const createCityOptions = (showtimes) => {
    const cityMap = new Map();

    showtimes.forEach((showtime) => {
        if (!showtime.cityId) return;

        cityMap.set(showtime.cityId, {
            id: showtime.cityId,
            name: showtime.cityName,
        });
    });

    return sortByName(Array.from(cityMap.values()));
};
// Tạo danh sách tùy chọn phim từ dữ liệu showtime, loại bỏ trùng lặp và sắp xếp theo tiêu đề
export const createMovieOptions = (showtimes) => {
    const movieMap = new Map();

    showtimes.forEach((showtime) => {
        movieMap.set(showtime.movie.id, showtime.movie);
    });

    return sortByTitle(Array.from(movieMap.values()));
};
// Tạo danh sách tùy chọn rạp chiếu có suất chiếu trong ngày đã chọn, lọc theo thành phố nếu có và loại bỏ trùng lặp
export const createAvailableCinemaOptions = (
    showtimes,
    { selectedDate, selectedCityId, selectedMovieId },
) => {
    const cinemaMap = new Map();
    const cityId = Number(selectedCityId);
    const movieId = Number(selectedMovieId);

    showtimes.forEach((showtime) => {
        if (showtime.date !== selectedDate) return;
        if (selectedCityId && showtime.cityId !== cityId) return;
        if (selectedMovieId && showtime.movie.id !== movieId) return;
        if (isShowtimePast(showtime.date, showtime.time)) return;

        cinemaMap.set(showtime.cinema.id, showtime.cinema);
    });

    return sortByName(Array.from(cinemaMap.values()));
};

export const filterShowtimes = (
    showtimes,
    { selectedDate, selectedCinemaId, selectedMovieId, selectedCityId },
) => {
    const cinemaId = Number(selectedCinemaId);
    const movieId = Number(selectedMovieId);
    const cityId = Number(selectedCityId);

    return showtimes.filter((showtime) => {
        const matchDate = showtime.date === selectedDate;
        const matchCinema = selectedCinemaId ? showtime.cinema.id === cinemaId : true;
        const matchMovie = selectedMovieId ? showtime.movie.id === movieId : true;
        const matchCity = selectedCityId ? showtime.cityId === cityId : true;

        return matchDate && matchCinema && matchMovie && matchCity;
    });
};

export const groupShowtimesByMovie = (showtimes) => {
    const movieMap = new Map();

    showtimes.forEach((showtime) => {
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
};
// Tạo danh sách tùy chọn rạp chiếu từ dữ liệu showtime, lọc theo thành phố nếu có và loại bỏ trùng lặp
export const createCinemaOptions = (showtimes, selectedCityId) => {
    const cinemaMap = new Map();
    const cityId = Number(selectedCityId);

    showtimes.forEach((showtime) => {
        if (selectedCityId && showtime.cityId !== cityId) return;

        cinemaMap.set(showtime.cinema.id, showtime.cinema);
    });

    return sortByName(Array.from(cinemaMap.values()));
};
// Nhóm showtime theo thương hiệu rạp chiếu, sau đó theo chi nhánh và định dạng suất chiếu
export const groupShowtimesByCinemaBrand = (showtimes) => {
    const brandMap = new Map();

    showtimes.forEach((showtime) => {
        const brand = getOrCreateBrand(brandMap, showtime.brand);
        const branch = getOrCreateBranch(brand.branchesMap, showtime.cinema);
        const format = getOrCreateFormat(branch.formatsMap, showtime);

        format.slots.push(showtime);
    });

    return sortByName(Array.from(brandMap.values()).map(normalizeBrandGroup));
};
// Chuẩn hóa dữ liệu showtime từ API về định dạng thống nhất cho frontend sử dụng
export const normalizeMovieShowtime = (row, currentMovie = {}) => {
    const date = row.show_date || toDatePart(row.start_time);
    const time = row.show_time || toTimePart(row.start_time);

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
        cityName: row.city_name || resolveCityName(row.city_id),
        brand: normalizeBrand(row),
        cinema: normalizeCinema(row),
        movie: normalizeMovie(row, currentMovie),
    };
};

export const isShowtimePast = (date, timeStr) => {
    const now = new Date();
    const todayStr = getTodayDate();

    if (date < todayStr) return true;
    if (date > todayStr) return false;

    const [hour, minute] = timeStr.split(":").map(Number);
    if (hour < now.getHours()) return true;
    if (hour === now.getHours() && minute < now.getMinutes()) return true;

    return false;
};

export const formatDuration = (minutes) => {
    if (!minutes) return "Đang cập nhật";

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${hours}h${String(mins).padStart(2, "0")}'`;
};
// Hàm hỗ trợ lấy hoặc tạo đối tượng thương hiệu trong quá trình nhóm showtime
const getOrCreateBrand = (brandMap, brandData) => {
    if (!brandMap.has(brandData.id)) {
        brandMap.set(brandData.id, {
            ...brandData,
            branchesMap: new Map(),
        });
    }

    return brandMap.get(brandData.id);
};
// Hàm hỗ trợ lấy hoặc tạo đối tượng chi nhánh rạp trong quá trình nhóm showtime
const getOrCreateBranch = (branchesMap, cinemaData) => {
    if (!branchesMap.has(cinemaData.id)) {
        branchesMap.set(cinemaData.id, {
            ...cinemaData,
            formatsMap: new Map(),
        });
    }

    return branchesMap.get(cinemaData.id);
};
// Hàm hỗ trợ lấy hoặc tạo đối tượng định dạng suất chiếu trong quá trình nhóm showtime
const getOrCreateFormat = (formatsMap, showtime) => {
    const formatKey = `${showtime.format}-${showtime.room}`;

    if (!formatsMap.has(formatKey)) {
        formatsMap.set(formatKey, {
            key: formatKey,
            type: `${showtime.format} - ${showtime.room}`,
            slots: [],
        });
    }

    return formatsMap.get(formatKey);
};

const getOrCreateMovieShowtimeGroup = (groups, showtime) => {
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
};
// Chuẩn hóa cấu trúc dữ liệu thương hiệu rạp chiếu sau khi đã nhóm showtime, sắp xếp chi nhánh và suất chiếu theo tên
const normalizeBrandGroup = (brand) => {
    const branches = sortByName(Array.from(brand.branchesMap.values()).map(normalizeBranchGroup));

    return {
        id: brand.id,
        name: brand.name,
        logo: brand.logo,
        branchCount: branches.length,
        branches,
    };
};
// Chuẩn hóa cấu trúc dữ liệu chi nhánh rạp chiếu sau khi đã nhóm showtime, sắp xếp định dạng suất chiếu theo tên
const normalizeBranchGroup = (branch) => ({
    id: branch.id,
    name: branch.name,
    address: branch.address,
    formats: Array.from(branch.formatsMap.values()).map((format) => ({
        ...format,
        slots: format.slots.sort((a, b) => a.time.localeCompare(b.time)),
    })),
});
// Chuẩn hóa dữ liệu thương hiệu rạp chiếu, đảm bảo có ID, tên và logo hợp lệ
const normalizeBrand = (row) => ({
    id: Number(row.brand_id || row.cinema_id || 0),
    name: row.brand_name || resolveBrandName(row.cinema_name),
    logo: row.brand_logo_url || DEFAULT_BRAND_LOGO,
});
// Chuẩn hóa dữ liệu rạp chiếu, đảm bảo có ID, tên và địa chỉ hợp lệ
const normalizeCinema = (row) => ({
    id: Number(row.cinema_id),
    cinema_id: Number(row.cinema_id),
    name: row.cinema_name || "Rạp đang cập nhật",
    address: row.cinema_address || "",
});
// Chuẩn hóa dữ liệu phim, đảm bảo có ID, tên, poster, thể loại và thời lượng hợp lệ
const normalizeMovie = (row, currentMovie) => ({
    id: Number(row.movie_id),
    movie_id: Number(row.movie_id),
    title: row.title || currentMovie?.title || "Phim chưa xác định",
    poster: row.poster_url || currentMovie?.poster_url,
    genre: row.genre || currentMovie?.genre,
    durationMinutes: Number(row.duration_minutes || currentMovie?.duration_minutes || 0),
});
// Hàm hỗ trợ sắp xếp một mảng đối tượng theo thuộc tính 'name' theo thứ tự chữ cái tiếng Việt
const sortByName = (items) => items.sort((a, b) => a.name.localeCompare(b.name, "vi"));
const sortByTitle = (items) => items.sort((a, b) => a.title.localeCompare(b.title, "vi"));
// Hàm hỗ trợ định dạng loại phòng chiếu dựa trên dữ liệu đầu vào, trả về tên loại phòng phù hợp
const formatRoomType = (roomType) => {
    if (!roomType) return "2D";

    const normalizedRoomType = String(roomType).toLowerCase();
    if (normalizedRoomType === "imax") return "IMAX";
    if (normalizedRoomType === "vip") return "2D VIP";
    if (normalizedRoomType === "3d") return "3D";

    return "2D";
};
// Hàm hỗ trợ xác định tên thương hiệu rạp chiếu dựa trên tên rạp chiếu, sử dụng các từ khóa để nhận diện thương hiệu phổ biến
const resolveBrandName = (cinemaName = "") => {
    const normalizedCinemaName = cinemaName.toLowerCase();

    if (normalizedCinemaName.includes("cgv")) return "CGV Cinemas";
    if (normalizedCinemaName.includes("lotte")) return "Lotte Cinema";
    if (normalizedCinemaName.includes("galaxy")) return "Galaxy Cinema";
    if (normalizedCinemaName.includes("bhd")) return "BHD Star Cineplex";
    if (normalizedCinemaName.includes("cinestar")) return "CineStar";

    return "Rạp chiếu";
};
// Hàm hỗ trợ xác định tên thành phố dựa trên ID thành phố, sử dụng một bản đồ để ánh xạ ID thành tên thành phố phổ biến
const resolveCityName = (cityId) => {
    const cityNames = {
        1: "Hà Nội",
        2: "TP. Hồ Chí Minh",
        3: "Đà Nẵng",
        4: "Hải Phòng",
        5: "Cần Thơ",
    };

    return cityNames[Number(cityId)] || "Khu vực khác";
};
// Hàm hỗ trợ trích xuất phần ngày từ chuỗi thời gian, đảm bảo trả về định dạng ngày hợp lệ
const toDatePart = (value) => {
    if (!value) return "";
    return String(value).slice(0, 10);
};
// Hàm hỗ trợ trích xuất phần giờ và phút từ chuỗi thời gian, đảm bảo trả về định dạng giờ hợp lệ
const toTimePart = (value) => {
    if (!value) return "";

    const text = String(value);
    if (text.includes("T")) return text.slice(11, 16);
    if (text.length >= 16) return text.slice(11, 16);

    return text.slice(0, 5);
};

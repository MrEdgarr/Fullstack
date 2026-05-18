export const CINEMAS = [
    { id: 1, name: "Galaxy Mipec Long Biên" },
    { id: 2, name: "Galaxy Nguyễn Du" },
    { id: 3, name: "Galaxy Tân Bình" },
    { id: 4, name: "Galaxy Kinh Dương Vương" }
];

const generateShowtimes = () => {
    const showtimes = [];
    const today = new Date();
    let showtimeIdCounter = 1;
    
    for (let cinemaId = 1; cinemaId <= CINEMAS.length; cinemaId++) {
        // Tạo lịch chiếu cho 7 ngày tới
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateString = date.toISOString().split("T")[0]; 
            
            // Mock mỗi rạp chiếu các phim ngẫu nhiên (dùng id từ 1 đến 6 cho đa dạng)
            const movieIds = cinemaId % 2 === 0 ? [1, 3, 5, 6, 8] : [2, 4, 7, 9, 10];
            
            movieIds.forEach(movieId => {
                showtimes.push({
                    id: showtimeIdCounter++,
                    cinemaId,
                    movieId,
                    date: dateString,
                    format: movieId % 2 === 0 ? "2D Phụ Đề" : "2D Lồng Tiếng",
                    ageRestriction: movieId % 3 === 0 ? "18T" : "13T",
                    room: `RAP ${movieId % 5 + 1}`,
                    times: ["09:00", "12:30", "15:45", "18:00", "20:30", "22:15"]
                });
            });
        }
    }
    return showtimes;
};

export const SHOWTIMES_DATA = generateShowtimes();

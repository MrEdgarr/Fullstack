const showtimeSeatsRepository = require("./showtime-seats.repository");

exports.getByShowtime = (showtimeId) => {
  return showtimeSeatsRepository.getByShowtime(showtimeId);
};

import * as showtimeSeatsRepository from "./showtime-seats.repository.js";

export const getByShowtime = (showtimeId) => {
  return showtimeSeatsRepository.getByShowtime(showtimeId);
};

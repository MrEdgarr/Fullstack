const showtimesRepository = require("./showtimes.repository");
const showtimesMapper = require("./showtimes.mapper");

exports.getMovieScheduleTree = async (movieId, query = {}) => {
  const filters = normalizeMovieScheduleFilters(query);
  const [optionRows] = await showtimesRepository.getMovieScheduleOptionRows(movieId);
  const [scheduleRows] = await showtimesRepository.getMovieScheduleRows(movieId, filters);

  return showtimesMapper.mapMovieScheduleResponse(scheduleRows, optionRows, filters);
};

exports.getScheduleTree = async (query = {}) => {
  const filters = normalizeScheduleFilters(query);
  const [optionRows] = await showtimesRepository.getScheduleOptionRows();
  const [scheduleRows] = await showtimesRepository.getScheduleRows(filters);

  return showtimesMapper.mapScheduleResponse(scheduleRows, optionRows, filters);
};

function normalizeMovieScheduleFilters(query) {
  return {
    date: query.date || null,
    cityId: query.city_id ? Number(query.city_id) : null,
    cinemaId: query.cinema_id ? Number(query.cinema_id) : null,
  };
}

function normalizeScheduleFilters(query) {
  return {
    date: query.date || null,
    cityId: query.city_id ? Number(query.city_id) : null,
    cinemaId: query.cinema_id ? Number(query.cinema_id) : null,
    movieId: query.movie_id ? Number(query.movie_id) : null,
  };
}

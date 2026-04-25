const db = require("../config/database");

exports.getAll = () => db.execute("SELECT * FROM movies ORDER BY release_date DESC");
exports.getById = (id) => db.execute("SELECT * FROM movies WHERE movie_id = ?", [id]);
exports.create = (
  title,
  duration_minutes,
  genre,
  director,
  cast,
  release_date,
  description,
  poster_url,
  status,
) =>
  db.execute(
    "INSERT INTO movies (title, duration_minutes, genre, director, cast, release_date, description, poster_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      title,
      duration_minutes,
      genre,
      director,
      cast,
      release_date,
      description,
      poster_url,
      status || "upcoming",
    ],
  );
exports.update = (
  id,
  title,
  duration_minutes,
  genre,
  director,
  cast,
  release_date,
  description,
  poster_url,
  status,
) =>
  db.execute(
    "UPDATE movies SET title = ?, duration_minutes = ?, genre = ?, director = ?, cast = ?, release_date = ?, description = ?, poster_url = ?, status = ? WHERE movie_id = ?",
    [
      title,
      duration_minutes,
      genre,
      director,
      cast,
      release_date,
      description,
      poster_url,
      status,
      id,
    ],
  );
exports.delete = (id) => db.execute("DELETE FROM movies WHERE movie_id = ?", [id]);

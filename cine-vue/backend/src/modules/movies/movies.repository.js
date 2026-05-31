const db = require("../../shared/config/database");

exports.getAll = () =>
  db.execute(`
  SELECT * FROM movies 
  ORDER BY 
    CASE 
      WHEN status = 'now_showing' THEN 1 
      WHEN status = 'upcoming' THEN 2 
      ELSE 3 
    END, 
    release_date DESC, title ASC
`);

// Tối ưu cho Frontend
exports.getNowShowing = () =>
  db.execute(`
  SELECT * FROM movies 
  WHERE status = 'now_showing' 
  ORDER BY release_date DESC, title ASC
`);

exports.getUpcoming = () =>
  db.execute(`
  SELECT * FROM movies 
  WHERE status = 'upcoming' 
  ORDER BY release_date ASC, title ASC
`);

exports.getById = (id) => db.execute("SELECT * FROM movies WHERE movie_id = ?", [id]);

exports.getByStatus = (status) =>
  db.execute(
    `
  SELECT * FROM movies 
  WHERE status = ? 
  ORDER BY release_date DESC
`,
    [status],
  );

exports.create = (
  title,
  title_en,
  duration_minutes,
  genre,
  age_rating,
  rating_percent,
  banner_url,
  poster_url,
  trailer_url,
  description,
  release_date,
  status,
) =>
  db.execute(
    "INSERT INTO movies (title, title_en, duration_minutes, genre, age_rating, rating_percent, banner_url, poster_url, trailer_url, description, release_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      title,
      title_en,
      duration_minutes,
      genre,
      age_rating,
      rating_percent,
      banner_url,
      poster_url,
      trailer_url,
      description,
      release_date,
      status,
    ],
  );
exports.update = (
  id,
  title,
  title_en,
  duration_minutes,
  genre,
  age_rating,
  rating_percent,
  banner_url,
  poster_url,
  trailer_url,
  description,
  release_date,
  status,
) =>
  db.execute(
    "UPDATE movies SET title = ?, title_en = ?, duration_minutes = ?, genre = ?, age_rating = ?, rating_percent = ?, banner_url = ?, poster_url = ?, trailer_url = ?, description = ?, release_date = ?, status = ? WHERE movie_id = ?",
    [
      title,
      title_en,
      duration_minutes,
      genre,
      age_rating,
      rating_percent,
      banner_url,
      poster_url,
      trailer_url,
      description,
      release_date,
      status,
      id,
    ],
  );
exports.delete = (id) => db.execute("DELETE FROM movies WHERE movie_id = ?", [id]);

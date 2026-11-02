import cloudinary from "../../shared/config/cloudinary.js";
import { uploadToCloudinary } from "../../shared/middleware/upload-cloudinary.js";
import * as moviesRepository from "./movies.repository.js";
import AppError from "../../shared/utils/app-error.js";

export const create = async (payload, files) => {
  const {
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
  } = payload;

  const posterUrl = files?.poster?.[0]
    ? (await uploadToCloudinary(files.poster[0], "posters")).secure_url
    : poster_url || null;
  const bannerUrl = files?.banner?.[0]
    ? (await uploadToCloudinary(files.banner[0], "banners")).secure_url
    : banner_url || null;

  await moviesRepository.create(
    title,
    title_en,
    duration_minutes,
    genre,
    age_rating,
    rating_percent || 0,
    bannerUrl,
    posterUrl,
    trailer_url,
    description,
    release_date,
    status,
  );
};

export const update = async (movieId, payload, files) => {
  const [oldMovieRows] = await moviesRepository.getById(movieId);
  const oldMovie = oldMovieRows[0];

  if (!oldMovie) {
    throw new AppError("Movie not found", 404);
  }

  const {
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
  } = payload;

  let posterUrl = poster_url ?? oldMovie.poster_url;
  let bannerUrl = banner_url ?? oldMovie.banner_url;

  if (files?.poster?.[0]) {
    await deleteOldImage(oldMovie.poster_url);
    posterUrl = (await uploadToCloudinary(files.poster[0], "posters")).secure_url;
  }

  if (files?.banner?.[0]) {
    await deleteOldImage(oldMovie.banner_url);
    bannerUrl = (await uploadToCloudinary(files.banner[0], "banners")).secure_url;
  }

  await moviesRepository.update(
    movieId,
    title,
    title_en,
    duration_minutes,
    genre,
    age_rating,
    rating_percent || 0,
    bannerUrl,
    posterUrl,
    trailer_url,
    description,
    release_date,
    status,
  );
};

export const remove = async (movieId) => {
  const [movieRows] = await moviesRepository.getById(movieId);
  const movie = movieRows[0];

  if (movie) {
    await deleteOldImage(movie.poster_url);
    await deleteOldImage(movie.banner_url);
  }

  await moviesRepository.remove(movieId);
};

export { remove as delete };

async function deleteOldImage(imageUrl) {
  if (!imageUrl) return;

  try {
    const publicId = imageUrl.split("/").slice(-2).join("/").split(".")[0];
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Failed to delete old image:", error);
  }
}

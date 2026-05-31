export const normalizeVietnameseText = (str) => {
    if (!str) return "";

    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .replace(/([^0-9a-z\s])/gi, "");
};

export const slugify = (str) => {
    if (!str) return "";

    return normalizeVietnameseText(str)
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
};

export const getMovieId = (movie) => movie?.movie_id ?? movie?.id;

export const createMovieSlug = (movie) => {
    const movieId = getMovieId(movie);
    const movieSlug = slugify(movie?.title);

    return movieId ? `${movieSlug}-i${movieId}` : movieSlug;
};

export const extractIdFromSlug = (slug) => {
    if (!slug) return null;

    const cleanSlug = slug.split("?")[0].replace(/\/$/, "");
    const match = cleanSlug.match(/-i(\d+)$/);

    return match ? parseInt(match[1], 10) : null;
};

// stores/useMovieStore.js
export const useMovieStore = defineStore("movie", () => {
    // ==================== STATE ======================
    const currentMovie = ref(null);

    // ==================== GETTERS ====================

    // ==================== ACTIONS ====================
    const setCurrentMovie = (movie) => {
        if (!movie) return;
        currentMovie.value = {
            id: movie.id,
            title: movie.title,
            poster: movie.poster,
            // backdrop: movie.backdrop,
            // genre: movie.genre,
            // duration: movie.duration,
            // rating: movie.rating,
            // description: movie.description,
            // releaseDate: movie.releaseDate,
        };
    };

    const clearCurrentMovie = () => {
        currentMovie.value = null;
    };

    return {
        currentMovie,

        setCurrentMovie,
        clearCurrentMovie,
    };
});

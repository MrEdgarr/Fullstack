import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/_services/api";

export const useMoviesStore = defineStore("movies", () => {
    // State
    const nowShowing = ref([]);
    const upcoming = ref([]);
    const allMovies = ref([]);
    const currentMovie = ref(null);
    const pendingRequests = ref(0);
    const error = ref(null);
    const errors = ref({
        nowShowing: null,
        upcoming: null,
        allMovies: null,
        currentMovie: null,
    });
    const hasFetchedNowShowing = ref(false);
    const hasFetchedUpcoming = ref(false);
    const hasFetchedAllMovies = ref(false);

    let nowShowingRequest = null;
    let upcomingRequest = null;
    let homeMoviesRequest = null;
    let allMoviesRequest = null;

    // Getters
    const isLoading = computed(() => pendingRequests.value > 0);
    const isHomeLoaded = computed(() => hasFetchedNowShowing.value && hasFetchedUpcoming.value);

    const topRatedNowShowing = computed(() =>
        [...nowShowing.value].sort((a, b) => b.rating_percent - a.rating_percent),
    );

    const sortedUpcoming = computed(() =>
        [...upcoming.value].sort((a, b) => new Date(a.release_date) - new Date(b.release_date)),
    );

    const normalizeFetchOptions = (options) => {
        if (typeof options === "boolean") return { force: options };
        return {
            force: false,
            ...options,
        };
    };

    const runWithLoading = async (callback) => {
        pendingRequests.value += 1;
        try {
            return await callback();
        } finally {
            pendingRequests.value = Math.max(pendingRequests.value - 1, 0);
        }
    };

    const setError = (key, message, err) => {
        errors.value[key] = message;
        error.value = message;
        console.error(err);
    };

    // Actions
    const fetchNowShowing = async (options = {}) => {
        const { force } = normalizeFetchOptions(options);

        if (!force && hasFetchedNowShowing.value) {
            return nowShowing.value;
        }

        if (nowShowingRequest) return nowShowingRequest;

        nowShowingRequest = runWithLoading(async () => {
            errors.value.nowShowing = null;

            try {
                const res = await api.get("/movies/now-showing");
                nowShowing.value = res.data.data || [];
                hasFetchedNowShowing.value = true;
                return nowShowing.value;
            } catch (err) {
                setError("nowShowing", "Không thể tải phim đang chiếu", err);
                return [];
            } finally {
                nowShowingRequest = null;
            }
        });

        return nowShowingRequest;
    };

    const fetchUpcoming = async (options = {}) => {
        const { force } = normalizeFetchOptions(options);

        if (!force && hasFetchedUpcoming.value) {
            return upcoming.value;
        }

        if (upcomingRequest) return upcomingRequest;

        upcomingRequest = runWithLoading(async () => {
            errors.value.upcoming = null;

            try {
                const res = await api.get("/movies/upcoming");
                upcoming.value = res.data.data || [];
                hasFetchedUpcoming.value = true;
                return upcoming.value;
            } catch (err) {
                setError("upcoming", "Không thể tải phim sắp chiếu", err);
                return [];
            } finally {
                upcomingRequest = null;
            }
        });

        return upcomingRequest;
    };

    const fetchHomeMovies = async (options = {}) => {
        const { force } = normalizeFetchOptions(options);

        if (!force && isHomeLoaded.value) {
            return {
                nowShowing: nowShowing.value,
                upcoming: upcoming.value,
            };
        }

        if (homeMoviesRequest) return homeMoviesRequest;

        error.value = null;

        homeMoviesRequest = Promise.allSettled([
            fetchNowShowing({ force }),
            fetchUpcoming({ force }),
        ])
            .then(() => ({
                nowShowing: nowShowing.value,
                upcoming: upcoming.value,
            }))
            .finally(() => {
                homeMoviesRequest = null;
            });

        return homeMoviesRequest;
    };

    // Fetch tất cả khi cần (cho Admin hoặc trang tổng hợp)
    const fetchAll = async (options = {}) => {
        const { force } = normalizeFetchOptions(options);

        if (!force && hasFetchedAllMovies.value) {
            return allMovies.value;
        }

        if (allMoviesRequest) return allMoviesRequest;

        allMoviesRequest = runWithLoading(async () => {
            errors.value.allMovies = null;

            try {
                const res = await api.get("/movies");
                allMovies.value = res.data.data || [];
                hasFetchedAllMovies.value = true;
                return allMovies.value;
            } catch (err) {
                setError("allMovies", "Không thể tải danh sách phim", err);
                return [];
            } finally {
                allMoviesRequest = null;
            }
        });

        return allMoviesRequest;
    };

    const fetchMovieById = async (id) => {
        return runWithLoading(async () => {
            errors.value.currentMovie = null;

            try {
                const res = await api.get(`/movies/${id}`);
                currentMovie.value = res.data.data;
                return currentMovie.value;
            } catch (err) {
                setError("currentMovie", "Không thể tải chi tiết phim", err);
                return null;
            }
        });
    };

    const setCurrentMovie = (movie) => {
        currentMovie.value = movie;
    };

    return {
        // State
        nowShowing,
        upcoming,
        allMovies,
        currentMovie,
        isLoading,
        error,
        errors,
        isHomeLoaded,

        // Getters
        topRatedNowShowing,
        sortedUpcoming,

        // Actions
        fetchNowShowing,
        fetchUpcoming,
        fetchHomeMovies,
        fetchAll,
        fetchMovieById,
        setCurrentMovie,
    };
});

export const useMovieStore = useMoviesStore;

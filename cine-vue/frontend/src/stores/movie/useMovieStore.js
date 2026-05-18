import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/_services/api";

export const useMoviesStore = defineStore("movies", () => {
    // State
    const nowShowing = ref([]);
    const upcoming = ref([]);
    const allMovies = ref([]);
    const isLoading = ref(false);
    const error = ref(null);

    // Getters
    const topRatedNowShowing = computed(() =>
        [...nowShowing.value].sort((a, b) => b.rating_percent - a.rating_percent).slice(0, 8),
    );

    const sortedUpcoming = computed(() =>
        [...upcoming.value].sort((a, b) => new Date(a.release_date) - new Date(b.release_date)),
    );

    // Actions
    const fetchNowShowing = async () => {
        isLoading.value = true;
        error.value = null;
        try {
            const res = await api.get("/movies/now-showing");
            nowShowing.value = res.data.data || [];
        } catch (err) {
            error.value = "Không thể tải phim đang chiếu";
            console.error(err);
        } finally {
            isLoading.value = false;
        }
    };

    const fetchUpcoming = async () => {
        isLoading.value = true;
        error.value = null;
        try {
            const res = await api.get("/movies/upcoming");
            upcoming.value = res.data.data || [];
        } catch (err) {
            error.value = "Không thể tải phim sắp chiếu";
            console.error(err);
        } finally {
            isLoading.value = false;
        }
    };

    // Fetch tất cả khi cần (cho Admin hoặc trang tổng hợp)
    const fetchAll = async () => {
        isLoading.value = true;
        try {
            const res = await api.get("/movies");
            allMovies.value = res.data.data || [];
        } catch (err) {
            err.value = "Không thể tải danh sách phim";
        } finally {
            isLoading.value = false;
        }
    };

    const fetchMovieById = async (id) => {
        try {
            const res = await api.get(`/movies/${id}`);
            return res.data.data;
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    return {
        // State
        nowShowing,
        upcoming,
        allMovies,
        isLoading,
        error,

        // Getters
        topRatedNowShowing,
        sortedUpcoming,

        // Actions
        fetchNowShowing,
        fetchUpcoming,
        fetchAll,
        fetchMovieById,
    };
});

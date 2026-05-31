import router from "@/router";
import { createMovieSlug, normalizeVietnameseText } from "@/utils/helpers/slug";
import { MOVIES } from "@/utils/constants/Movie";
export const useSearchStore = defineStore("search", () => {
    // ==================== STATE ======================
    const isOpen = ref(false);
    const searchQuery = ref("");

    // ==================== GETTERS ====================
    // Computed: Kết quả tìm kiếm
    const filteredMovies = computed(() => {
        const query = searchQuery.value.trim();
        if (!query) return MOVIES;
        // Chuẩn hóa query: bỏ dấu, chuyển về chữ thường
        const normalizedQuery = normalizeVietnameseText(query.toLowerCase());
        return MOVIES.filter((movie) => {
            const normalizedTitle = normalizeVietnameseText(movie.title.toLowerCase());
            return normalizedTitle.includes(normalizedQuery);
        });
    });

    // ==================== ACTIONS ====================

    const openModal = () => {
        isOpen.value = true;
        searchQuery.value = "";
    };

    const closeModal = () => {
        isOpen.value = false;
        searchQuery.value = "";
    };

    const selectMovie = (movie) => {
        router.push({
            name: "movie",
            params: {
                slug: createMovieSlug(movie),
            },
        });
        closeModal();
    };

    return {
        // STATE
        isOpen,
        searchQuery,
        // GETTERS
        filteredMovies,
        // ACTIONS
        openModal,
        closeModal,
        selectMovie,
    };
});

import router from "@/router";
import { createMovieSlug, normalizeVietnameseText } from "@/utils/helpers/slug";
import { useMoviesStore } from "@/stores/movie/useMovieStore";

export const useSearchStore = defineStore("search", () => {
    const moviesStore = useMoviesStore();

    const isOpen = ref(false);
    const searchQuery = ref("");

    const movies = computed(() => moviesStore.allMovies);

    const filteredMovies = computed(() => {
        const query = searchQuery.value.trim();
        if (!query) return movies.value;

        const normalizedQuery = normalizeVietnameseText(query.toLowerCase());

        return movies.value.filter((movie) => {
            const normalizedTitle = normalizeVietnameseText(movie.title?.toLowerCase() || "");
            const normalizedTitleEn = normalizeVietnameseText(movie.title_en?.toLowerCase() || "");

            return (
                normalizedTitle.includes(normalizedQuery) ||
                normalizedTitleEn.includes(normalizedQuery)
            );
        });
    });

    const fetchMovies = () => moviesStore.fetchAll();

    const openModal = () => {
        isOpen.value = true;
        searchQuery.value = "";
        fetchMovies();
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
        isOpen,
        searchQuery,
        filteredMovies,
        isLoading: computed(() => moviesStore.isLoading),
        fetchMovies,
        openModal,
        closeModal,
        selectMovie,
    };
});

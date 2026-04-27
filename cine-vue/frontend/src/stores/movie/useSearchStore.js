export const useSearchStore = defineStore("search", () => {
    const isOpen = ref(false);
    const searchQuery = ref("");
    const searchResults = ref([]);

    // Giả lập danh sách phim (bạn sẽ thay bằng API sau)
    const allMovies = ref([
        {
            id: 1,
            title: "Kẻ Trộm Một Trăng 4",
            poster: "https://picsum.photos/300/400?1",
            genre: "Hành động",
        },
        {
            id: 2,
            title: "Deadpool & Wolverine",
            poster: "https://picsum.photos/300/400?2",
            genre: "Siêu anh hùng",
        },
        {
            id: 3,
            title: "Inside Out 2",
            poster: "https://picsum.photos/300/400?3",
            genre: "Hoạt hình",
        },
        {
            id: 4,
            title: "Dune: Part Two",
            poster: "https://picsum.photos/300/400?4",
            genre: "Khoa học viễn tưởng",
        },
        {
            id: 5,
            title: "Kingdom of the Planet of the Apes",
            poster: "https://picsum.photos/300/400?5",
            genre: "Khoa học viễn tưởng",
        },
    ]);

    // Computed: Kết quả tìm kiếm
    const filteredMovies = computed(() => {
        if (!searchQuery.value.trim()) return [];

        const query = searchQuery.value.toLowerCase().trim();
        return allMovies.value.filter(
            (movie) =>
                movie.title.toLowerCase().includes(query) ||
                movie.genre.toLowerCase().includes(query),
        );
    });

    const openModal = () => {
        isOpen.value = true;
        searchQuery.value = "";
    };

    const closeModal = () => {
        isOpen.value = false;
        searchQuery.value = "";
        searchResults.value = [];
    };

    const selectMovie = (movie) => {
        // Xử lý khi chọn phim (ví dụ: chuyển sang trang chi tiết hoặc lưu vào movieStore)
        console.log("Selected movie:", movie);
        closeModal();
        // Sau này bạn có thể gọi movieStore.setCurrentMovie(movie)
    };

    return {
        isOpen,
        searchQuery,
        filteredMovies,
        openModal,
        closeModal,
        selectMovie,
    };
});

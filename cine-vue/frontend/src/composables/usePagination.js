import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

export function usePagination(itemsSource, options = {}) {
    const {
        pageSize = 10,
        syncWithUrl = false,
        queryKey = "page",
        scrollToTop = true,
    } = options;

    let route = null;
    let router = null;
    try {
        route = useRoute();
        router = useRouter();
    } catch {
        // Fallback nếu gọi ngoài context vue-router
    }

    const getInitialPage = () => {
        if (syncWithUrl && route?.query?.[queryKey]) {
            const parsed = parseInt(route.query[queryKey], 10);
            if (!isNaN(parsed) && parsed > 0) return parsed;
        }
        return 1;
    };

    const currentPage = ref(getInitialPage());
    const size = ref(pageSize);

    // Chuẩn hóa danh sách nguồn
    const items = computed(() => {
        if (!itemsSource) return [];
        if (Array.isArray(itemsSource.value)) return itemsSource.value;
        if (Array.isArray(itemsSource)) return itemsSource;
        return [];
    });

    const totalItems = computed(() => items.value.length);
    const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / size.value)));

    // Đảm bảo currentPage không vượt quá totalPages khi danh sách items thay đổi
    watch(totalPages, (newTotal) => {
        if (currentPage.value > newTotal) {
            currentPage.value = newTotal;
        }
    });

    // Đồng bộ ngược nếu URL thay đổi (Browser Back / Forward)
    if (syncWithUrl && route) {
        watch(
            () => route.query[queryKey],
            (newPage) => {
                const parsed = parseInt(newPage, 10);
                if (!isNaN(parsed) && parsed > 0 && parsed !== currentPage.value) {
                    currentPage.value = parsed;
                } else if (!newPage && currentPage.value !== 1) {
                    currentPage.value = 1;
                }
            },
        );
    }

    const scrollToTopFn = () => {
        if (scrollToTop && typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    // Đảm bảo luôn cuộn on top khi currentPage thay đổi (kể cả qua v-model)
    watch(currentPage, (newPage, oldPage) => {
        if (newPage !== oldPage) {
            scrollToTopFn();
        }
    });

    const setPage = (page) => {
        const targetPage = Math.max(1, Math.min(page, totalPages.value));
        currentPage.value = targetPage;

        if (syncWithUrl && router && route) {
            router.replace({
                query: {
                    ...route.query,
                    [queryKey]: targetPage > 1 ? targetPage.toString() : undefined,
                },
            });
        }

        scrollToTopFn();
    };

    const nextPage = () => {
        if (currentPage.value < totalPages.value) {
            setPage(currentPage.value + 1);
        }
    };

    const prevPage = () => {
        if (currentPage.value > 1) {
            setPage(currentPage.value - 1);
        }
    };

    const paginatedItems = computed(() => {
        const start = (currentPage.value - 1) * size.value;
        return items.value.slice(start, start + size.value);
    });

    const startIndex = computed(() =>
        totalItems.value === 0 ? 0 : (currentPage.value - 1) * size.value + 1,
    );
    const endIndex = computed(() =>
        Math.min(currentPage.value * size.value, totalItems.value),
    );

    return {
        currentPage,
        pageSize: size,
        totalPages,
        totalItems,
        paginatedItems,
        startIndex,
        endIndex,
        setPage,
        nextPage,
        prevPage,
    };
}

<template>
    <dialog class="modal" :class="{ 'modal-open': searchStore.isOpen }" v-if="searchStore.isOpen">
        <div class="modal-box max-h-2/3 p-0">
            <div class="input input-ghost border-b-base-300 bg-base-100 sticky top-0 z-50 w-full">
                <BaseIcon name="search" class="text-base-content/50" />
                <input
                    ref="searchInput"
                    v-model="searchQuery"
                    class="grow"
                    placeholder="Search..."
                    type="search"
                    @keyup.escape="searchStore.closeModal"
                />
            </div>

            <div class="animate-pulse list" v-if="isLoading">
                <div class="list-row">
                    <div class="w-12 bg-base-300 rounded-box"></div>
                    <div class="flex-1 space-y-3 py-2">
                        <div class="h-4 bg-base-300 rounded w-3/4"></div>
                        <div class="h-2 bg-base-300 rounded w-1/2"></div>
                        <div class="h-3 bg-base-300 rounded w-2/3"></div>
                    </div>
                </div>
            </div>

            <Transition name="fade" mode="out-in" v-else-if="filteredMovies.length > 0">
                <ul class="list">
                    <li class="p-4 pb-2 text-xs tracking-wide opacity-50">
                        Most played songs this week
                    </li>
                    <li
                        class="list-row"
                        v-for="movie in filteredMovies"
                        :key="movie.id"
                        @click="searchStore.selectMovie(movie)"
                    >
                        <div>
                            <img
                                class="rounded-box w-12"
                                :src="movie.poster"
                                :alt="movie.title"
                                loading="lazy"
                            />
                        </div>
                        <div class="flex-1 pl-4">
                            <p class="text-base-content text-sm leading-tight font-bold">
                                {{ movie.title }}
                            </p>
                            <p class="text-tiny text-base-content/50 mt-1 leading-tight">
                                {{ movie.genre }}
                            </p>
                            <div class="flex items-center">
                                <div class="text-tiny text-base-content/50 mt-1 flex items-center">
                                    <BaseIcon name="star" class="mr-1 text-yellow-500" />
                                    <p class="text-sm">9.3</p>
                                </div>
                                <button class="btn btn-primary btn-xs mt-1 ml-2">Đang chiếu</button>
                            </div>
                        </div>
                    </li>
                </ul>
            </Transition>

            <!-- Không tìm thấy -->
            <Transition name="fade" v-else-if="searchQuery.trim()">
                <div class="text-center py-10 text-base-content/50">
                    <p class="text-5xl mb-4">😶</p>
                    <p>Không tìm thấy phim nào phù hợp với</p>
                    <p class="font-medium">"{{ searchQuery }}"</p>
                </div>
            </Transition>
        </div>
        <div class="modal-backdrop" @click="searchStore.closeModal"></div>
    </dialog>
</template>
<script setup>

import { useSearchStore } from "@/stores/movie/useSearchStore";
const searchStore = useSearchStore();

const isLoading = ref(false);
const searchInput = ref(null);
let timeout = null;

const searchQuery = ref("");

watch(searchQuery, (newQuery) => {
    searchStore.searchQuery = newQuery;

    if (timeout) clearTimeout(timeout);

    if (newQuery.trim().length > 0) {
        isLoading.value = true;
        timeout = setTimeout(() => {
            isLoading.value = false;
        }, 400);
    } else {
        isLoading.value = false;
    }
});

// Tự động focus vào input khi modal mở
watch(
    () => searchStore.isOpen,
    async (isOpen) => {
        if (isOpen) {
            await nextTick();
            searchInput.value?.focus();
            searchQuery.value = ""; // Reset query khi mở modal
        }
    },
);
// Loading khi tìm kiếm
watch(
    () => searchStore.searchQuery,
    (newQuery) => {
        if (timeout) clearTimeout(timeout);

        if (newQuery.trim().length > 0) {
            isLoading.value = true;
            timeout = setTimeout(() => {
                isLoading.value = false;
            }, 450); // Giả lập độ trễ tìm kiếm
        } else {
            isLoading.value = false;
        }
    },
);

const filteredMovies = computed(() => searchStore.filteredMovies);

onUnmounted(() => {
    if (timeout) clearTimeout(timeout);
});
</script>
<style>
.fade-enter-active,
.fade-leave-active {
    transition: all 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(15px);
}
</style>

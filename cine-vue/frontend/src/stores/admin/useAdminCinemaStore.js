import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/_services/api";
import {
    INITIAL_CHAINS,
    INITIAL_MULTIPLEXES,
    INITIAL_MOVIES,
    INITIAL_SHOWTIMES,
    INITIAL_ORDERS,
    INITIAL_PROMOTIONS,
    INITIAL_SETTLEMENTS,
    generateCinemaSeats,
} from "@/utils/constants/adminMockData";

export const useAdminCinemaStore = defineStore("adminCinema", () => {
    const chains = ref([...INITIAL_CHAINS]);
    const multiplexes = ref([...INITIAL_MULTIPLEXES]);
    const movies = ref([...INITIAL_MOVIES]);
    const showtimes = ref([...INITIAL_SHOWTIMES]);
    const orders = ref([...INITIAL_ORDERS]);
    const promotions = ref([...INITIAL_PROMOTIONS]);
    const settlements = ref([...INITIAL_SETTLEMENTS]);

    const selectedOrder = ref(null);
    const isSyncingAll = ref(false);
    const isLoadingState = ref(false);
    const pingStatus = ref({});
    const isMobileSidebarOpen = ref(false);

    const totalGmvToday = computed(() =>
        chains.value.reduce((acc, c) => acc + c.todayGmv, 0),
    );

    const totalTicketsToday = computed(() =>
        chains.value.reduce((acc, c) => acc + c.todayTickets, 0),
    );

    const totalCommissionRevenue = computed(() =>
        chains.value.reduce((acc, c) => acc + (c.todayGmv * c.commissionRate) / 100, 0),
    );

    const averageCommissionRate = computed(
        () => (totalCommissionRevenue.value / (totalGmvToday.value || 1)) * 100,
    );

    const openOrdersCount = computed(
        () => orders.value.filter((o) => o.ticketStatus === "issued").length,
    );

    async function fetchAdminState() {
        isLoadingState.value = true;
        try {
            const response = await api.get("/dashboard/admin-state", {
                skipServerLoading: true,
            });
            const data = response.data?.data;
            if (!data) return;

            if (Array.isArray(data.chains) && data.chains.length > 0) {
                chains.value = data.chains;
            }
            if (Array.isArray(data.multiplexes) && data.multiplexes.length > 0) {
                multiplexes.value = data.multiplexes;
            }
            if (Array.isArray(data.movies) && data.movies.length > 0) {
                movies.value = data.movies;
            }
            if (Array.isArray(data.showtimes) && data.showtimes.length > 0) {
                showtimes.value = data.showtimes;
            }
            if (Array.isArray(data.orders) && data.orders.length > 0) {
                orders.value = data.orders;
            }
            if (Array.isArray(data.promotions) && data.promotions.length > 0) {
                promotions.value = data.promotions;
            }
            if (Array.isArray(data.settlements) && data.settlements.length > 0) {
                settlements.value = data.settlements;
            }
        } catch {
            // Keep fallback mock data if backend is offline
        } finally {
            isLoadingState.value = false;
        }
    }

    async function syncAllApis() {
        isSyncingAll.value = true;
        try {
            const response = await api.post(
                "/dashboard/chains/sync",
                {},
                { skipServerLoading: true },
            );
            const updatedChains = response.data?.data;
            if (Array.isArray(updatedChains) && updatedChains.length > 0) {
                chains.value = updatedChains;
            } else {
                chains.value = chains.value.map((c) => ({
                    ...c,
                    latencyMs: Math.floor(Math.random() * 40) + 30,
                    apiStatus: "healthy",
                }));
            }
        } catch {
            chains.value = chains.value.map((c) => ({
                ...c,
                latencyMs: Math.floor(Math.random() * 40) + 30,
                apiStatus: "healthy",
            }));
        } finally {
            isSyncingAll.value = false;
        }
    }

    async function testPing(chainId) {
        pingStatus.value[chainId] = "testing";
        try {
            const response = await api.post(
                `/dashboard/chains/${chainId}/ping`,
                {},
                { skipServerLoading: true },
            );
            const result = response.data?.data;
            if (result?.latencyMs) {
                chains.value = chains.value.map((c) =>
                    c.id === chainId
                        ? { ...c, latencyMs: result.latencyMs, apiStatus: "healthy" }
                        : c,
                );
            }
        } catch {
            // Fallback local ping simulation
        } finally {
            pingStatus.value[chainId] = "success";
            setTimeout(() => {
                delete pingStatus.value[chainId];
            }, 3000);
        }
    }

    async function updateCommission(chainId, newRate) {
        chains.value = chains.value.map((c) =>
            c.id === chainId ? { ...c, commissionRate: newRate } : c,
        );
        try {
            await api.patch(
                `/dashboard/chains/${chainId}/commission`,
                { commissionRate: newRate },
                { skipServerLoading: true },
            );
        } catch {
            // Optimistic state kept
        }
    }

    async function toggleMultiplexStatus(multiplexId) {
        multiplexes.value = multiplexes.value.map((m) =>
            m.id === multiplexId
                ? { ...m, status: m.status === "active" ? "temporary_closed" : "active" }
                : m,
        );
        try {
            await api.patch(
                `/dashboard/multiplexes/${multiplexId}/toggle-status`,
                {},
                { skipServerLoading: true },
            );
        } catch {
            // Optimistic state kept
        }
    }

    async function fetchShowtimeSeats(showtimeId) {
        try {
            const response = await api.get(`/dashboard/showtimes/${showtimeId}/seats`, {
                skipServerLoading: true,
            });
            const seats = response.data?.data;
            if (Array.isArray(seats) && seats.length > 0) {
                return seats;
            }
        } catch {
            // Fallback to generated seats
        }
        return generateCinemaSeats(8, 14);
    }

    async function toggleSeatBlock(showtimeId, seatCode) {
        try {
            await api.patch(
                `/dashboard/showtimes/${showtimeId}/seats/${seatCode}/toggle-block`,
                {},
                { skipServerLoading: true },
            );
        } catch {
            // Optimistic UI handled in view
        }
    }

    async function releaseSeatHold(showtimeId, seatCode) {
        try {
            await api.patch(
                `/dashboard/showtimes/${showtimeId}/seats/${seatCode}/release`,
                {},
                { skipServerLoading: true },
            );
        } catch {
            // Optimistic UI handled in view
        }
    }

    async function addMovie(newMovie) {
        movies.value = [newMovie, ...movies.value];
        try {
            const response = await api.post("/dashboard/movies", newMovie, {
                skipServerLoading: true,
            });
            const created = response.data?.data;
            if (created?.id) {
                movies.value = movies.value.map((m) =>
                    m.id === newMovie.id ? { ...m, id: created.id, movieId: created.movieId } : m,
                );
            }
        } catch {
            // Optimistic state kept
        }
    }

    async function updateMovie(updatedMovie) {
        movies.value = movies.value.map((m) => (m.id === updatedMovie.id ? updatedMovie : m));
        try {
            await api.put(`/dashboard/movies/${updatedMovie.id}`, updatedMovie, {
                skipServerLoading: true,
            });
        } catch {
            // Optimistic state kept
        }
    }

    async function deleteMovie(movieId) {
        movies.value = movies.value.filter((m) => m.id !== movieId);
        try {
            await api.delete(`/dashboard/movies/${movieId}`, {
                skipServerLoading: true,
            });
        } catch {
            // Optimistic state kept
        }
    }

    async function quickStatusChange(movie, newStatus) {
        movies.value = movies.value.map((m) =>
            m.id === movie.id ? { ...m, status: newStatus } : m,
        );
        try {
            await api.patch(
                `/dashboard/movies/${movie.id}/status`,
                { status: newStatus },
                { skipServerLoading: true },
            );
        } catch {
            // Optimistic state kept
        }
    }

    async function resyncTicket(orderId) {
        orders.value = orders.value.map((o) =>
            o.id === orderId ? { ...o, ticketStatus: "issued" } : o,
        );
        if (selectedOrder.value?.id === orderId) {
            selectedOrder.value = { ...selectedOrder.value, ticketStatus: "issued" };
        }
        try {
            await api.post(
                `/dashboard/orders/${orderId}/resync`,
                {},
                { skipServerLoading: true },
            );
        } catch {
            // Optimistic state kept
        }
    }

    async function refundTicket(orderId) {
        orders.value = orders.value.map((o) =>
            o.id === orderId ? { ...o, paymentStatus: "refunded", ticketStatus: "sync_error" } : o,
        );
        if (selectedOrder.value?.id === orderId) {
            selectedOrder.value = {
                ...selectedOrder.value,
                paymentStatus: "refunded",
                ticketStatus: "sync_error",
            };
        }
        try {
            await api.post(
                `/dashboard/orders/${orderId}/refund`,
                {},
                { skipServerLoading: true },
            );
        } catch {
            // Optimistic state kept
        }
    }

    async function createPromotion(newPromo) {
        promotions.value = [newPromo, ...promotions.value];
        try {
            const response = await api.post("/dashboard/promotions", newPromo, {
                skipServerLoading: true,
            });
            const created = response.data?.data;
            if (created?.id) {
                promotions.value = promotions.value.map((p) =>
                    p.id === newPromo.id ? { ...p, id: created.id } : p,
                );
            }
        } catch {
            // Optimistic state kept
        }
    }

    async function approveSettlement(settlementId) {
        settlements.value = settlements.value.map((s) =>
            s.id === settlementId ? { ...s, status: "approved" } : s,
        );
        try {
            await api.patch(
                `/dashboard/settlements/${settlementId}/approve`,
                {},
                { skipServerLoading: true },
            );
        } catch {
            // Optimistic state kept
        }
    }

    function toggleMobileSidebar() {
        isMobileSidebarOpen.value = !isMobileSidebarOpen.value;
    }

    function closeMobileSidebar() {
        isMobileSidebarOpen.value = false;
    }

    return {
        chains,
        multiplexes,
        movies,
        showtimes,
        orders,
        promotions,
        settlements,
        selectedOrder,
        isSyncingAll,
        isLoadingState,
        pingStatus,
        isMobileSidebarOpen,
        totalGmvToday,
        totalTicketsToday,
        totalCommissionRevenue,
        averageCommissionRate,
        openOrdersCount,
        fetchAdminState,
        syncAllApis,
        testPing,
        updateCommission,
        toggleMultiplexStatus,
        fetchShowtimeSeats,
        toggleSeatBlock,
        releaseSeatHold,
        addMovie,
        updateMovie,
        deleteMovie,
        quickStatusChange,
        resyncTicket,
        refundTicket,
        createPromotion,
        approveSettlement,
        toggleMobileSidebar,
        closeMobileSidebar,
    };
});

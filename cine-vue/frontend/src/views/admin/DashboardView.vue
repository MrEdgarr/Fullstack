<template>
    <div class="space-y-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-5">
            <div>
                <div class="flex items-center gap-2.5 flex-wrap">
                    <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                        Bảng điều khiển Trung gian Đối tác Rạp
                    </h1>
                    <span
                        v-if="selectedBrandName"
                        class="px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white flex items-center gap-1.5"
                    >
                        <span>Đối tác: {{ selectedBrandName }}</span>
                        <button
                            type="button"
                            @click="handleBrandChange('')"
                            class="hover:opacity-80 cursor-pointer ml-1"
                            title="Bỏ lọc đối tác"
                        >
                            ✕
                        </button>
                    </span>
                </div>
                <p class="text-xs sm:text-sm text-base-content/60 mt-0.5">
                    Quản lý đối soát doanh thu, hoa hồng nền tảng và hiệu suất giữa các chuỗi rạp hợp tác
                </p>
            </div>

            <div class="flex flex-wrap items-center gap-3">
                <select
                    :value="selectedBrandId"
                    @change="handleBrandChange($event.target.value)"
                    class="select font-semibold text-base-content focus:outline-hidden cursor-pointer rounded-xl min-w-48"
                >
                    <option value="">Tất cả đối tác rạp ({{ partnerBrands.length }})</option>
                    <option
                        v-for="brand in partnerBrands"
                        :key="brand.brand_id"
                        :value="String(brand.brand_id)"
                    >
                        {{ brand.brand_name }} ({{ brand.cinemas_count }} rạp)
                    </option>
                </select>

                <select
                    :value="selectedPeriod"
                    @change="handlePeriodChange($event.target.value)"
                    class="select font-semibold text-base-content focus:outline-hidden cursor-pointer rounded-xl"
                >
                    <option value="today">Hôm nay</option>
                    <option value="7d">7 ngày qua</option>
                    <option value="30d">30 ngày qua</option>
                    <option value="6m">6 tháng qua</option>
                    <option value="all">Tất cả thời gian</option>
                </select>
            </div>
        </div>

        <DashboardKpiCards
            :is-loading="isLoading"
            :summary="summary"
            :format-currency="formatCurrency"
            :format-number="formatNumber"
        />

        <PartnerBrandsTable
            :is-loading="isLoading"
            :partner-brands="partnerBrands"
            :selected-brand-id="selectedBrandId"
            :format-currency="formatCurrency"
            :format-number="formatNumber"
            @select-brand="handleBrandChange"
        />

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div class="lg:col-span-7 flex flex-col">
                <SalesOverviewChart
                    :is-loading="isLoading"
                    :trend-data="revenueTrend"
                    :period="selectedPeriod"
                />
            </div>

            <div class="lg:col-span-5 flex flex-col">
                <OrderStatusDonutChart
                    :is-loading="isLoading"
                    :orders-summary="summary.orders"
                    :format-number="formatNumber"
                />
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div class="lg:col-span-7 flex flex-col">
                <RecentOrdersTable
                    :is-loading="isLoading"
                    :bookings="recentBookings"
                    :format-currency="formatCurrency"
                />
            </div>

            <div class="lg:col-span-5 flex flex-col">
                <TopProductsList
                    :is-loading="isLoading"
                    :top-movies="topMovies"
                    :format-number="formatNumber"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useDashboard } from "@/composables/admin/useDashboard";
import DashboardKpiCards from "@/components/features/admin/dashboard/DashboardKpiCards.vue";
import PartnerBrandsTable from "@/components/features/admin/dashboard/PartnerBrandsTable.vue";
import SalesOverviewChart from "@/components/features/admin/dashboard/SalesOverviewChart.vue";
import OrderStatusDonutChart from "@/components/features/admin/dashboard/OrderStatusDonutChart.vue";
import RecentOrdersTable from "@/components/features/admin/dashboard/RecentOrdersTable.vue";
import TopProductsList from "@/components/features/admin/dashboard/TopProductsList.vue";

const {
    isLoading,
    selectedPeriod,
    selectedBrandId,
    summary,
    revenueTrend,
    topMovies,
    recentBookings,
    partnerBrands,
    fetchOverview,
    formatCurrency,
    formatNumber,
} = useDashboard();

const selectedBrandName = computed(() => {
    if (!selectedBrandId.value) return "";
    const found = partnerBrands.value.find(
        (b) => String(b.brand_id) === String(selectedBrandId.value),
    );
    return found ? found.brand_name : "";
});

const handlePeriodChange = (newPeriod) => {
    fetchOverview(newPeriod, selectedBrandId.value);
};

const handleBrandChange = (newBrandId) => {
    fetchOverview(selectedPeriod.value, newBrandId);
};

onMounted(() => {
    fetchOverview("all", "");
});
</script>

<template>
    <div
        class="bg-base-100 rounded-2xl p-5 sm:p-6 border border-base-300 shadow-xs h-full flex flex-col justify-between"
    >
        <div class="flex items-center justify-between mb-4">
            <div>
                <h3 class="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Tổng quan doanh thu
                </h3>
                <p class="text-xs text-base-content/50 mt-0.5">
                    Biến động doanh thu theo mốc thời gian
                </p>
            </div>

            <div
                class="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0"
            >
                <BaseIcon name="chart-bar" size="20" />
            </div>
        </div>

        <div class="w-full min-h-[280px] grow flex items-center justify-center">
            <div
                v-if="isLoading"
                class="w-full h-[280px] flex flex-col justify-end gap-3 px-2 sm:px-4 py-4 animate-pulse"
            >
                <div class="flex items-end justify-between h-48 gap-3 sm:gap-6 px-2">
                    <div class="skeleton flex-1 h-20 rounded-t-lg"></div>
                    <div class="skeleton flex-1 h-32 rounded-t-lg"></div>
                    <div class="skeleton flex-1 h-24 rounded-t-lg"></div>
                    <div class="skeleton flex-1 h-44 rounded-t-lg"></div>
                    <div class="skeleton flex-1 h-36 rounded-t-lg"></div>
                    <div class="skeleton flex-1 h-48 rounded-t-lg"></div>
                </div>
                <div class="flex justify-between pt-2 border-t border-base-200 px-2">
                    <div v-for="i in 6" :key="i" class="skeleton h-3 w-8 sm:w-12 rounded-md"></div>
                </div>
            </div>

            <apexchart
                v-else-if="chartSeries[0]?.data?.length"
                type="area"
                height="290"
                width="100%"
                :options="chartOptions"
                :series="chartSeries"
            />
            <div v-else class="flex flex-col items-center justify-center text-slate-400 py-10">
                <p class="text-xs">Không có dữ liệu biểu đồ</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";
import BaseIcon from "@/components/common/BaseIcon.vue";

const props = defineProps({
    isLoading: {
        type: Boolean,
        default: false,
    },
    trendData: {
        type: Array,
        default: () => [],
    },
    period: {
        type: String,
        default: "all",
    },
});

const defaultMonths = ["Thg 5", "Thg 6", "Thg 7", "Thg 8", "Thg 9", "Thg 10"];
const defaultValues = [1200000, 2400000, 3100000, 4800000, 6200000, 8380000];

const categories = computed(() => {
    if (props.trendData && props.trendData.length > 0) {
        return props.trendData.map((item) => {
            const raw = item.date || item.date_label || "";
            if (raw.includes("-")) {
                const parts = raw.split("-");
                if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
                if (parts.length === 2) return `Thg ${parts[1]}`;
            }
            return raw;
        });
    }
    return defaultMonths;
});

const seriesData = computed(() => {
    if (props.trendData && props.trendData.length > 0) {
        return props.trendData.map((item) => Number(item.total_revenue || 0));
    }
    return defaultValues;
});

const chartSeries = computed(() => [
    {
        name: "Doanh thu",
        data: seriesData.value,
    },
]);

const chartOptions = computed(() => ({
    chart: {
        type: "area",
        toolbar: { show: false },
        zoom: { enabled: false },
        fontFamily: "inherit",
        animations: {
            enabled: true,
            easing: "easeinout",
            speed: 600,
        },
    },
    colors: ["#2563EB"],
    stroke: {
        curve: "smooth",
        width: 3,
    },
    fill: {
        type: "gradient",
        gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.35,
            opacityTo: 0.03,
            stops: [0, 90, 100],
            colorStops: [
                {
                    offset: 0,
                    color: "#3B82F6",
                    opacity: 0.4,
                },
                {
                    offset: 100,
                    color: "#93C5FD",
                    opacity: 0.02,
                },
            ],
        },
    },
    markers: {
        size: 5,
        colors: ["#2563EB"],
        strokeColors: "#FFFFFF",
        strokeWidth: 2,
        hover: {
            size: 7,
            sizeOffset: 2,
        },
    },
    grid: {
        borderColor: "#F1F5F9",
        strokeDashArray: 4,
        xaxis: {
            lines: { show: false },
        },
        yaxis: {
            lines: { show: true },
        },
        padding: {
            top: 10,
            right: 15,
            bottom: 0,
            left: 10,
        },
    },
    xaxis: {
        categories: categories.value,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
            style: {
                colors: "#64748B",
                fontSize: "12px",
                fontWeight: 500,
            },
        },
    },
    yaxis: {
        labels: {
            style: {
                colors: "#64748B",
                fontSize: "11px",
                fontWeight: 500,
            },
            formatter: (val) => {
                if (val >= 1000000) return (val / 1000000).toFixed(1) + "M";
                if (val >= 1000) return (val / 1000).toFixed(0) + "K";
                return val;
            },
        },
    },
    tooltip: {
        theme: "light",
        x: { show: true },
        y: {
            formatter: (val) =>
                new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                    maximumFractionDigits: 0,
                }).format(val),
        },
    },
    dataLabels: {
        enabled: false,
    },
}));
</script>

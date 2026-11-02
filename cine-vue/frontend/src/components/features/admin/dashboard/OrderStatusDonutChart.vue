<template>
    <div
        class="bg-base-100 rounded-2xl p-5 sm:p-6 border border-base-300 shadow-xs h-full flex flex-col justify-between"
    >
        <div class="flex items-center justify-between mb-2">
            <h3 class="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Trạng thái đơn hàng
            </h3>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 grow py-2">
            <div class="relative flex items-center justify-center shrink-0 w-full sm:w-auto">
                <div
                    v-if="isLoading"
                    class="relative w-44 h-44 rounded-full skeleton flex items-center justify-center shrink-0 my-3"
                >
                    <div class="w-28 h-28 rounded-full bg-base-100"></div>
                </div>
                <apexchart
                    v-else
                    type="donut"
                    width="230"
                    height="230"
                    :options="chartOptions"
                    :series="chartSeries"
                />

                <div
                    class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                >
                    <span
                        v-if="isLoading"
                        class="skeleton block h-7 w-12 rounded-md mb-1"
                    ></span>
                    <span
                        v-else
                        class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight"
                    >
                        {{ totalOrdersFormatted }}
                    </span>
                    <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Đơn hàng
                    </span>
                </div>
            </div>

            <div class="w-full sm:w-auto flex flex-col gap-3 sm:pr-2">
                <div
                    v-for="item in statusItems"
                    :key="item.key"
                    class="flex items-center justify-between sm:justify-start gap-4 text-xs sm:text-sm"
                >
                    <div class="flex items-center gap-2.5">
                        <span
                            class="w-3 h-3 rounded-full shrink-0"
                            :style="{ backgroundColor: item.color }"
                        ></span>
                        <span class="font-medium text-slate-700">{{ item.label }}</span>
                    </div>
                    <span
                        v-if="isLoading"
                        class="skeleton block h-4 w-12 rounded-md ml-auto sm:ml-6"
                    ></span>
                    <span v-else class="font-bold text-slate-800 ml-auto sm:ml-6">
                        {{ item.percentage }}%
                        <span class="text-xs font-normal text-slate-400">({{ item.count }})</span>
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
    isLoading: {
        type: Boolean,
        default: false,
    },
    ordersSummary: {
        type: Object,
        default: () => ({}),
    },
    formatNumber: {
        type: Function,
        default: (val) => val,
    },
});

const totalOrders = computed(() => {
    return Number(props.ordersSummary?.total ?? 0);
});

const totalOrdersFormatted = computed(() => {
    return props.formatNumber(totalOrders.value);
});

const toPercentage = (count, total) => {
    if (!total || total <= 0) return 0;
    return Number(((count / total) * 100).toFixed(1));
};

const statusItems = computed(() => {
    const ord = props.ordersSummary || {};
    const total = Number(ord.total || 0);

    const confirmedCount =
        ord.confirmed !== undefined
            ? Number(ord.confirmed || 0)
            : Number(ord.successful || 0);
    const completedCount = Number(ord.completed || 0);
    const pendingCount = Number(ord.pending || 0);
    const cancelledCount = Number(ord.cancelled || 0);

    return [
        {
            key: "confirmed",
            label: "Đã xác nhận",
            count: confirmedCount,
            percentage: toPercentage(confirmedCount, total),
            color: "#22C55E",
        },
        {
            key: "completed",
            label: "Đã hoàn thành",
            count: completedCount,
            percentage: toPercentage(completedCount, total),
            color: "#3B82F6",
        },
        {
            key: "pending",
            label: "Chờ thanh toán",
            count: pendingCount,
            percentage: toPercentage(pendingCount, total),
            color: "#F59E0B",
        },
        {
            key: "cancelled",
            label: "Đã huỷ",
            count: cancelledCount,
            percentage: toPercentage(cancelledCount, total),
            color: "#F43F5E",
        },
    ];
});

const hasData = computed(() => totalOrders.value > 0);

const chartSeries = computed(() =>
    hasData.value ? statusItems.value.map((i) => i.count) : [1],
);

const chartColors = computed(() =>
    hasData.value ? statusItems.value.map((i) => i.color) : ["#E2E8F0"],
);

const chartLabels = computed(() =>
    hasData.value ? statusItems.value.map((i) => i.label) : ["Chưa có đơn hàng"],
);

const chartOptions = computed(() => ({
    chart: {
        type: "donut",
        fontFamily: "inherit",
        animations: {
            enabled: true,
            easing: "easeinout",
            speed: 600,
        },
    },
    colors: chartColors.value,
    labels: chartLabels.value,
    stroke: {
        width: 2,
        colors: ["#FFFFFF"],
    },
    plotOptions: {
        pie: {
            donut: {
                size: "72%",
                labels: {
                    show: false,
                },
            },
        },
    },
    legend: {
        show: false,
    },
    dataLabels: {
        enabled: false,
    },
    tooltip: {
        enabled: hasData.value,
        y: {
            formatter: (val, { seriesIndex }) => {
                const item = statusItems.value[seriesIndex];
                if (!item) return `${val}`;
                return `${item.count} đơn (${item.percentage}%)`;
            },
        },
    },
}));
</script>

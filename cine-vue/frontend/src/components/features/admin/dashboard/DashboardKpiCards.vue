<template>
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <div
            class="bg-base-100 rounded-2xl p-5 border border-base-300 shadow-xs hover:shadow-md transition-all duration-200 group"
        >
            <div class="flex items-center justify-between">
                <p class="text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                    Tổng giao dịch (GMV)
                </p>
                <div v-if="isLoading" class="skeleton h-4 w-12 rounded-md"></div>
                <div
                    v-else
                    class="flex items-center gap-1 mt-1 text-xs font-semibold"
                    :class="revenueGrowthBadge.colorClass"
                >
                    <BaseIcon :name="revenueGrowthBadge.icon" size="14" />
                    <span>{{ revenueGrowthBadge.formatted }}</span>
                </div>
            </div>
            <div class="flex items-center justify-between mt-4">
                <div>
                    <h3 class="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 tracking-tight">
                        <span
                            v-if="isLoading"
                            class="skeleton block h-7 sm:h-8 w-32 rounded-lg"
                        ></span>
                        <span v-else>{{ formattedRevenue }}</span>
                    </h3>
                    <p class="text-[11px] text-slate-400 mt-1">
                        Trả đối tác:
                        <span v-if="isLoading" class="skeleton inline-block h-3 w-16 rounded"></span>
                        <span v-else class="font-semibold text-slate-600">{{
                            formattedPartnerPayout
                        }}</span>
                    </p>
                </div>
                <div
                    class="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
                >
                    <BaseIcon name="chart-bar" size="26" />
                </div>
            </div>
        </div>

        <div
            class="bg-base-100 rounded-2xl p-5 border border-base-300 shadow-xs hover:shadow-md transition-all duration-200 group"
        >
            <div class="flex items-center justify-between">
                <p class="text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                    Hoa hồng nền tảng
                </p>
                <div v-if="isLoading" class="skeleton h-4 w-14 rounded-md"></div>
                <span
                    v-else
                    class="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/60"
                >
                    Phí sàn ~{{ commissionRate }}%
                </span>
            </div>
            <div class="flex items-center justify-between mt-4">
                <div>
                    <h3 class="text-xl sm:text-2xl font-bold text-emerald-600 mt-0.5 tracking-tight">
                        <span
                            v-if="isLoading"
                            class="skeleton block h-7 sm:h-8 w-28 rounded-lg"
                        ></span>
                        <span v-else>{{ formattedCommission }}</span>
                    </h3>
                    <p class="text-[11px] text-slate-400 mt-1">
                        Từ
                        <span v-if="isLoading" class="skeleton inline-block h-3 w-8 rounded"></span>
                        <span v-else class="font-semibold text-slate-600">
                            {{ activePartnersText }}
                        </span>
                    </p>
                </div>
                <div
                    class="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
                >
                    <BaseIcon name="revenue" size="26" />
                </div>
            </div>
        </div>

        <div
            class="bg-base-100 rounded-2xl p-5 border border-base-300 shadow-xs hover:shadow-md transition-all duration-200 group"
        >
            <div class="flex items-center justify-between">
                <p class="text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                    Tổng đơn đặt vé
                </p>
                <div v-if="isLoading" class="skeleton h-4 w-12 rounded-md"></div>
                <div
                    v-else
                    class="flex items-center gap-1 mt-1 text-xs font-semibold"
                    :class="ordersGrowthBadge.colorClass"
                >
                    <BaseIcon :name="ordersGrowthBadge.icon" size="14" />
                    <span>{{ ordersGrowthBadge.formatted }}</span>
                </div>
            </div>
            <div class="flex items-center justify-between mt-4">
                <div>
                    <h3 class="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 tracking-tight">
                        <span
                            v-if="isLoading"
                            class="skeleton block h-7 sm:h-8 w-20 rounded-lg"
                        ></span>
                        <span v-else>{{ formattedOrders }}</span>
                    </h3>
                    <p class="text-[11px] text-slate-400 mt-1">
                        Tỷ lệ thành công:
                        <span v-if="isLoading" class="skeleton inline-block h-3 w-8 rounded"></span>
                        <span v-else class="font-semibold text-slate-600">{{ successRate }}%</span>
                    </p>
                </div>
                <div
                    class="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
                >
                    <BaseIcon name="cart" size="26" />
                </div>
            </div>
        </div>

        <div
            class="bg-base-100 rounded-2xl p-5 border border-base-300 shadow-xs hover:shadow-md transition-all duration-200 group"
        >
            <div class="flex items-center justify-between">
                <p class="text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                    Tổng vé đã bán
                </p>
                <div v-if="isLoading" class="skeleton h-4 w-12 rounded-md"></div>
                <div
                    v-else
                    class="flex items-center gap-1 mt-1 text-xs font-semibold"
                    :class="ticketsGrowthBadge.colorClass"
                >
                    <BaseIcon :name="ticketsGrowthBadge.icon" size="14" />
                    <span>{{ ticketsGrowthBadge.formatted }}</span>
                </div>
            </div>
            <div class="flex items-center justify-between mt-4">
                <div>
                    <h3 class="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 tracking-tight">
                        <span
                            v-if="isLoading"
                            class="skeleton block h-7 sm:h-8 w-20 rounded-lg"
                        ></span>
                        <span v-else>{{ formattedProducts }}</span>
                    </h3>
                    <p class="text-[11px] text-slate-400 mt-1">
                        Tỷ lệ lấp đầy:
                        <span v-if="isLoading" class="skeleton inline-block h-3 w-8 rounded"></span>
                        <span v-else class="font-semibold text-slate-600">{{ occupancyRate }}%</span>
                    </p>
                </div>
                <div
                    class="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
                >
                    <BaseIcon name="box" size="26" />
                </div>
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
    summary: {
        type: Object,
        default: () => ({}),
    },
    formatCurrency: {
        type: Function,
        default: (val) => val,
    },
    formatNumber: {
        type: Function,
        default: (val) => val,
    },
});

const getGrowthInfo = (growthValue) => {
    const val = Number(growthValue || 0);
    if (val > 0) {
        return {
            formatted: `+${val}%`,
            icon: "trend-up",
            colorClass: "text-emerald-600",
        };
    }
    if (val < 0) {
        return {
            formatted: `${val}%`,
            icon: "trend-down",
            colorClass: "text-rose-500",
        };
    }
    return {
        formatted: "0%",
        icon: "trend-up",
        colorClass: "text-slate-400",
    };
};

const formattedRevenue = computed(() => {
    const rev = props.summary?.revenue?.total;
    return props.formatCurrency(rev ?? 0);
});

const formattedCommission = computed(() => {
    const comm = props.summary?.revenue?.platform_commission;
    return props.formatCurrency(comm ?? 0);
});

const formattedPartnerPayout = computed(() => {
    const payout = props.summary?.revenue?.partner_payout;
    return props.formatCurrency(payout ?? 0);
});

const commissionRate = computed(() => {
    return props.summary?.revenue?.commission_rate ?? 8;
});

const activePartnersText = computed(() => {
    const brands = props.summary?.partners?.active_brands ?? 5;
    const cinemas = props.summary?.partners?.total_cinemas ?? 8;
    return `${brands} chuỗi (${cinemas} rạp)`;
});

const revenueGrowth = computed(() => {
    return Number(props.summary?.revenue?.growth_percentage ?? 0);
});
const revenueGrowthBadge = computed(() => getGrowthInfo(revenueGrowth.value));

const formattedOrders = computed(() => {
    const ord = props.summary?.orders?.total;
    return props.formatNumber(ord ?? 0);
});

const successRate = computed(() => {
    return props.summary?.orders?.success_rate ?? 0;
});

const ordersGrowth = computed(() => {
    return Number(props.summary?.orders?.growth_percentage ?? 0);
});
const ordersGrowthBadge = computed(() => getGrowthInfo(ordersGrowth.value));

const formattedProducts = computed(() => {
    const total = props.summary?.tickets?.total;
    return props.formatNumber(total ?? 0);
});

const occupancyRate = computed(() => {
    return props.summary?.occupancy?.rate ?? 0;
});

const ticketsGrowth = computed(() => {
    return Number(props.summary?.tickets?.growth_percentage ?? 0);
});
const ticketsGrowthBadge = computed(() => getGrowthInfo(ticketsGrowth.value));
</script>

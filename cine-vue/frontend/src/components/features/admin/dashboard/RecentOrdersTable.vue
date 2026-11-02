<template>
    <div
        class="bg-base-100 rounded-2xl p-5 sm:p-6 border border-base-300 shadow-xs h-full flex flex-col justify-between"
    >
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Giao dịch gần đây
            </h3>

            <button
                type="button"
                class="text-xs font-semibold text-blue-600 border border-blue-200/90 rounded-lg px-3 py-1 hover:bg-blue-50/80 transition-colors cursor-pointer"
            >
                Xem tất cả
            </button>
        </div>

        <div class="overflow-x-auto grow">
            <table class="w-full text-left text-xs sm:text-sm">
                <thead>
                    <tr class="text-slate-400 font-medium border-b border-slate-100 pb-2">
                        <th class="py-2.5 font-medium">Mã đơn</th>
                        <th class="py-2.5 font-medium">Khách hàng</th>
                        <th class="py-2.5 font-medium">Phim / Vé</th>
                        <th class="py-2.5 font-medium text-center">Trạng thái</th>
                        <th class="py-2.5 font-medium text-right">Tổng tiền</th>
                    </tr>
                </thead>
                <tbody v-if="isLoading" class="divide-y divide-base-200 animate-pulse">
                    <tr v-for="i in 5" :key="i">
                        <td class="py-3.5"><div class="skeleton h-4 w-16 rounded-md"></div></td>
                        <td class="py-3.5"><div class="skeleton h-4 w-24 rounded-md"></div></td>
                        <td class="py-3.5"><div class="skeleton h-4 w-32 rounded-md"></div></td>
                        <td class="py-3.5 text-center"><div class="skeleton h-5 w-20 rounded-md mx-auto"></div></td>
                        <td class="py-3.5 text-right"><div class="skeleton h-4 w-20 rounded-md ml-auto"></div></td>
                    </tr>
                </tbody>

                <tbody v-else-if="displayedOrders.length > 0" class="divide-y divide-slate-50">
                    <tr
                        v-for="order in displayedOrders"
                        :key="order.id"
                        class="hover:bg-slate-50/70 transition-colors"
                    >
                        <td
                            class="py-3 font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                        >
                            {{ order.displayId }}
                        </td>

                        <td class="py-3 font-medium text-slate-800 whitespace-nowrap">
                            {{ order.customerName }}
                        </td>

                        <td
                            class="py-3 text-slate-600 max-w-[150px] sm:max-w-[210px]"
                            :title="order.productName"
                        >
                            <p class="truncate font-medium text-slate-800">
                                {{ order.productName }}
                            </p>
                            <p
                                v-if="order.cinemaInfo"
                                class="truncate text-[11px] text-slate-400 mt-0.5"
                            >
                                {{ order.cinemaInfo }}
                            </p>
                        </td>

                        <td class="py-3 text-center">
                            <span
                                class="inline-block px-2.5 py-0.5 rounded-md text-[11px] sm:text-xs font-semibold tracking-wide"
                                :class="getStatusBadgeClass(order.status)"
                            >
                                {{ formatStatus(order.status) }}
                            </span>
                        </td>

                        <td class="py-3 text-right font-semibold text-slate-900 whitespace-nowrap">
                            {{ order.formattedAmount }}
                        </td>
                    </tr>
                </tbody>

                <tbody v-else class="divide-y divide-base-200">
                    <tr>
                        <td colspan="5" class="py-10 text-center text-xs text-base-content/50">
                            Không có giao dịch nào trong khoảng thời gian này
                        </td>
                    </tr>
                </tbody>
            </table>
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
    bookings: {
        type: Array,
        default: () => [],
    },
    formatCurrency: {
        type: Function,
        default: (val) => val,
    },
});

const fallbackOrders = [
    {
        id: 1,
        displayId: "#BK-1001",
        customerName: "Nguyễn Văn An",
        productName: "Lật Mặt 9: Vòng Xoáy",
        status: "confirmed",
        formattedAmount: "655.000 ₫",
    },
    {
        id: 2,
        displayId: "#BK-1002",
        customerName: "Trần Thị Mai",
        productName: "Mission: Impossible",
        status: "processing",
        formattedAmount: "645.000 ₫",
    },
    {
        id: 3,
        displayId: "#BK-1003",
        customerName: "Lê Hoàng Long",
        productName: "Doraemon: Bản Giao Hưởng",
        status: "confirmed",
        formattedAmount: "2.660.000 ₫",
    },
    {
        id: 4,
        displayId: "#BK-1004",
        customerName: "Phạm Minh Đức",
        productName: "Shin Cậu Bé Bút Chì",
        status: "confirmed",
        formattedAmount: "220.000 ₫",
    },
    {
        id: 5,
        displayId: "#BK-1005",
        customerName: "Đỗ Bích Thảo",
        productName: "Doraemon: Bản Giao Hưởng",
        status: "cancelled",
        formattedAmount: "440.000 ₫",
    },
];

const displayedOrders = computed(() => {
    if (props.bookings && props.bookings.length > 0) {
        return props.bookings.slice(0, 5).map((b, idx) => {
            const code = b.booking_code || `BK-${b.booking_id || 1000 + idx}`;
            const seatInfo = b.seats_text ? ` (${b.seats_text})` : "";
            const cinemaParts = [b.brand_name, b.cinema_name].filter(Boolean);
            return {
                id: b.booking_id || idx,
                displayId: `#${code}`,
                customerName: b.customer_name || b.customer_email || "Khách đặt vé",
                productName: (b.movie_title || "Vé xem phim") + seatInfo,
                cinemaInfo: cinemaParts.join(" • "),
                status: b.status || "confirmed",
                formattedAmount: props.formatCurrency(b.final_amount),
            };
        });
    }
    if (props.bookings === null || props.bookings === undefined) {
        return fallbackOrders;
    }
    return [];
});

const formatStatus = (status) => {
    const s = String(status).toLowerCase();
    if (s === "confirmed") return "Đã xác nhận";
    if (s === "completed" || s === "delivered") return "Đã hoàn thành";
    if (s === "pending") return "Chờ thanh toán";
    if (s === "cancelled" || s === "failed") return "Đã huỷ";
    return status;
};

const getStatusBadgeClass = (status) => {
    const s = String(status).toLowerCase();
    if (s === "confirmed") {
        return "bg-emerald-50 text-emerald-600 border border-emerald-200/50";
    }
    if (s === "completed" || s === "delivered") {
        return "bg-blue-50 text-blue-600 border border-blue-200/50";
    }
    if (s === "pending") {
        return "bg-amber-50 text-amber-600 border border-amber-200/50";
    }
    if (s === "cancelled" || s === "failed") {
        return "bg-rose-50 text-rose-600 border border-rose-200/50";
    }
    return "bg-slate-50 text-slate-600 border border-slate-200/50";
};
</script>

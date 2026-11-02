<template>
    <div
        class="bg-base-100 rounded-2xl p-5 sm:p-6 border border-base-300 shadow-xs flex flex-col justify-between"
    >
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
                <div class="flex items-center gap-2">
                    <h3 class="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                        Đối soát & Hiệu suất Rạp Hợp tác
                    </h3>
                    <span
                        class="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-blue-50 text-blue-600 border border-blue-200/60"
                    >
                        {{ partnerBrands.length }} Thương hiệu
                    </span>
                </div>
                <p class="text-xs text-base-content/60 mt-0.5">
                    Bấm vào một thương hiệu rạp để lọc toàn bộ số liệu Dashboard theo đối tác đó
                </p>
            </div>

            <button
                v-if="selectedBrandId"
                type="button"
                @click="$emit('select-brand', '')"
                class="self-start sm:self-auto text-xs font-semibold text-blue-600 border border-blue-200/90 rounded-lg px-3 py-1.5 hover:bg-blue-50/80 transition-colors cursor-pointer"
            >
                Xem toàn bộ đối tác
            </button>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs sm:text-sm">
                <thead>
                    <tr class="text-slate-400 font-medium border-b border-slate-100">
                        <th class="py-3 font-medium">Thương hiệu Đối tác</th>
                        <th class="py-3 font-medium text-center">Quy mô hợp tác</th>
                        <th class="py-3 font-medium text-center">Trạng thái</th>
                        <th class="py-3 font-medium text-right">Đơn / Vé đã bán</th>
                        <th class="py-3 font-medium text-right">Tổng giao dịch (GMV)</th>
                        <th class="py-3 font-medium text-right">Hoa hồng Sàn</th>
                        <th class="py-3 font-medium text-right">Thực trả Đối tác</th>
                        <th class="py-3 font-medium text-right w-36">Tỷ trọng GMV</th>
                    </tr>
                </thead>

                <tbody v-if="isLoading" class="divide-y divide-slate-50">
                    <tr v-for="i in 5" :key="i">
                        <td class="py-3.5">
                            <div class="flex items-center gap-3">
                                <div class="skeleton w-9 h-9 rounded-lg shrink-0"></div>
                                <div class="skeleton h-4 w-28 rounded-md"></div>
                            </div>
                        </td>
                        <td class="py-3.5 text-center">
                            <div class="skeleton h-4 w-20 rounded-md mx-auto"></div>
                        </td>
                        <td class="py-3.5 text-center">
                            <div class="skeleton h-5 w-20 rounded-md mx-auto"></div>
                        </td>
                        <td class="py-3.5 text-right">
                            <div class="skeleton h-4 w-16 rounded-md ml-auto"></div>
                        </td>
                        <td class="py-3.5 text-right">
                            <div class="skeleton h-4 w-24 rounded-md ml-auto"></div>
                        </td>
                        <td class="py-3.5 text-right">
                            <div class="skeleton h-4 w-20 rounded-md ml-auto"></div>
                        </td>
                        <td class="py-3.5 text-right">
                            <div class="skeleton h-4 w-24 rounded-md ml-auto"></div>
                        </td>
                        <td class="py-3.5 text-right">
                            <div class="skeleton h-3 w-28 rounded-full ml-auto"></div>
                        </td>
                    </tr>
                </tbody>

                <tbody v-else-if="partnerBrands.length > 0" class="divide-y divide-slate-100/80">
                    <tr
                        v-for="brand in partnerBrands"
                        :key="brand.brand_id"
                        @click="toggleBrandFilter(brand.brand_id)"
                        class="transition-colors cursor-pointer"
                        :class="
                            String(selectedBrandId) === String(brand.brand_id)
                                ? 'bg-blue-50/70 hover:bg-blue-50'
                                : 'hover:bg-slate-50/80'
                        "
                    >
                        <td class="py-3.5 pr-3">
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center overflow-hidden shrink-0 font-bold text-xs text-slate-700"
                                >
                                    <img
                                        v-if="brand.logo_url"
                                        :src="brand.logo_url"
                                        :alt="brand.brand_name"
                                        class="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                    <span v-else>{{ brand.brand_name.slice(0, 3) }}</span>
                                </div>
                                <div>
                                    <p class="font-bold text-slate-900 flex items-center gap-1.5">
                                        {{ brand.brand_name }}
                                        <span
                                            v-if="String(selectedBrandId) === String(brand.brand_id)"
                                            class="inline-block w-2 h-2 rounded-full bg-blue-600"
                                            title="Đang lọc theo đối tác này"
                                        ></span>
                                    </p>
                                    <p class="text-[11px] text-slate-400">
                                        Mã đối tác: #BR-{{ brand.brand_id }}
                                    </p>
                                </div>
                            </div>
                        </td>

                        <td class="py-3.5 text-center whitespace-nowrap">
                            <span class="font-semibold text-slate-800">
                                {{ brand.cinemas_count }} cụm rạp
                            </span>
                            <span class="text-xs text-slate-400 block">
                                {{ brand.rooms_count }} phòng chiếu
                            </span>
                        </td>

                        <td class="py-3.5 text-center whitespace-nowrap">
                            <span
                                class="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold"
                                :class="
                                    brand.status === 'active'
                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/50'
                                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                                "
                            >
                                {{ brand.status === "active" ? "Đang hợp tác" : "Tạm ngưng" }}
                            </span>
                        </td>

                        <td class="py-3.5 text-right whitespace-nowrap">
                            <span class="font-semibold text-slate-800">
                                {{ formatNumber(brand.successful_orders) }} đơn
                            </span>
                            <span class="text-xs text-slate-400 block">
                                {{ formatNumber(brand.tickets_sold) }} vé
                            </span>
                        </td>

                        <td class="py-3.5 text-right font-bold text-slate-900 whitespace-nowrap">
                            {{ formatCurrency(brand.gross_revenue) }}
                        </td>

                        <td class="py-3.5 text-right whitespace-nowrap">
                            <span class="font-bold text-emerald-600">
                                +{{ formatCurrency(brand.platform_commission) }}
                            </span>
                            <span class="text-[11px] text-slate-400 block">
                                Chiết khấu {{ brand.commission_rate }}%
                            </span>
                        </td>

                        <td class="py-3.5 text-right font-semibold text-blue-600 whitespace-nowrap">
                            {{ formatCurrency(brand.partner_payout) }}
                        </td>

                        <td class="py-3.5 pl-4 text-right whitespace-nowrap">
                            <div class="flex items-center justify-end gap-2">
                                <div class="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div
                                        class="h-full rounded-full bg-blue-600 transition-all duration-500"
                                        :style="{ width: `${Math.max(brand.revenue_share, 4)}%` }"
                                    ></div>
                                </div>
                                <span class="text-xs font-bold text-slate-700 w-10 text-right">
                                    {{ brand.revenue_share }}%
                                </span>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    isLoading: {
        type: Boolean,
        default: false,
    },
    partnerBrands: {
        type: Array,
        default: () => [],
    },
    selectedBrandId: {
        type: [String, Number],
        default: "",
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

const emit = defineEmits(["select-brand"]);

const toggleBrandFilter = (brandId) => {
    if (String(props.selectedBrandId) === String(brandId)) {
        emit("select-brand", "");
    } else {
        emit("select-brand", String(brandId));
    }
};
</script>

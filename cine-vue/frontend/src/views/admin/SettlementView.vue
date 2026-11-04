<template>
    <div class="space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="p-5 rounded-lg bg-base-100 border border-neutral-200 shadow-xs">
                <span class="text-xs text-neutral-500 font-medium"
                    >Tổng Tiền Quyết Toán Chuyển Về Rạp Kỳ Này</span
                >
                <div class="text-2xl font-black text-black mt-1 font-mono">
                    {{ (totalPayableAll / 1000000000).toFixed(2) }}
                    <span class="text-sm font-normal text-neutral-500">tỷ ₫</span>
                </div>
                <p class="text-[11px] text-neutral-500 mt-2 font-mono">
                    Dự kiến chi trả trước ngày 07/11/2026
                </p>
            </div>

            <div class="p-5 rounded-lg bg-base-100 border border-neutral-200 shadow-xs">
                <span class="text-xs text-neutral-500 font-medium"
                    >Doanh Thu Hoa Hồng Đại Lý CineHub Thu Về</span
                >
                <div class="text-2xl font-black text-black mt-1 font-mono">
                    {{ (totalCommissionAll / 1000000).toFixed(1) }}
                    <span class="text-sm font-normal text-neutral-500">triệu ₫</span>
                </div>
                <p class="text-[11px] text-neutral-500 mt-2 font-mono">
                    Tỷ lệ hoa hồng thực thu đạt 5.12% GMV
                </p>
            </div>

            <div class="p-5 rounded-lg bg-base-100 border border-neutral-200 shadow-xs">
                <span class="text-xs text-neutral-500 font-medium"
                    >Tình Trạng Đối Soát Lệch Dữ Liệu</span
                >
                <div class="text-2xl font-black text-black mt-1 font-mono flex items-center gap-2">
                    <span>4 / 253.350</span>
                    <span class="text-xs font-normal text-neutral-500">giao dịch</span>
                </div>
                <p class="text-[11px] text-neutral-500 mt-2 font-mono">
                    Tỷ lệ chính xác đối soát tự động đạt 99.998%
                </p>
            </div>
        </div>

        <div class="p-5 rounded-lg bg-base-100 border border-neutral-200 shadow-xs space-y-4">
            <div
                class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200"
            >
                <div>
                    <h3 class="text-sm font-extrabold text-black">
                        Bảng Quyết Toán & Đối Soát Doanh Số Chuỗi Rạp
                    </h3>
                    <p class="text-xs text-neutral-500">
                        Đối chiếu doanh thu bán vé, trừ chiết khấu đồng tài trợ và xuất biên bản kế
                        toán
                    </p>
                </div>

                <div class="flex items-center gap-2">
                    <button
                        @click="handleExportCsv"
                        class="px-3.5 py-2 rounded bg-neutral-100 hover:bg-neutral-200 text-black text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-300"
                    >
                        <BaseIcon name="file-spreadsheet" size="14" class="text-black" />
                        <span>{{
                            downloadSuccess ? "Đã tải file Excel đối soát" : "Xuất File Excel/CSV"
                        }}</span>
                    </button>
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs text-neutral-800">
                    <thead
                        class="text-[11px] uppercase tracking-wider text-neutral-500 bg-neutral-50 border-b border-neutral-200"
                    >
                        <tr>
                            <th class="py-3 px-4 font-bold">Chuỗi Rạp & Kỳ Đối Soát</th>
                            <th class="py-3 px-3 font-bold text-right">Số Lượng Vé</th>
                            <th class="py-3 px-3 font-bold text-right">Tổng GMV</th>
                            <th class="py-3 px-3 font-bold text-right">Hoa Hồng CineHub</th>
                            <th class="py-3 px-3 font-bold text-right">Giảm Giá Đồng Tài Trợ</th>
                            <th class="py-3 px-3 font-bold text-right">Thực Chuyển Cho Rạp</th>
                            <th class="py-3 px-3 font-bold text-center">Lệch API</th>
                            <th class="py-3 px-3 font-bold">Trạng Thái</th>
                            <th class="py-3 px-4 font-bold text-right">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-neutral-200">
                        <tr
                            v-for="set in cinemaStore.settlements"
                            :key="set.id"
                            class="hover:bg-neutral-50 transition-colors"
                        >
                            <td class="py-3 px-4">
                                <div class="flex items-center gap-2">
                                    <span class="w-2.5 h-2.5 rounded-full bg-black" />
                                    <span class="font-bold text-black">{{ set.chainName }}</span>
                                </div>
                                <div class="text-[11px] text-neutral-500 mt-0.5">
                                    {{ set.periodLabel }}
                                </div>
                            </td>

                            <td class="py-3 px-3 text-right font-mono font-medium">
                                {{ set.totalTransactions.toLocaleString("vi-VN") }}
                            </td>

                            <td class="py-3 px-3 text-right font-mono font-bold text-black">
                                {{ (set.totalGmv / 1000000).toLocaleString("vi-VN") }} tr ₫
                            </td>

                            <td class="py-3 px-3 text-right font-mono text-neutral-600 font-medium">
                                -{{ (set.platformCommission / 1000000).toLocaleString("vi-VN") }} tr
                                ₫
                            </td>

                            <td class="py-3 px-3 text-right font-mono text-neutral-500">
                                -{{ (set.discountCoFunded / 1000000).toLocaleString("vi-VN") }} tr ₫
                            </td>

                            <td class="py-3 px-3 text-right font-mono font-black text-black">
                                {{ (set.netPayableToPartner / 1000000).toLocaleString("vi-VN") }} tr
                                ₫
                            </td>

                            <td class="py-3 px-3 text-center">
                                <span
                                    v-if="set.discrepanciesCount > 0"
                                    class="text-[11px] font-mono font-bold text-black bg-neutral-200 px-1.5 py-0.2 rounded border border-neutral-300"
                                >
                                    {{ set.discrepanciesCount }} đơn
                                </span>
                                <span v-else class="text-[11px] text-neutral-400 font-mono">0</span>
                            </td>

                            <td class="py-3 px-3">
                                <span
                                    :class="[
                                        'text-[11px] font-bold capitalize',
                                        set.status === 'paid'
                                            ? 'text-black'
                                            : set.status === 'approved'
                                              ? 'text-neutral-700'
                                              : 'text-neutral-500',
                                    ]"
                                >
                                    {{
                                        set.status === "paid"
                                            ? "Đã thanh toán"
                                            : set.status === "approved"
                                              ? "Đã duyệt lệnh"
                                              : "Đã đối soát"
                                    }}
                                </span>
                            </td>

                            <td class="py-3 px-4 text-right">
                                <button
                                    v-if="set.status !== 'paid'"
                                    @click="cinemaStore.approveSettlement(set.id)"
                                    class="px-3 py-1 rounded bg-black hover:bg-neutral-800 text-white font-bold text-[11px] transition-colors cursor-pointer shadow-xs"
                                >
                                    Duyệt Payout
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="p-5 rounded-lg bg-base-100 border border-neutral-200 shadow-xs space-y-3">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-sm font-extrabold text-black">
                        Nhật Ký Xử Lý Sai Lệch Đối Soát Tự Động
                    </h3>
                    <p class="text-xs text-neutral-500">
                        Các giao dịch có sự can thiệp từ quầy rạp hoặc độ trễ gateway
                    </p>
                </div>
                <span class="text-xs text-neutral-500 font-mono"
                    >Tự động cân bằng tài khoản T+3</span
                >
            </div>

            <div class="space-y-2 text-xs">
                <div
                    class="p-3 rounded bg-neutral-50 border border-neutral-200 flex items-center justify-between"
                >
                    <div class="flex items-center gap-3">
                        <span class="w-2 h-2 rounded-full bg-black" />
                        <div>
                            <span class="font-mono font-bold text-black">CHB-2026-98120</span>
                            <span class="text-neutral-300"> · </span>
                            <span class="text-neutral-700 font-medium"
                                >Khách yêu cầu đổi suất tại quầy BHD Star Thảo Điền</span
                            >
                        </div>
                    </div>
                    <div class="text-right">
                        <span class="text-black font-mono font-bold">Đã bù trừ +20.000 ₫</span>
                        <span class="text-[10px] text-neutral-500 block">Đã đối soát xác nhận</span>
                    </div>
                </div>

                <div
                    class="p-3 rounded bg-neutral-50 border border-neutral-200 flex items-center justify-between"
                >
                    <div class="flex items-center gap-3">
                        <span class="w-2 h-2 rounded-full bg-black" />
                        <div>
                            <span class="font-mono font-bold text-black">CHB-2026-97914</span>
                            <span class="text-neutral-300"> · </span>
                            <span class="text-neutral-700 font-medium"
                                >Hoàn tiền tự động vé CGV Landmark 81 do máy chiếu IMAX</span
                            >
                        </div>
                    </div>
                    <div class="text-right">
                        <span class="text-neutral-700 font-mono font-medium"
                            >Không ghi nhận GMV</span
                        >
                        <span class="text-[10px] text-neutral-500 block font-mono"
                            >CGV Vista Webhook OK</span
                        >
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useAdminCinemaStore } from "@/stores/admin/useAdminCinemaStore";
import BaseIcon from "@/components/common/BaseIcon.vue";

const cinemaStore = useAdminCinemaStore();
const downloadSuccess = ref(false);

function handleExportCsv() {
    downloadSuccess.value = true;
    setTimeout(() => {
        downloadSuccess.value = false;
    }, 2500);
}

const totalPayableAll = computed(() =>
    cinemaStore.settlements.reduce((acc, s) => acc + s.netPayableToPartner, 0),
);

const totalCommissionAll = computed(() =>
    cinemaStore.settlements.reduce((acc, s) => acc + s.platformCommission, 0),
);
</script>


<template>
    <div class="space-y-6">
        <div
            class="p-4 rounded-lg bg-base-100 border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
            <div>
                <h2 class="text-sm font-extrabold text-black">
                    Chương Trình Khuyến Mãi & Voucher Đa Rạp
                </h2>
                <p class="text-xs text-neutral-500">
                    Cấu hình chia sẻ ngân sách đồng tài trợ (Co-funding split) giữa CineHub và các
                    chuỗi rạp đối tác
                </p>
            </div>
            <button
                @click="showCreateModal = true"
                class="px-3.5 py-2 rounded bg-black hover:bg-neutral-800 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
            >
                <BaseIcon name="plus" size="16" />
                <span>Tạo Chiến Dịch Mới</span>
            </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
                v-for="promo in cinemaStore.promotions"
                :key="promo.id"
                class="p-5 rounded-lg bg-base-100 border border-neutral-200 hover:border-black transition-all flex flex-col justify-between shadow-xs"
            >
                <div>
                    <div class="flex items-start justify-between">
                        <div
                            class="font-mono text-xs font-black text-black bg-neutral-100 border border-neutral-300 px-2 py-0.5 rounded"
                        >
                            {{ promo.code }}
                        </div>
                        <span class="text-[11px] text-black flex items-center gap-1 font-bold">
                            <span class="w-1.5 h-1.5 rounded-full bg-black" />
                            Đang chạy
                        </span>
                    </div>

                    <h3 class="font-extrabold text-sm text-black mt-2 leading-snug">
                        {{ promo.title }}
                    </h3>
                    <p class="text-xs text-neutral-500 mt-1 line-clamp-2">
                        {{ promo.description }}
                    </p>

                    <div class="mt-4 pt-3 border-t border-neutral-100 space-y-2.5 text-xs">
                        <div class="flex items-center justify-between">
                            <span class="text-neutral-500 text-[11px]">Mức giảm giá:</span>
                            <span class="font-black text-black font-mono">
                                -{{ promo.discountValue.toLocaleString("vi-VN") }} ₫
                            </span>
                        </div>

                        <div class="flex items-center justify-between">
                            <span class="text-neutral-500 text-[11px]">Tỷ lệ chia sẻ chi phí:</span>
                            <span class="text-black font-mono font-bold text-[11px]">
                                CineHub {{ promo.platformSplitRatio }}% : Rạp
                                {{ 100 - promo.platformSplitRatio }}%
                            </span>
                        </div>

                        <div class="flex items-center justify-between">
                            <span class="text-neutral-500 text-[11px]">Rạp áp dụng:</span>
                            <span class="text-black font-bold text-[11px] uppercase">
                                {{
                                    promo.applicableChains.includes("all")
                                        ? "Tất cả 7 chuỗi rạp"
                                        : promo.applicableChains.join(", ")
                                }}
                            </span>
                        </div>

                        <div class="pt-1">
                            <div class="flex items-center justify-between text-[11px] mb-1">
                                <span class="text-neutral-500">Ngân sách đã tiêu:</span>
                                <span class="font-mono text-black font-bold">
                                    {{
                                        Math.min(
                                            100,
                                            Math.round(
                                                (promo.budgetSpent / promo.budgetLimit) * 100,
                                            ),
                                        )
                                    }}%
                                </span>
                            </div>
                            <div
                                class="w-full h-2 rounded-full bg-neutral-100 overflow-hidden border border-neutral-200"
                            >
                                <div
                                    class="h-full rounded-full bg-black transition-all duration-300"
                                    :style="{
                                        width: `${Math.min(100, Math.round((promo.budgetSpent / promo.budgetLimit) * 100))}%`,
                                    }"
                                />
                            </div>
                            <div
                                class="flex justify-between text-[10px] text-neutral-500 mt-1 font-mono"
                            >
                                <span>{{ (promo.budgetSpent / 1000000).toFixed(1) }} tr ₫</span>
                                <span
                                    >Hạn mức:
                                    {{ (promo.budgetLimit / 1000000).toFixed(0) }} tr ₫</span
                                >
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    class="mt-4 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500 font-mono"
                >
                    <span>{{ promo.usedCount.toLocaleString("vi-VN") }} lượt đổi</span>
                    <span>Hết hạn: {{ promo.endDate }}</span>
                </div>
            </div>
        </div>

        <div
            v-if="showCreateModal"
            class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
            <form
                @submit.prevent="handleCreate"
                class="bg-base-100 border border-neutral-400 rounded-lg w-full max-w-md p-4 sm:p-6 shadow-2xl text-black space-y-4 max-h-[92vh] overflow-y-auto"
            >
                <div class="flex items-center justify-between pb-3 border-b border-neutral-200">
                    <h3 class="font-black text-black text-base">
                        Tạo Chiến Dịch Khuyến Mãi Mới
                    </h3>
                    <button
                        type="button"
                        @click="showCreateModal = false"
                        class="text-neutral-500 hover:text-black font-bold cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                <div class="space-y-3 text-xs">
                    <div>
                        <label class="block text-black font-bold mb-1">Mã Voucher (Code)</label>
                        <input
                            type="text"
                            required
                            placeholder="Vd: SUMMERCGV50K"
                            v-model="newCode"
                            class="w-full bg-neutral-50 px-3 py-2 rounded border border-neutral-300 font-mono uppercase text-black font-bold focus:outline-none focus:border-black"
                        />
                    </div>

                    <div>
                        <label class="block text-black font-bold mb-1">Tên Chiến Dịch</label>
                        <input
                            type="text"
                            required
                            placeholder="Vd: Ưu Đãi Phim Hè 2026 Toàn Mạng Lưới"
                            v-model="newTitle"
                            class="w-full bg-neutral-50 px-3 py-2 rounded border border-neutral-300 text-black font-medium focus:outline-none focus:border-black"
                        />
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-black font-bold mb-1"
                                >Số Tiền Giảm (VNĐ)</label
                            >
                            <input
                                type="number"
                                v-model="newDiscountValue"
                                class="w-full bg-neutral-50 px-3 py-2 rounded border border-neutral-300 font-mono font-bold text-black focus:outline-none focus:border-black"
                            />
                        </div>
                        <div>
                            <label class="block text-black font-bold mb-1"
                                >Tổng Ngân Sách (VNĐ)</label
                            >
                            <input
                                type="number"
                                v-model="newBudget"
                                class="w-full bg-neutral-50 px-3 py-2 rounded border border-neutral-300 font-mono font-bold text-black focus:outline-none focus:border-black"
                            />
                        </div>
                    </div>

                    <div>
                        <div class="flex justify-between mb-1 font-mono">
                            <span class="text-neutral-700 font-medium">Tỷ lệ đồng tài trợ:</span>
                            <span class="text-black font-bold">
                                CineHub {{ newSplitRatio }}% : Rạp {{ 100 - newSplitRatio }}%
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            v-model="newSplitRatio"
                            class="w-full accent-black cursor-pointer"
                        />
                    </div>
                </div>

                <div class="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200">
                    <button
                        type="button"
                        @click="showCreateModal = false"
                        class="px-3.5 py-1.5 rounded text-xs font-medium text-neutral-600 hover:text-black cursor-pointer"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        class="px-4 py-1.5 rounded bg-black hover:bg-neutral-800 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                    >
                        Kích Hoạt Chiến Dịch
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useAdminCinemaStore } from "@/stores/admin/useAdminCinemaStore";
import BaseIcon from "@/components/common/BaseIcon.vue";

const cinemaStore = useAdminCinemaStore();

const showCreateModal = ref(false);
const newCode = ref("");
const newTitle = ref("");
const newDiscountValue = ref(30000);
const newBudget = ref(100000000);
const newSplitRatio = ref(50);
const selectedChains = ref(["all"]);

function handleCreate() {
    if (!newCode.value || !newTitle.value) return;

    const promo = {
        id: `promo-${Date.now()}`,
        code: newCode.value.toUpperCase().replace(/\s+/g, ""),
        title: newTitle.value,
        description: `Chiến dịch tài trợ liên chuỗi áp dụng trên hệ thống CineHub.`,
        discountType: "fixed_amount",
        discountValue: Number(newDiscountValue.value),
        minOrderValue: 120000,
        startDate: "2026-11-01",
        endDate: "2026-12-31",
        applicableChains: selectedChains.value,
        budgetLimit: Number(newBudget.value),
        budgetSpent: 0,
        platformSplitRatio: Number(newSplitRatio.value),
        status: "active",
        usedCount: 0,
    };

    cinemaStore.createPromotion(promo);
    showCreateModal.value = false;
    newCode.value = "";
    newTitle.value = "";
}
</script>


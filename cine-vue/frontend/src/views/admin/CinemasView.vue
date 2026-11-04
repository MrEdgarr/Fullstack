<template>
    <div class="space-y-6">
        <div>
            <div class="flex items-center justify-between mb-3">
                <div>
                    <h2 class="text-base font-extrabold text-black">
                        7 Chuỗi Rạp Đối Tác Phân Phối Vé
                    </h2>
                    <p class="text-xs text-neutral-500">
                        Cấu hình tỷ lệ chia sẻ hoa hồng, hợp đồng phân phối và cổng API Gateway
                    </p>
                </div>
                <span class="text-xs text-neutral-500 font-mono"
                    >195 cụm rạp kết nối trực tuyến</span
                >
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div
                    v-for="chain in cinemaStore.chains"
                    :key="chain.id"
                    class="p-4 rounded-lg bg-base-100 border border-base-300 hover:border-black transition-all flex flex-col justify-between shadow-xs"
                >
                    <div>
                        <div class="flex items-start justify-between">
                            <div class="flex items-center gap-2.5">
                                <div
                                    class="w-8 h-8 rounded-md bg-black text-white flex items-center justify-center font-bold font-mono text-xs shadow-xs"
                                >
                                    {{ chain.code }}
                                </div>
                                <div>
                                    <h3 class="font-bold text-xs text-black leading-tight">
                                        {{ chain.name }}
                                    </h3>
                                    <p class="text-[11px] text-neutral-500 font-mono">
                                        {{ chain.totalMultiplexes }} Cụm ·
                                        {{ chain.totalScreens }} Phòng
                                    </p>
                                </div>
                            </div>

                            <button
                                @click="openEditCommission(chain)"
                                class="p-1.5 rounded hover:bg-base-200 text-neutral-600 hover:text-black transition-colors cursor-pointer"
                                title="Chỉnh sửa chính sách hoa hồng"
                            >
                                <BaseIcon name="edit" size="14" />
                            </button>
                        </div>

                        <div class="mt-3.5 pt-3 border-t border-base-200 space-y-2 text-xs">
                            <div class="flex items-center justify-between">
                                <span class="text-neutral-500 text-[11px]">Hoa hồng đại lý</span>
                                <span class="font-bold text-black font-mono"
                                    >{{ chain.commissionRate }}% net</span
                                >
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-neutral-500 text-[11px]">Kỳ đối soát</span>
                                <span class="text-neutral-800 font-medium capitalize text-[11px]">
                                    {{
                                        chain.settlementCycle === "daily"
                                            ? "Hàng ngày (T+1)"
                                            : chain.settlementCycle === "t3"
                                              ? "Kỳ T+3"
                                              : "Hàng tuần"
                                    }}
                                </span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-neutral-500 text-[11px]">Giao thức kết nối</span>
                                <span
                                    class="text-black text-[11px] flex items-center gap-1 font-mono font-bold"
                                >
                                    <span class="w-1.5 h-1.5 rounded-full bg-black" />
                                    {{ chain.latencyMs }}ms
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="mt-4 pt-2.5 border-t border-base-200 flex items-center justify-between">
                        <button
                            @click="cinemaStore.testPing(chain.id)"
                            :disabled="cinemaStore.pingStatus[chain.id] === 'testing'"
                            class="text-[11px] text-neutral-600 hover:text-black flex items-center gap-1 cursor-pointer transition-colors"
                        >
                            <BaseIcon
                                name="refresh"
                                size="12"
                                class="text-black"
                                :class="{
                                    'animate-spin': cinemaStore.pingStatus[chain.id] === 'testing',
                                }"
                            />
                            <span>{{
                                cinemaStore.pingStatus[chain.id] === "success"
                                    ? "Ping OK (38ms)"
                                    : "Kiểm tra ping"
                            }}</span>
                        </button>
                        <button
                            @click="selectedChainFilter = chain.id"
                            class="text-[11px] font-semibold transition-colors cursor-pointer"
                            :class="
                                selectedChainFilter === chain.id
                                    ? 'text-black underline'
                                    : 'text-neutral-600 hover:text-black'
                            "
                        >
                            Lọc rạp →
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="p-5 rounded-lg bg-base-100 border border-base-300 shadow-xs space-y-4">
            <div
                class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-base-300"
            >
                <div>
                    <h3 class="text-sm font-extrabold text-black">Danh Mục Cụm Rạp Chiếu Phim</h3>
                    <p class="text-xs text-neutral-500">
                        Quản lý các phòng chiếu, định dạng đặc biệt và trạng thái tiếp nhận vé
                    </p>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                    <div class="relative w-48">
                        <BaseIcon
                            name="search"
                            size="14"
                            class="text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2"
                        />
                        <input
                            v-model="searchQuery"
                            type="text"
                            placeholder="Tìm cụm rạp, địa chỉ..."
                            class="input input-sm w-full bg-base-200 text-xs text-black pl-8 border-base-300 focus:outline-black"
                        />
                    </div>

                    <div
                        class="flex items-center p-0.5 bg-base-200 rounded-md border border-base-300 text-xs"
                    >
                        <button
                            v-for="city in ['all', 'Hồ Chí Minh', 'Hà Nội']"
                            :key="city"
                            @click="selectedCityFilter = city"
                            class="px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                            :class="
                                selectedCityFilter === city
                                    ? 'bg-black text-white shadow-xs'
                                    : 'text-neutral-600 hover:text-black'
                            "
                        >
                            {{ city === "all" ? "Tất cả Tỉnh/TP" : city }}
                        </button>
                    </div>

                    <button
                        v-if="
                            selectedChainFilter !== 'all' ||
                            selectedCityFilter !== 'all' ||
                            searchQuery
                        "
                        @click="
                            selectedChainFilter = 'all';
                            selectedCityFilter = 'all';
                            searchQuery = '';
                        "
                        class="text-[11px] text-black hover:underline font-bold px-2 py-1 cursor-pointer"
                    >
                        Xóa bộ lọc
                    </button>
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="table table-sm w-full text-left text-xs text-neutral-800">
                    <thead
                        class="text-[11px] uppercase tracking-wider text-neutral-500 bg-base-200 border-b border-base-300"
                    >
                        <tr>
                            <th class="py-3 px-4 font-bold">Tên Cụm Rạp & Chuỗi</th>
                            <th class="py-3 px-3 font-bold">Khu Vực & Địa Chỉ</th>
                            <th class="py-3 px-3 font-bold">Quy Mô</th>
                            <th class="py-3 px-3 font-bold">Công Nghệ Đặc Biệt</th>
                            <th class="py-3 px-3 font-bold text-right">Doanh Thu Hôm Nay</th>
                            <th class="py-3 px-4 font-bold text-right">Trạng Thái Bán</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-base-200">
                        <tr
                            v-for="m in filteredMultiplexes"
                            :key="m.id"
                            class="hover:bg-base-200/50 transition-colors"
                        >
                            <td class="py-3 px-4">
                                <div class="flex items-center gap-2.5">
                                    <div class="w-2 h-2 rounded-full bg-black" />
                                    <div>
                                        <div class="font-bold text-black">{{ m.name }}</div>
                                        <div class="text-[11px] text-neutral-500">
                                            {{ m.chainName }}
                                        </div>
                                    </div>
                                </div>
                            </td>

                            <td class="py-3 px-3">
                                <div class="flex items-center gap-1.5 text-black">
                                    <BaseIcon
                                        name="location"
                                        size="14"
                                        class="text-neutral-500 shrink-0"
                                    />
                                    <span class="font-medium">{{ m.district }}, {{ m.city }}</span>
                                </div>
                                <div class="text-[11px] text-neutral-500 truncate max-w-xs">
                                    {{ m.address }}
                                </div>
                            </td>

                            <td class="py-3 px-3 font-mono">
                                <div class="text-black font-semibold">
                                    {{ m.screensCount }} phòng chiếu
                                </div>
                                <div class="text-[11px] text-neutral-500">
                                    {{ m.seatCapacity }} ghế
                                </div>
                            </td>

                            <td class="py-3 px-3">
                                <div class="flex flex-wrap gap-1">
                                    <span
                                        v-for="f in m.specialFormats"
                                        :key="f"
                                        class="badge badge-sm badge-outline font-mono text-[10px]"
                                    >
                                        {{ f }}
                                    </span>
                                </div>
                            </td>

                            <td class="py-3 px-3 text-right font-mono">
                                <div class="font-bold text-black">
                                    {{ m.todayRevenue.toLocaleString("vi-VN") }} ₫
                                </div>
                                <div class="text-[11px] text-neutral-500">
                                    {{ m.todayBookings }} booking
                                </div>
                            </td>

                            <td class="py-3 px-4 text-right">
                                <button
                                    @click="cinemaStore.toggleMultiplexStatus(m.id)"
                                    class="btn btn-xs font-bold"
                                    :class="
                                        m.status === 'active'
                                            ? 'btn-outline text-black'
                                            : 'btn-neutral text-white'
                                    "
                                >
                                    {{ m.status === "active" ? "Đang mở bán" : "Tạm khóa" }}
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div v-if="editingChain" class="modal modal-open p-2 sm:p-4">
            <div
                class="modal-box bg-base-100 border border-base-300 max-w-md p-4 sm:p-6 text-black space-y-4 max-h-[92vh] overflow-y-auto"
            >
                <div class="flex items-center justify-between pb-3 border-b border-base-300">
                    <div class="flex items-center gap-2.5">
                        <div
                            class="w-7 h-7 rounded bg-black text-white flex items-center justify-center font-bold font-mono text-xs"
                        >
                            {{ editingChain.code }}
                        </div>
                        <h3 class="font-extrabold text-black text-sm">
                            Chính Sách Hoa Hồng {{ editingChain.name }}
                        </h3>
                    </div>
                    <button @click="editingChain = null" class="btn btn-sm btn-ghost btn-circle">
                        ✕
                    </button>
                </div>

                <p class="text-xs text-neutral-600">
                    Tỷ lệ hoa hồng trung gian CineHub thu trên mỗi giá trị đơn vé bán thành công cho
                    chuỗi {{ editingChain.name }}.
                </p>

                <div class="p-4 rounded-md bg-base-200 border border-base-300 space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="text-xs text-neutral-700 font-medium"
                            >Mức hoa hồng áp dụng:</span
                        >
                        <span class="text-lg font-black text-black font-mono"
                            >{{ tempCommission.toFixed(1) }}%</span
                        >
                    </div>
                    <input
                        type="range"
                        min="3.0"
                        max="10.0"
                        step="0.1"
                        v-model.number="tempCommission"
                        class="range range-xs range-neutral w-full cursor-pointer"
                    />
                    <div class="flex justify-between text-[10px] text-neutral-500 font-mono">
                        <span>3.0% (Chiến lược)</span>
                        <span>10.0% (Tiêu chuẩn)</span>
                    </div>
                </div>

                <div
                    class="text-[11px] text-neutral-600 space-y-1 bg-base-200 p-3 rounded border border-base-300 font-mono"
                >
                    <p>
                        · Hợp đồng hiệu lực đến:
                        <span class="text-black font-bold">{{
                            editingChain.activeContractUntil
                        }}</span>
                    </p>
                    <p>
                        · Cơ chế đối soát:
                        <span class="text-black font-bold"
                            >Tự động đối soát API mỗi 23:59 hàng ngày</span
                        >
                    </p>
                </div>

                <div class="modal-action">
                    <button @click="editingChain = null" class="btn btn-sm btn-ghost">
                        Hủy bỏ
                    </button>
                    <button
                        @click="saveCommission"
                        class="btn btn-sm btn-neutral text-white font-bold"
                    >
                        Lưu Thay Đổi
                    </button>
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

const selectedChainFilter = ref("all");
const selectedCityFilter = ref("all");
const searchQuery = ref("");

const editingChain = ref(null);
const tempCommission = ref(5.0);

function openEditCommission(chain) {
    editingChain.value = chain;
    tempCommission.value = chain.commissionRate;
}

function saveCommission() {
    if (editingChain.value) {
        cinemaStore.updateCommission(editingChain.value.id, tempCommission.value);
        editingChain.value = null;
    }
}

const filteredMultiplexes = computed(() => {
    return cinemaStore.multiplexes.filter((m) => {
        const matchesChain =
            selectedChainFilter.value === "all" || m.chainId === selectedChainFilter.value;
        const matchesCity =
            selectedCityFilter.value === "all" || m.city === selectedCityFilter.value;
        const matchesSearch =
            m.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            m.address.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            m.district.toLowerCase().includes(searchQuery.value.toLowerCase());
        return matchesChain && matchesCity && matchesSearch;
    });
});
</script>


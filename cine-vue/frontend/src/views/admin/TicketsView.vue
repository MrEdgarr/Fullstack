<template>
    <div class="space-y-6">
        <div class="p-4 rounded-lg bg-base-100 border border-base-300 shadow-xs space-y-3">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h2 class="text-sm font-extrabold text-black">
                        Sổ Lệnh Đặt Vé & Mã Điện Tử Toàn Hệ Thống
                    </h2>
                    <p class="text-xs text-neutral-500">
                        Tra cứu mã vé rạp, kiểm tra tình trạng check-in và hỗ trợ xuất vé lại
                    </p>
                </div>
                <span class="text-xs text-neutral-500 font-mono">
                    {{ filteredOrders.length }} / {{ cinemaStore.orders.length }} đơn hiển thị
                </span>
            </div>

            <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-base-200">
                <div class="relative w-64">
                    <BaseIcon
                        name="search"
                        size="14"
                        class="text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2"
                    />
                    <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Mã vé, SĐT, tên khách, phim..."
                        class="input input-sm w-full bg-base-200 text-xs text-black pl-8 border-base-300 focus:outline-black font-medium"
                    />
                </div>

                <select
                    v-model="chainFilter"
                    class="select select-sm bg-base-200 text-xs text-black border-base-300 focus:outline-black font-medium"
                >
                    <option value="all">Tất cả chuỗi rạp</option>
                    <option v-for="c in cinemaStore.chains" :key="c.id" :value="c.id">
                        {{ c.name }}
                    </option>
                </select>

                <div
                    class="flex items-center p-0.5 bg-base-200 rounded-md border border-base-300 text-xs overflow-x-auto max-w-full"
                >
                    <button
                        v-for="tab in [
                            { id: 'all', label: 'Tất cả trạng thái' },
                            { id: 'issued', label: 'Đã xuất vé' },
                            { id: 'checked_in', label: 'Đã check-in rạp' },
                            { id: 'sync_error', label: 'Lỗi đồng bộ API' },
                        ]"
                        :key="tab.id"
                        @click="statusFilter = tab.id"
                        class="px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                        :class="
                            statusFilter === tab.id
                                ? 'bg-black text-white shadow-xs'
                                : 'text-neutral-600 hover:text-black'
                        "
                    >
                        {{ tab.label }}
                    </button>
                </div>

                <button
                    v-if="searchQuery || chainFilter !== 'all' || statusFilter !== 'all'"
                    @click="
                        searchQuery = '';
                        chainFilter = 'all';
                        statusFilter = 'all';
                    "
                    class="text-xs text-black font-bold hover:underline px-2 py-1 cursor-pointer"
                >
                    Xóa bộ lọc
                </button>
            </div>
        </div>

        <div class="p-5 rounded-lg bg-base-100 border border-base-300 shadow-xs overflow-x-auto">
            <table class="table table-sm w-full text-left text-xs text-neutral-800">
                <thead
                    class="text-[11px] uppercase tracking-wider text-neutral-500 bg-base-200 border-b border-base-300"
                >
                    <tr>
                        <th class="py-3 px-4 font-bold">Mã Đơn / Mã Rạp</th>
                        <th class="py-3 px-3 font-bold">Khách Hàng</th>
                        <th class="py-3 px-3 font-bold">Phim & Suất Chiếu</th>
                        <th class="py-3 px-3 font-bold">Cụm Rạp & Ghế</th>
                        <th class="py-3 px-3 font-bold text-right">Tổng Tiền / Payout</th>
                        <th class="py-3 px-3 font-bold">Thanh Toán</th>
                        <th class="py-3 px-4 font-bold text-right">Thao Tác</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-base-200">
                    <tr
                        v-for="order in filteredOrders"
                        :key="order.id"
                        class="hover:bg-base-200/50 transition-colors"
                    >
                        <td class="py-3 px-4">
                            <div class="font-mono font-bold text-black flex items-center gap-1.5">
                                <span>{{ order.id }}</span>
                            </div>
                            <div class="font-mono text-[11px] text-neutral-500 mt-0.5">
                                {{ order.partnerTicketCode }}
                            </div>
                        </td>

                        <td class="py-3 px-3">
                            <div class="font-bold text-black">{{ order.customerName }}</div>
                            <div class="text-[11px] text-neutral-500 font-mono">
                                {{ order.customerPhone }}
                            </div>
                        </td>

                        <td class="py-3 px-3">
                            <div class="font-semibold text-black truncate max-w-xs">
                                {{ order.movieTitle }}
                            </div>
                            <div class="text-[11px] text-neutral-500 mt-0.5 font-mono">
                                {{ order.showTime }} · {{ order.showDate }} ({{ order.format }})
                            </div>
                        </td>

                        <td class="py-3 px-3">
                            <div class="text-black font-medium">{{ order.multiplexName }}</div>
                            <div class="text-[11px] text-black font-mono font-bold mt-0.5">
                                Ghế: {{ order.seats.join(", ") }} ({{ order.roomName }})
                            </div>
                        </td>

                        <td class="py-3 px-3 text-right font-mono">
                            <div class="font-black text-black">
                                {{ order.totalAmount.toLocaleString("vi-VN") }} ₫
                            </div>
                            <div class="text-[10px] text-neutral-500">
                                Hoa hồng: +{{ order.platformCommission.toLocaleString("vi-VN") }} ₫
                            </div>
                        </td>

                        <td class="py-3 px-3">
                            <div class="font-bold text-black">{{ order.paymentMethod }}</div>
                            <div class="text-[10px] text-neutral-600 font-medium">
                                {{
                                    order.paymentStatus === "refunded"
                                        ? "Đã hoàn tiền"
                                        : "Đã thanh toán"
                                }}
                            </div>
                        </td>

                        <td class="py-3 px-4 text-right">
                            <button
                                @click="cinemaStore.selectedOrder = order"
                                class="btn btn-xs btn-outline border-base-300 text-black hover:bg-black hover:text-white font-bold"
                            >
                                <BaseIcon name="qr-code" size="14" />
                                <span>Xem Vé</span>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="cinemaStore.selectedOrder" class="modal modal-open p-2 sm:p-4">
            <div
                class="modal-box bg-base-100 border border-base-300 max-w-lg p-4 sm:p-6 text-black space-y-4 max-h-[92vh] overflow-y-auto"
            >
                <div class="flex items-center justify-between pb-3 border-b border-base-300">
                    <div class="flex items-center gap-2">
                        <BaseIcon name="ticket" size="20" class="text-black" />
                        <h3 class="font-extrabold text-black text-base">
                            Vé Điện Tử Phân Phối Đa Rạp
                        </h3>
                    </div>
                    <button
                        @click="cinemaStore.selectedOrder = null"
                        class="btn btn-sm btn-ghost btn-circle"
                    >
                        ✕
                    </button>
                </div>

                <div
                    class="relative rounded-lg bg-base-100 border-2 border-black p-5 shadow-xs overflow-hidden space-y-4"
                >
                    <div
                        class="flex items-center justify-between border-b-2 border-dashed border-base-300 pb-3"
                    >
                        <div>
                            <div
                                class="text-xs font-black uppercase text-black tracking-wider font-mono"
                            >
                                {{ cinemaStore.selectedOrder.chainName }}
                            </div>
                            <div class="text-sm font-bold text-black mt-0.5">
                                {{ cinemaStore.selectedOrder.multiplexName }}
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="text-[10px] uppercase font-mono text-neutral-500"
                                >Định dạng</span
                            >
                            <div class="text-xs font-bold text-black font-mono">
                                {{ cinemaStore.selectedOrder.format }}
                            </div>
                        </div>
                    </div>

                    <div class="flex gap-4">
                        <img
                            :src="cinemaStore.selectedOrder.moviePoster"
                            :alt="cinemaStore.selectedOrder.movieTitle"
                            class="w-16 h-24 object-cover rounded shadow-xs shrink-0 border border-base-300"
                        />
                        <div class="flex-1 min-w-0">
                            <h4 class="font-black text-black text-sm leading-snug">
                                {{ cinemaStore.selectedOrder.movieTitle }}
                            </h4>
                            <div class="text-xs text-neutral-600 mt-1 space-y-0.5 font-mono">
                                <p>
                                    Suất chiếu:
                                    <span class="font-black text-black">{{
                                        cinemaStore.selectedOrder.showTime
                                    }}</span>
                                    · {{ cinemaStore.selectedOrder.showDate }}
                                </p>
                                <p>
                                    Phòng chiếu:
                                    <span class="font-bold text-black">{{
                                        cinemaStore.selectedOrder.roomName
                                    }}</span>
                                </p>
                                <p>
                                    Số ghế:
                                    <span class="font-black text-black text-sm">{{
                                        cinemaStore.selectedOrder.seats.join(", ")
                                    }}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div
                        class="p-4 rounded bg-base-200 border border-base-300 flex flex-col items-center justify-center space-y-2"
                    >
                        <div
                            class="w-28 h-28 bg-white border-2 border-black rounded p-2 flex flex-col justify-between"
                        >
                            <div class="flex justify-between">
                                <div class="w-5 h-5 bg-black" />
                                <div class="w-5 h-5 bg-black" />
                            </div>
                            <div class="text-black text-[9px] font-mono text-center font-bold">
                                {{ cinemaStore.selectedOrder.id }}
                            </div>
                            <div class="flex justify-between">
                                <div class="w-5 h-5 bg-black" />
                                <div class="w-3 h-3 bg-black" />
                            </div>
                        </div>

                        <div class="text-center">
                            <div class="font-mono font-black text-base tracking-widest text-black">
                                {{ cinemaStore.selectedOrder.partnerTicketCode }}
                            </div>
                            <p class="text-[10px] text-neutral-500">
                                Quét mã vạch tại máy soát vé hoặc quầy Kiosk rạp
                            </p>
                        </div>
                    </div>

                    <div
                        class="pt-2 text-[11px] space-y-1.5 text-neutral-600 border-t border-dashed border-base-300"
                    >
                        <div class="flex justify-between">
                            <span>Khách hàng:</span>
                            <span class="text-black font-bold"
                                >{{ cinemaStore.selectedOrder.customerName }} ({{
                                    cinemaStore.selectedOrder.customerPhone
                                }})</span
                            >
                        </div>
                        <div class="flex justify-between">
                            <span
                                >Tổng tiền thanh toán ({{
                                    cinemaStore.selectedOrder.paymentMethod
                                }}):</span
                            >
                            <span class="text-black font-black font-mono"
                                >{{
                                    cinemaStore.selectedOrder.totalAmount.toLocaleString("vi-VN")
                                }}
                                ₫</span
                            >
                        </div>
                        <div class="flex justify-between">
                            <span
                                >Hoa hồng CineHub ({{ cinemaStore.selectedOrder.chainName }}):</span
                            >
                            <span class="text-black font-bold font-mono"
                                >+{{
                                    cinemaStore.selectedOrder.platformCommission.toLocaleString(
                                        "vi-VN",
                                    )
                                }}
                                ₫</span
                            >
                        </div>
                        <div class="flex justify-between">
                            <span>Tiền quyết toán chuyển về rạp đối tác:</span>
                            <span class="text-black font-bold font-mono"
                                >{{
                                    cinemaStore.selectedOrder.netPayoutToCinema.toLocaleString(
                                        "vi-VN",
                                    )
                                }}
                                ₫</span
                            >
                        </div>
                    </div>
                </div>

                <div class="flex flex-wrap items-center justify-between gap-2 pt-2">
                    <div class="flex items-center gap-2">
                        <button
                            @click="handleCopyCode(cinemaStore.selectedOrder.partnerTicketCode)"
                            class="btn btn-sm btn-outline border-base-300 text-black font-bold"
                        >
                            <BaseIcon :name="copiedCode ? 'check' : 'copy'" size="14" />
                            <span>{{ copiedCode ? "Đã sao chép" : "Sao chép mã" }}</span>
                        </button>

                        <button
                            @click="handleTriggerReSync(cinemaStore.selectedOrder.id)"
                            class="btn btn-sm btn-outline border-base-300 text-black font-bold"
                        >
                            <BaseIcon name="refresh" size="14" />
                            <span>{{ resyncSuccess ? "Đã sync lại vé" : "Re-sync API Rạp" }}</span>
                        </button>
                    </div>

                    <div class="flex items-center gap-2">
                        <button
                            @click="cinemaStore.refundTicket(cinemaStore.selectedOrder.id)"
                            class="btn btn-sm btn-outline border-neutral-400 text-black font-bold"
                        >
                            Hoàn Vé / Hủy
                        </button>
                        <button
                            @click="handlePrint"
                            class="btn btn-sm btn-neutral text-white font-bold"
                        >
                            <BaseIcon name="printer" size="14" />
                            <span>In Vé</span>
                        </button>
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

const searchQuery = ref("");
const chainFilter = ref("all");
const statusFilter = ref("all");
const copiedCode = ref(false);
const resyncSuccess = ref(false);

function handleCopyCode(text) {
    navigator.clipboard?.writeText(text);
    copiedCode.value = true;
    setTimeout(() => (copiedCode.value = false), 2000);
}

function handleTriggerReSync(orderId) {
    cinemaStore.resyncTicket(orderId);
    resyncSuccess.value = true;
    setTimeout(() => (resyncSuccess.value = false), 2500);
}

function handlePrint() {
    window.print();
}

const filteredOrders = computed(() => {
    return cinemaStore.orders.filter((o) => {
        const matchesChain = chainFilter.value === "all" || o.chainId === chainFilter.value;
        const matchesStatus = statusFilter.value === "all" || o.ticketStatus === statusFilter.value;
        const matchesSearch =
            o.id.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            o.partnerTicketCode.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            o.customerName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            o.customerPhone.includes(searchQuery.value) ||
            o.movieTitle.toLowerCase().includes(searchQuery.value.toLowerCase());
        return matchesChain && matchesStatus && matchesSearch;
    });
});
</script>


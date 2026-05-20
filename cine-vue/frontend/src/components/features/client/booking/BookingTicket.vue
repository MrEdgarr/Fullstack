<template>
    <dialog class="modal" :class="{ 'modal-open': paymentStore.isTicketInfo }">
        <div class="modal-box">
            <div class="font-semibold">Đặt vé thành công</div>
            <div class="flex items-center border-b border-dashed border-base-content/25 my-2 pb-2">
                <div>
                    <img :src="qrUrl" alt="Ticket QR Code" />
                </div>
                <div class="text-sm font-semibold">
                    <p>Mã booking:</p>
                    <span>{{ bookingCode }}</span>
                </div>
            </div>

            <div v-if="ticket" class="grid grid-cols-2 gap-5">
                <div class="col-span-2">
                    <div class="text-lg font-semibold">{{ ticket.showtime?.movie?.title }}</div>
                    <div class="text-xs font-medium">
                        {{ ticket.showtime?.format }} - {{ ticket.showtime?.ageRestriction }}
                    </div>
                </div>
                <div>
                    <div class="text-xs">Rạp</div>
                    <div class="text-sm font-medium">{{ ticket.showtime?.cinema?.name }}</div>
                </div>
                <div>
                    <div class="text-xs">Giờ chiếu</div>
                    <div class="text-sm font-medium">{{ ticket.showtime?.time }}</div>
                </div>
                <div>
                    <div class="text-xs">Ngày chiếu</div>
                    <div class="text-sm font-medium">{{ formatDate(ticket.showtime?.date) }}</div>
                </div>
                <div>
                    <div class="text-xs">Phòng chiếu</div>
                    <div class="text-sm font-medium">{{ ticket.showtime?.room }}</div>
                </div>
                <div v-if="coupleSeatsList">
                    <div class="text-xs">Ghế đôi</div>
                    <div class="text-sm font-medium">{{ coupleSeatsList }}</div>
                </div>
                <div v-if="singleSeatsList">
                    <div class="text-xs">Ghế đơn/VIP</div>
                    <div class="text-sm font-medium">{{ singleSeatsList }}</div>
                </div>
                <div>
                    <div class="text-xs">Đồ ăn & thức uống</div>
                    <div class="text-sm font-medium">
                        <template v-if="ticket.combos?.length">
                            <div v-for="combo in ticket.combos" :key="combo.id">
                                {{ combo.qty }}x {{ combo.name }}
                            </div>
                        </template>
                        <template v-else>Không chọn combo</template>
                    </div>
                </div>
                <div>
                    <div class="text-xs">Thanh toán</div>
                    <div class="text-sm font-medium">{{ paymentLabel }}</div>
                </div>
            </div>

            <div v-if="ticket" class="mt-2 border-t border-dashed border-base-content/25 pt-2">
                <div class="flex justify-between font-medium text-sm">
                    <div>Giảm giá</div>
                    <div>-{{ formatCurrency(ticket.booking.discount_amount || 0) }}</div>
                </div>
                <div class="flex justify-between font-medium text-sm">
                    <div>Tổng cộng:</div>
                    <div>{{ formatCurrency(ticket.booking.final_amount || 0) }}</div>
                </div>
            </div>

            <div class="modal-action">
                <button class="btn btn-ghost" @click="goHome">Trang chủ</button>
                <button class="btn btn-primary" @click="paymentStore.closeTicketModal">Đóng</button>
            </div>
        </div>
    </dialog>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useBookingStore } from "@/stores/booking";
import { formatCurrency } from "@/utils/helpers/currency";

const router = useRouter();
const bookingStore = useBookingStore();
const paymentStore = bookingStore.paymentStore;

const ticket = computed(() => paymentStore.lastTicket);
const bookingCode = computed(() => `BK${ticket.value?.booking?.booking_id || ""}`);
const qrUrl = computed(() =>
    `https://quickchart.io/qr?text=${encodeURIComponent(bookingCode.value)}&size=100`,
);

const singleSeatsList = computed(() =>
    (ticket.value?.seats || [])
        .filter((seat) => seat.type === "single" || seat.type === "vip")
        .map((seat) => `${seat.row}${seat.number}`)
        .join(", "),
);
const coupleSeatsList = computed(() =>
    (ticket.value?.seats || [])
        .filter((seat) => seat.type === "couple")
        .map((seat) => `${seat.row}${seat.number}`)
        .join(", "),
);
const paymentLabel = computed(() => {
    const method = ticket.value?.payment_method;
    const labels = {
        card: "Thẻ ATM / Quốc tế",
        momo: "MoMo",
        vnpay: "VNPAY",
        zalopay: "ZaloPay",
        cash: "Tiền mặt",
    };
    return labels[method] || method || "Không xác định";
});

const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return Number.isNaN(date.getTime()) ? dateString : date.toLocaleDateString("vi-VN");
};

const goHome = async () => {
    paymentStore.closeTicketModal();
    await bookingStore.resetAll();
    router.push("/");
};
</script>

<style lang=""></style>

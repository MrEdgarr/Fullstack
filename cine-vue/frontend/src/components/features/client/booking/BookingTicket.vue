<template>
    <dialog class="modal" :class="{ 'modal-open': paymentStore.isTicketInfo }">
        <div class="modal-box">
            <div class="font-semibold">Đặt vé thành công</div>
            <div class="flex items-center border-b border-dashed border-base-content/25 my-2">
                <div>
                    <img
                        src="https://quickchart.io/qr?text=https://localhost:5173&size=100"
                        alt="Fake QR Code"
                    />
                </div>
                <div class="text-sm font-semibold">
                    <p>Mã vé:</p>
                    <span>ACNV9340ZVIEM</span>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-5">
                <div class="col-span-2">
                    <div class="text-lg font-semibold">Rufus: Thủy Quái Học Bơi</div>
                    <div class="text-xs font-medium">2D Phụ Đề - T16</div>
                </div>
                <div>
                    <div class="text-xs">Rạp</div>
                    <div class="text-sm font-medium">Galaxy Quang Trung</div>
                </div>
                <div>
                    <div class="text-xs">Giờ chiếu</div>
                    <div class="text-sm font-medium">21:15</div>
                </div>
                <div>
                    <div class="text-xs">Ngày chiếu</div>
                    <div class="text-sm font-medium">11/05/2026</div>
                </div>
                <div>
                    <div class="text-xs">Phòng chiếu</div>
                    <div class="text-sm font-medium">P2</div>
                </div>
                <div>
                    <div class="text-xs">Ghế đôi</div>
                    <div class="text-sm font-medium">A1, A4, A5</div>
                </div>
                <div>
                    <div class="text-xs">Ghế đơn</div>
                    <div class="text-sm font-medium">J1, J2, J3, J4</div>
                </div>
                <div>
                    <div class="text-xs">Đồ ăn x Thức uống</div>
                    <div class="text-sm font-medium">
                        <div>1xCombo 1</div>
                        <div>1xCombo 1</div>
                        <div>1xCombo 1</div>
                    </div>
                </div>
                <div>
                    <div class="text-xs">Thanh toán</div>
                    <div class="text-sm font-medium">VNPAY</div>
                </div>
            </div>
            <div class="mt-2 border-t border-dashed border-base-content/25 pt-2">
                <div class="flex justify-between font-medium text-sm">
                    <div>Voucher (20%)</div>
                    <div>-15.000đ</div>
                </div>
                <div class="flex justify-between font-medium text-sm">
                    <div>Tổng cộng:</div>
                    <div>145.000đ</div>
                </div>
            </div>

            <div class="modal-action">
                <form method="dialog">
                    <button class="btn btn-ghost" @click="paymentStore.closeTicketModal">
                        Trang chủ
                    </button>
                    <button class="btn btn-primary" :class="{ 'btn-disabled': !isAgreed }">
                        Xem vé
                    </button>
                </form>
            </div>
        </div>
    </dialog>
</template>
<script setup>
import { useBookingStore } from "@/stores/booking";
import { formatCurrency } from "@/utils/helpers/formatCurrency";

const bookingStore = useBookingStore();
const { totalPrice, voucherPrice, finalPrice } = storeToRefs(bookingStore);
const seatStore = bookingStore.seatStore;
const comboStore = bookingStore.comboStore;
const paymentStore = bookingStore.paymentStore;

const isAgreed = ref(false);
</script>
<style lang=""></style>

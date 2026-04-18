<template>
    <section class="card bg-base-100 border border-base-300 card-sm">
        <div class="card-body overflow-x-auto">
            <table class="table">
                <thead>
                    <tr>
                        <th>Combo</th>
                        <th>Giá tiền</th>
                        <th>Số lượng</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="combo in COMBOS_DATA" :key="combo.id">
                        <td class="text-xs md:text-base">{{ combo.name }}</td>
                        <td class="text-xs md:text-base">{{ formatCurrency(combo.price) }}</td>
                        <td>
                            <div class="flex items-center gap-3">
                                <button
                                    @click="comboStore.decreaseCombo(combo.id)"
                                    :disabled="getQty(combo.id) === 0"
                                    class="btn btn-xs md:btn-sm btn-circle transition-all"
                                    :class="getQty(combo.id) === 0 ? 'btn-disabled' : 'btn-ghost'"
                                >
                                    −
                                </button>
                                <span class="text-center md:w-5">{{ getQty(combo.id) }}</span>
                                <button
                                    @click="comboStore.increaseCombo(combo.id)"
                                    :disabled="getQty(combo.id) === 10"
                                    class="btn btn-xs md:btn-sm btn-circle transition-all"
                                    :class="getQty(combo.id) === 10 ? 'btn-disabled' : 'btn-ghost'"
                                >
                                    +
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </section>
</template>
<script setup>
import { useBookingStore } from "@/stores/booking";
import { COMBOS_DATA } from "@/utils/constants/combosData";
import { formatCurrency } from "@/utils/helpers/formatCurrency";

const bookingStore = useBookingStore();
const comboStore = bookingStore.comboStore;

const getQty = (id) => comboStore.selectedCombos[id] || 0;
</script>
<style lang=""></style>

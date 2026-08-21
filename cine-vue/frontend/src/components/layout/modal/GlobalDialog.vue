<template>
    <dialog class="modal modal-bottom sm:modal-middle" :class="{ 'modal-open': dialogStore.isOpen }">
        <div class="modal-box">
            <h3 class="text-lg font-bold">{{ dialogStore.title }}</h3>
            <p class="py-4">{{ dialogStore.message }}</p>
            <div class="modal-action">
                <button
                    v-if="dialogStore.cancelText"
                    class="btn btn-ghost"
                    @click="dialogStore.handleCancel"
                >
                    {{ dialogStore.cancelText }}
                </button>
                <button class="btn btn-primary" @click="dialogStore.handleConfirm">
                    {{ dialogStore.confirmText }}
                </button>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <!-- Xử lý khi click ra ngoài vùng modal -->
            <button v-if="dialogStore.cancelText" @click="dialogStore.handleCancel">đóng</button>
            <button v-else @click="dialogStore.handleConfirm">đóng</button>
        </form>
    </dialog>
</template>

<script setup>
import { useDialogStore } from "@/stores/app/useDialogStore";
const dialogStore = useDialogStore();
</script>

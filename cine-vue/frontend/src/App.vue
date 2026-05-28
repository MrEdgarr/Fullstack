<template>
    <BaseServerConnectionLoading />
    <RouterView v-if="isAppReady" />
</template>

<script setup>
import { onMounted, ref } from "vue";
import BaseServerConnectionLoading from "@/components/common/BaseServerConnectionLoading.vue";
import api from "@/_services/api";
import { useServerConnectionStore } from "@/stores/app/useServerConnectionStore";

const isAppReady = ref(false);
const serverConnectionStore = useServerConnectionStore();

serverConnectionStore.showImmediately("Đang khởi động máy chủ...");

onMounted(async () => {
    try {
        await api.get("/health", {
            skipServerLoading: true,
        });
    } catch (error) {
        console.warn("Không thể kiểm tra kết nối server trước khi mở app.", error);
    } finally {
        isAppReady.value = true;
        serverConnectionStore.hideImmediately();
    }
});
</script>

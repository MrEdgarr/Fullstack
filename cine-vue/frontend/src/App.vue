<template>
    <BaseServerConnectionLoading />
    <RouterView />
</template>

<script setup>
import { onMounted } from "vue";
import { clearExpiredData } from "@/utils/helpers/storage";

onMounted(() => {
    // Dọn dẹp rác localStorage (những dữ liệu đã quá hạn) khi App khởi động
    clearExpiredData();
});
</script>

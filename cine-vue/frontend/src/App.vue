<template>
    <GlobalDialog />
    <GlobalToast />
    <BaseServerConnectionLoading />
    <RouterView />
</template>

<script setup>
import { onMounted } from "vue";
import { clearExpiredData } from "@/utils/helpers/storage";
import GlobalToast from "@/components/layout/toast/GlobalToast.vue";
import GlobalDialog from "@/components/layout/modal/GlobalDialog.vue";

onMounted(() => {
    // Dọn dẹp rác localStorage (những dữ liệu đã quá hạn) khi App khởi động
    clearExpiredData();
});
</script>

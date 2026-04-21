<template>
    <div class="container">
        <div class="hero p-5 mb-5 font-bold text-lg uppercase tracking-widest">Tin Khuyến Mãi</div>
        <div
            class="grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
            <div
                class="md:bg-background h-full cursor-pointer transition-shadow md:overflow-hidden md:rounded-lg md:shadow-md md:hover:shadow-lg"
                v-for="n in 8"
                :key="n"
            >
                <div class="h-full">
                    <div class="flex h-full flex-col">
                        <div class="sm:w-full">
                            <div class="overflow-hidden rounded-lg md:rounded-none">
                                <div class="relative block">
                                    <img
                                        alt="Mua vé Lotte Cinema săn bắp nước miễn phí trên MoMo!"
                                        src="https://homepage.momocdn.net/blogscontents/momo-amazone-s3-api-240809141324-638588096046049571.jpg"
                                    />
                                </div>
                            </div>
                        </div>
                        <div
                            class="relative flex flex-1 flex-col sm:w-full sm:flex-auto sm:pb-7 md:px-4"
                        >
                            <div
                                class="line-clamp-2 pt-2 pr-2 text-sm font-semibold sm:pt-2 sm:pr-0 sm:pb-1"
                            >
                                Mua vé Lotte Cinema săn bắp nước miễn phí trên MoMo!
                            </div>
                            <div
                                class="hidden items-center sm:absolute sm:bottom-2 sm:flex md:left-4"
                            >
                                <span class="text-base-content inline-block text-xs">
                                    09/08/2024</span
                                >
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref } from "vue";

const activeTab = ref("all");

const promotions = ref([
    {
        id: 1,
        title: "Ưu đãi bỏng ngô tháng 4",
        description: "Mua 1 bắp lớn tặng 1 nước ngọt size L vào mỗi thứ 2 hàng tuần.",
        image: "https://picsum.photos/id/431/600/400",
        tag: "Ẩm thực",
        expiry: "Còn 5 ngày",
        type: "food",
    },
    {
        id: 2,
        title: "Đồng giá vé 45k",
        description: "Áp dụng cho học sinh, sinh viên khi đặt vé qua ứng dụng vào khung giờ sáng.",
        image: "https://picsum.photos/id/250/600/400",
        tag: "Vé phim",
        expiry: "Hết hạn: 30/04",
        type: "ticket",
    },
    // Thêm các khuyến mãi khác...
]);
</script>

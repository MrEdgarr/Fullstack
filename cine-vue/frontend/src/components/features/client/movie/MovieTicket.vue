<template>
    <div class="grid grid-cols-12 gap-2.5">
        <div class="card bg-base-100 border border-base-300 card-sm col-span-6 md:col-span-4">
            <div class="card-body">
                <div class="flex items-center justify-between pb-2 text-sm md:text-base">
                    <span>1. Vi tri</span>
                    <BaseIcon name="calendar" />
                </div>
                <div>
                    <select class="select md:select-md select-sm w-full" required>
                        <option disabled selected hidden value="">Pick a color</option>
                        <option>Crimson</option>
                        <option>Amber</option>
                        <option>Velvet</option>
                    </select>
                </div>
            </div>
        </div>
        <div
            class="card bg-base-100 border border-base-300 card-sm order-2 col-span-12 md:order-0 md:col-span-4"
        >
            <div class="card-body">
                <div class="flex items-center justify-between pb-2 text-sm md:text-base">
                    <span>2. Ngay</span>
                    <BaseIcon name="calendar" />
                </div>
                <div>
                    <select class="select md:select-md select-sm w-full" required>
                        <option disabled selected hidden value="">Chon Phim</option>
                        <option>Crimson</option>
                        <option>Amber</option>
                        <option>Velvet</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="card bg-base-100 border border-base-300 card-sm col-span-6 md:col-span-4">
            <div class="card-body">
                <div class="flex items-center justify-between pb-2 text-sm md:text-base">
                    <span>3. Rap</span>
                    <BaseIcon name="calendar" />
                </div>
                <div>
                    <select class="select md:select-md select-sm w-full" required>
                        <option disabled selected hidden value="">Chon rap</option>
                        <option>Crimson</option>
                        <option>Amber</option>
                        <option>Velvet</option>
                        <option disabled>Pick a color</option>
                        <option>Crimson</option>
                        <option>Amber</option>
                        <option>Velvet</option>
                    </select>
                </div>
            </div>
        </div>
    </div>
    <div class="card bg-base-100 card-sm mt-5">
        <div
            class="collapse collapse-arrow border border-base-300 rounded-none"
            v-for="cinema in cinemaBrands"
        >
            <input type="checkbox" />
            <div class="collapse-title">
                <div class="flex gap-5">
                    <img :src="cinema.logo" alt="" class="w-10" />
                    <div>
                        <div class="text-sm font-semibold md:text-base">{{ cinema.name }}</div>
                        <div class="text-base-content/50 text-xs md:text-sm">
                            {{ cinema.branchCount }}
                        </div>
                    </div>
                </div>
            </div>
            <div class="collapse-content pb-0 text-sm">
                <div
                    class="collapse-arrow border-b-base-300 collapse rounded-none border-b"
                    v-for="branch in cinema.branches"
                >
                    <input type="checkbox" />
                    <div class="collapse-title">
                        <div class="text-sm md:text-base">{{ branch.name }}</div>
                    </div>
                    <div class="collapse-content text-sm">
                        <div class="text-base-content/50">
                            {{ branch.address }}
                        </div>
                        <div v-for="format in branch.formats">
                            <div class="font-medium pt-2">{{ format.type }}</div>
                            <div class="mt-2.5 flex flex-wrap items-center justify-start gap-1">
                                <router-link
                                    to="/booking"
                                    class="btn btn-outline md:btn-sm btn-xs btn-primary"
                                    v-for="slot in format.slots"
                                >
                                    {{ slot.time }}
                                </router-link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
const cinemaBrands = [
    {
        id: 1,
        name: "Cinestar",
        logo: "https://cinestar.com.vn/assets/images/logo-meta.png", // Thay link logo thật
        branchCount: 2,
        branches: [
            {
                name: "Cinestar Quốc Thanh",
                address: "271 Nguyễn Trãi, P. Nguyễn Cư Trinh, Q.1, Tp. Hồ Chí Minh",
                formats: [{ type: "2D Phụ Đề Việt", slots: [{ time: "08:20", price: "95K" }] }],
            },
            {
                name: "Cinestar Satra Quận 6",
                address: "1466 Đ. Võ Văn Kiệt, Phường 1, Quận 6, Hồ Chí Minh",
                formats: [
                    {
                        type: "2D Phụ Đề Việt",
                        slots: [
                            { time: "08:10", price: "45K" },
                            { time: "12:15", price: "69K" },
                            { time: "14:00", price: "69K" },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 2,
        name: "CGV Cinemas",
        logo: "https://cdn.moveek.com/storage/media/cache/square/524ba157cd271c9c24d15f367a57c13abc26af06.jpg",
        branchCount: 20,
        note: "Nhấn vào suất chiếu để chuyển sang Zalopay chọn ghế và thanh toán.",
        branches: [
            {
                name: "CGV Aeon Bình Tân",
                address: "Tầng 3, TTTM Aeon Mall Bình Tân, Q. Bình Tân, TP. Hồ Chí Minh",
                formats: [{ type: "2D Lồng Tiếng", slots: [{ time: "17:30", price: "" }] }],
            },
            {
                name: "CGV Aeon Tân Phú",
                address: "Lầu 3, Aeon Mall 30 Bờ Bao Tân Thắng, Q. Tân Phú, Tp. Hồ Chí Minh",
                formats: [
                    {
                        type: "2D Lồng Tiếng",
                        slots: [
                            { time: "18:40", price: "" },
                            { time: "20:40", price: "" },
                            { time: "22:40", price: "" },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 3,
        name: "Beta Cine",
        logo: "https://cdn.moveek.com/storage/media/cache/tiny/5fffb2fcaf3c1018282624.png",
        branchCount: 20,
        note: "Nhấn vào suất chiếu để chuyển sang Zalopay chọn ghế và thanh toán.",
        branches: [
            {
                name: "CGV Aeon Bình Tân",
                address: "Tầng 3, TTTM Aeon Mall Bình Tân, Q. Bình Tân, TP. Hồ Chí Minh",
                formats: [{ type: "2D Lồng Tiếng", slots: [{ time: "17:30", price: "" }] }],
            },
            {
                name: "CGV Aeon Tân Phú",
                address: "Lầu 3, Aeon Mall 30 Bờ Bao Tân Thắng, Q. Tân Phú, Tp. Hồ Chí Minh",
                formats: [
                    {
                        type: "2D Lồng Tiếng",
                        slots: [
                            { time: "18:40", price: "" },
                            { time: "20:40", price: "" },
                            { time: "22:40", price: "" },
                        ],
                    },
                ],
            },
        ],
    },
];
</script>
<style></style>
